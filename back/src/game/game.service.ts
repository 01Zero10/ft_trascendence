import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user";
import { Repository } from "typeorm";
import { GameGateWay } from "./game.gateway";
import { Leaderboard } from "./leaderboard.entity";
import { Match } from "./match.entity";
import { RunningMatch } from "./runningMatch.entity";

type Player = {
    username: string
    x: number
    y: number
    height: number
    width: number
    up: boolean;
    down: boolean;
}

type Ball = {
    x: number
    y: number
    width: number
    height
    dx: number
    dy: number
    //start: boolean
    direction: string | null
}

interface plRoom {
    leftPlayer: Player;
    rightPlayer: Player;
    ball: Ball;
    leftPoint: number;
    rightPoint: number;
    idInterval?: ReturnType<typeof setInterval>;
    type?: string;
}

const canvasHeight = 500
const canvasWidth = 1000
const defaultPlayer = {username:"", x: 0, y: 0, height: 100, width: 20, up: false, down: false }
const defaultBall = { x: canvasWidth / 2 - 15, y: canvasHeight / 2 - 15, width: 30, height:30, dx: 0, dy: 0, direction: "" }
const dir: Array<string> = ["l", "r"];
const array_dir_y: Array<number> = [-3, 3];

@Injectable()
export class GameService{
    /*private*/ mapPlRoom: Map<string, plRoom>
    constructor(
        @InjectRepository(Match) private matchRepository: Repository<Match>,
        @InjectRepository(RunningMatch) private runningMatches: Repository<RunningMatch>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Leaderboard) private leaderboardRepository: Repository<Leaderboard>,
        @Inject(forwardRef(() => GameGateWay)) private readonly gameGateway: GameGateWay
        ){this.mapPlRoom = new Map<string, plRoom>()}

    async getMatches(client: string){
        return await this.matchRepository.find({ where : [{ player1: client}, {player2: client} ]})
    }

    async getClassicRunningMatches(){
        const string = 'invited'
        return await this.runningMatches
        .createQueryBuilder('match')
        .where({typo: 'classic'})
        .andWhere("match.invited != :string_n", {string_n: string})
        .select(['match.playRoom','match.player1', 'match.player2', 'match.avatar1', 'match.avatar2'])
        .getMany();
    }

    async getAdvancedRunningMatches(){
        return await this.runningMatches
        .createQueryBuilder('match')
        .where({typo: 'advanced'})
        .select(['match.playRoom','match.player1', 'match.player2', 'match.avatar1', 'match.avatar2'])
        .getMany();
    }

    async getMatchByName(namePlayRoom: string) {
        return this.mapPlRoom.get(namePlayRoom);
    }

    async createOrJoinPlayRoom(client: string, avatar: string, type: string){
        console.log('CREATEORJOIN');
        let playRoom = await this.runningMatches
        .createQueryBuilder('runningMatch')
        .where({typo: type})
        .andWhere({player2: ''})
        .getOne()
        if (playRoom === null){
            playRoom = this.runningMatches.create({playRoom: 'heldBy' + client, typo: type, player1: client, leftSide: client, avatar1: avatar});
            await this.runningMatches.save(playRoom).then();
            this.mapPlRoom.set('heldBy' + client, {
                leftPlayer: {...defaultPlayer, username: client, y: canvasHeight / 2 - defaultPlayer.height / 2},
                rightPlayer:{...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                ball: {...defaultBall}, type: type, leftPoint: 0, rightPoint: 0}
                )
            return {namePlayRoom: 'heldBy' + client, side: 'left'};
        }
        playRoom.player2 = client;
        playRoom.avatar2 = avatar;
        playRoom.rightSide = client;
        this.mapPlRoom.get(playRoom.playRoom).rightPlayer.username = client;
        await this.runningMatches.save(playRoom);
        return {namePlayRoom: playRoom.playRoom, side: "right", left: playRoom.leftSide, right: playRoom.rightSide};
    }

    async handleLeaveQueue(client: string){
        const string = 'invited'
        let playRoom = await this.runningMatches
        .createQueryBuilder('match')
        .where({player1: client})
        .andWhere("match.invited != :string_n", {string_n: string})
        //.andWhere({player2: ''})
        .getOne()
        console.log("leaveQueue", playRoom, client)
        if (playRoom !== null)
        {
            await this.runningMatches.remove(playRoom);
            return ;
        }
        this.handleLeavePlayRoom(client).then();
    }

    async handleLeavePlayRoom(client: string){
        const string = 'invited'
        let playRoom = await this.runningMatches
        .createQueryBuilder('playroom')
        .where("playroom.player1 = :client_n", { client_n: client })
        .orWhere("playroom.player2 = :client_n", { client_n: client })
        //.andWhere("match.invited != :string_n", {string_n: string})
        //da capire come concatenare or and and
        .getOne()
        
        if (playRoom)
        {
            clearInterval(this.mapPlRoom.get(playRoom.playRoom).idInterval)
            await this.gameGateway.handleLeftGame(playRoom.playRoom)
            await this.matchRepository.save({player1: playRoom.player1,
                avatar1: playRoom.avatar1,
                player2: playRoom.player2,
                avatar2: playRoom.avatar2,
                points1: (playRoom.player1 === client ? this.mapPlRoom.get(playRoom.playRoom).leftPoint : -42),
                points2: (playRoom.player2 === client ? this.mapPlRoom.get(playRoom.playRoom).rightPoint : -42),
            })
            await this.runningMatches.remove(playRoom);
        }
    }

    async generateBallDirection(namePlayRoom: string){
        console.log(namePlayRoom);
        console.log(this.mapPlRoom.get(namePlayRoom));
        this.mapPlRoom.get(namePlayRoom).ball.dy= array_dir_y[Math.round(Math.random())];
       this.mapPlRoom.get(namePlayRoom).ball.direction = dir[Math.round(Math.random())] as "l" | "r";
        this.mapPlRoom.get(namePlayRoom).ball.direction = "l"
        if (this.mapPlRoom.get(namePlayRoom).ball.direction === 'r')
            this.mapPlRoom.get(namePlayRoom).ball.dx += 3;
        else
            this.mapPlRoom.get(namePlayRoom).ball.dx -= 3;
        return this.mapPlRoom.get(namePlayRoom);
    }

    async ballDirectionAtRestart(namePlayRoom: string){
        const prevDir = this.mapPlRoom.get(namePlayRoom).ball.direction
        this.mapPlRoom.get(namePlayRoom).ball = {...defaultBall}
        if (prevDir === "r"){
            this.mapPlRoom.get(namePlayRoom).ball.direction = "l"
            this.mapPlRoom.get(namePlayRoom).ball.dx -= 3;
        }
        else{
            this.mapPlRoom.get(namePlayRoom).ball.direction = "r"
            this.mapPlRoom.get(namePlayRoom).ball.dx += 3;
        }
        this.mapPlRoom.get(namePlayRoom).ball.dy= array_dir_y[Math.round(Math.random())];
    }

    async restart(namePlayRoom: string){
        this.mapPlRoom.get(namePlayRoom).leftPlayer = {...defaultPlayer, username:this.mapPlRoom.get(namePlayRoom).leftPlayer.username, y: canvasHeight / 2 - defaultPlayer.height / 2}
        this.mapPlRoom.get(namePlayRoom).rightPlayer = {...defaultPlayer,username:this.mapPlRoom.get(namePlayRoom).rightPlayer.username, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}
        await this.ballDirectionAtRestart(namePlayRoom)
        return this.mapPlRoom.get(namePlayRoom);
    }

    async getPlayRoomByName(playRoom: string){
        return this.runningMatches.findOne({where: {playRoom: playRoom}});
    }

    async setKeysPlayerPress(namePlayRoom: string, side: string, dir: number=1){
        if (side === this.mapPlRoom.get(namePlayRoom).leftPlayer.username){
            if (dir > 0)
                this.mapPlRoom.get(namePlayRoom).leftPlayer.up = true;
            else
                this.mapPlRoom.get(namePlayRoom).leftPlayer.down = true;
        }
        else {
            if (dir > 0)
                this.mapPlRoom.get(namePlayRoom).rightPlayer.up = true;
            else
                this.mapPlRoom.get(namePlayRoom).rightPlayer.down = true;
        }
    }

    async setKeysPlayerRelease(namePlayRoom: string, side: string, dir: number=1){
        if (side === this.mapPlRoom.get(namePlayRoom).leftPlayer.username){
            if (dir > 0)
                this.mapPlRoom.get(namePlayRoom).leftPlayer.up = false;
            else
                this.mapPlRoom.get(namePlayRoom).leftPlayer.down = false;
        }
        else {
            if (dir > 0)
                this.mapPlRoom.get(namePlayRoom).rightPlayer.up = false;
            else
                this.mapPlRoom.get(namePlayRoom).rightPlayer.down = false;
        }
    }

    checkPlayerCollision(ball: Ball, rightPlayer?: Player, leftPlayer?: Player){
        if (leftPlayer){
            return ((ball.y + ball.height) + ball.dy > leftPlayer.y + leftPlayer.width &&
                ball.y + ball.dy <= (leftPlayer.y + leftPlayer.height) + leftPlayer.width)
        }
        else{
            return (((ball.y + ball.width) + ball.height) + ball.dy > rightPlayer.y  &&
                (ball.y + ball.width) + ball.dy < (rightPlayer.y + rightPlayer.height))
        }
    }

    advancedMode(namePlayRoom: string){
        if (this.mapPlRoom.get(namePlayRoom).type === "advanced"){
            if (this.mapPlRoom.get(namePlayRoom).ball.height > 1 &&
                this.mapPlRoom.get(namePlayRoom).ball.width > 1)
            {
                this.mapPlRoom.get(namePlayRoom).ball.width = this.mapPlRoom.get(namePlayRoom).ball.width - 1
                this.mapPlRoom.get(namePlayRoom).ball.height = this.mapPlRoom.get(namePlayRoom).ball.height - 1
            }
            else{
                if(this.mapPlRoom.get(namePlayRoom).rightPlayer.height > 10 &&
                    this.mapPlRoom.get(namePlayRoom).leftPlayer.height > 10){
                    this.mapPlRoom.get(namePlayRoom).rightPlayer.height = this.mapPlRoom.get(namePlayRoom).rightPlayer.height - 1
                    this.mapPlRoom.get(namePlayRoom).leftPlayer.height = this.mapPlRoom.get(namePlayRoom).leftPlayer.height - 1
                }
            }
        }
    }

    async updatePlayer(namePlayRoom: string){
        if (this.mapPlRoom.get(namePlayRoom).leftPlayer.up && this.mapPlRoom.get(namePlayRoom).leftPlayer.y >= 5 )
            this.mapPlRoom.get(namePlayRoom).leftPlayer.y += -5;
        if (this.mapPlRoom.get(namePlayRoom).leftPlayer.down && this.mapPlRoom.get(namePlayRoom).leftPlayer.y <= canvasHeight - defaultPlayer.height)
            this.mapPlRoom.get(namePlayRoom).leftPlayer.y += +5;

        if (this.mapPlRoom.get(namePlayRoom).rightPlayer.up && this.mapPlRoom.get(namePlayRoom).rightPlayer.y >= 5)
            this.mapPlRoom.get(namePlayRoom).rightPlayer.y += -5;
        if (this.mapPlRoom.get(namePlayRoom).rightPlayer.down && this.mapPlRoom.get(namePlayRoom).rightPlayer.y <= canvasHeight - defaultPlayer.height)
            this.mapPlRoom.get(namePlayRoom).rightPlayer.y += +5;
        this.mapPlRoom.get(namePlayRoom).ball.x += this.mapPlRoom.get(namePlayRoom).ball.dx;
        this.mapPlRoom.get(namePlayRoom).ball.y += this.mapPlRoom.get(namePlayRoom).ball.dy;
        return(this.mapPlRoom.get(namePlayRoom))
    }

    async updateBall(namePlayRoom: string){
        if (((this.mapPlRoom.get(namePlayRoom).ball.y + this.mapPlRoom.get(namePlayRoom).ball.height) + this.mapPlRoom.get(namePlayRoom).ball.dy  > canvasHeight) || (this.mapPlRoom.get(namePlayRoom).ball.y + this.mapPlRoom.get(namePlayRoom).ball.dy < 0)) {
            this.mapPlRoom.get(namePlayRoom).ball.dy = -this.mapPlRoom.get(namePlayRoom).ball.dy
        }
        if(this.mapPlRoom.get(namePlayRoom).ball.x < this.mapPlRoom.get(namePlayRoom).leftPlayer.x + this.mapPlRoom.get(namePlayRoom).leftPlayer.width) {
            if(this.checkPlayerCollision(this.mapPlRoom.get(namePlayRoom).ball, null, this.mapPlRoom.get(namePlayRoom).leftPlayer)){
                this.mapPlRoom.get(namePlayRoom).ball.dx = -this.mapPlRoom.get(namePlayRoom).ball.dx + 0.25
                this.advancedMode(namePlayRoom);
                if (this.mapPlRoom.get(namePlayRoom).ball.dx > 20)
                    this.mapPlRoom.get(namePlayRoom).ball.dx = 20
            }
            else if(this.mapPlRoom.get(namePlayRoom).ball.x <= 0){
                this.mapPlRoom.get(namePlayRoom).ball.dx = 0
                this.mapPlRoom.get(namePlayRoom).ball.dy = 0
                this.mapPlRoom.get(namePlayRoom).rightPoint += 1
                return 1;
            }
        }
        else if(this.mapPlRoom.get(namePlayRoom).ball.x + this.mapPlRoom.get(namePlayRoom).ball.width >= this.mapPlRoom.get(namePlayRoom).rightPlayer.x) {
            if(this.checkPlayerCollision(this.mapPlRoom.get(namePlayRoom).ball, this.mapPlRoom.get(namePlayRoom).rightPlayer, null)) {
                this.mapPlRoom.get(namePlayRoom).ball.dx = -this.mapPlRoom.get(namePlayRoom).ball.dx - 0.25
                this.advancedMode(namePlayRoom);
                if (this.mapPlRoom.get(namePlayRoom).ball.dx < -20)
                    this.mapPlRoom.get(namePlayRoom).ball.dx = -20
            }
            else if(this.mapPlRoom.get(namePlayRoom).ball.x + this.mapPlRoom.get(namePlayRoom).ball.width  > canvasWidth){
                this.mapPlRoom.get(namePlayRoom).ball.dx = 0
                this.mapPlRoom.get(namePlayRoom).ball.dy = 0
                this.mapPlRoom.get(namePlayRoom).leftPoint += 1
                return 1;
            }
        }
        this.mapPlRoom.get(namePlayRoom).ball.x += this.mapPlRoom.get(namePlayRoom).ball.dx
        this.mapPlRoom.get(namePlayRoom).ball.y += this.mapPlRoom.get(namePlayRoom).ball.dy
        return 0;
    }

    async saveMatch(namePlayRoom: string, leftPoints: number, rightPoints: number){
        const roomToSave = await this.getPlayRoomByName(namePlayRoom);
        const roomSaved = await this.matchRepository.save({player1: roomToSave.player1,
            avatar1: roomToSave.avatar1,
            player2: roomToSave.player2,
            avatar2: roomToSave.avatar2,
            points1: leftPoints,
            points2: rightPoints,
        })
        await this.runningMatches.remove(roomToSave);
        delete this.mapPlRoom[namePlayRoom];
        if (roomSaved.points1 > roomSaved.points2)
        {
            await this.updatePosition(roomSaved.player1);
            return roomSaved.player1;
        }
        await this.updatePosition(roomSaved.player2);
        return roomSaved.player2;
    }

    async createDirectGame(client: string, userToPlayWith: string, type: string){
        console.log('CREATEDIRECTGAME');
        const avatar1 = (await this.userRepository.findOne({ where: {username: client}})).avatar;
        const avatar2 = (await this.userRepository.findOne({ where: {username: userToPlayWith}})).avatar;
        let playRoom = this.runningMatches.create({
            playRoom: 'heldBy' + client,
            typo: type,
            player1: client,
            leftSide: client,
            avatar1: avatar1,
            player2: userToPlayWith,
            rightSide: userToPlayWith,
            avatar2: avatar2,
            invited: 'invited',
        })
        await this.runningMatches.save(playRoom);
        this.mapPlRoom.set('heldBy' + client, {
            leftPlayer: {...defaultPlayer, username: client, y: canvasHeight / 2 - defaultPlayer.height / 2},
            rightPlayer:{...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
            ball: {...defaultBall}, type: type, leftPoint: 0, rightPoint: 0}
            )
    }
    
    // NON SAPPIAMO SE QUESTA PARTE SERVE

    async updatePosition(winner: string){
        const points_to_add = 10;
        let winnerRow = await this.leaderboardRepository
        .createQueryBuilder('board')
        .leftJoin('board.user', 'user')
        .where("user.username = :winner_n", {winner_n: winner})
        .getOne();

        if (!winnerRow){    
            const user = await this.userRepository.findOne({ where: {username: winner}});
            winnerRow = this.leaderboardRepository.create({
                user: user,
                points: points_to_add,
                position: 0,
            })
        }
        else {
            winnerRow.points += points_to_add;
        }

        console.log("step 1 ", winnerRow);
        const all = await this.leaderboardRepository
        .createQueryBuilder('board')
        .leftJoin('board.user', 'user')
        .orderBy('board.points', 'DESC')
        .getMany();

        console.log("step 2 ", all);

        if (!all.length)
        {
            winnerRow.position = 1;
            return await this.leaderboardRepository.save(winnerRow);
        }

        let index = 0;
        while(all[index] && all[index].points >= winnerRow.points)
            index++;
        console.log("step 3 ", all[index]);
        if (!all[index])
        {
            console.log("inside");
            winnerRow.position = all[index - 1].position + 1;
            console.log("inside ", winnerRow);
            return await this.leaderboardRepository.save(winnerRow);
        }
        console.log("step 4");

        winnerRow.position = all[index].position;
        console.log("step 5_1 ", winnerRow);
        console.log("step 5_2 ", all[index]);
        console.log(winnerRow.id);
        console.log(all[index].id);
        // if (winnerRow.user === all[index].user)
        //     index++;
        await this.leaderboardRepository.save(winnerRow);

        while(all[index])
        {
            if (winnerRow.user !== all[index].user){
                all[index].position += 1;
                await this.leaderboardRepository.save(all[index]);
            }
            index++;
        }
    }

    async getLeaderBoard(){
        const board = await this.leaderboardRepository
        .createQueryBuilder('player')
        .leftJoinAndSelect('player.user', 'user')
        .select(['player.points', 'user.avatar', 'user.username', 'user.nickname'])
        .orderBy('player.points', 'DESC')
        .limit(10)
        .getMany();

        return (board);
    }

    async acceptGameRequest(client: string){//, sender: string) {
        const playRoom = await this.runningMatches.findOne({where: [{leftSide: client}, {rightSide: client}]});
        playRoom.invited = 'accepted';
        await this.runningMatches.save(playRoom);
        //DA COMPLETARE
    }

    async checkInvite(client: string){
        console.log("checkTheInvite ", client);
        // const playRoom = await this.runningMatches.findOne({where: [{leftSide: client}, {rightSide: client}]})
        return (await this.runningMatches.findOne({where: [{leftSide: client}, {rightSide: client}]}))
        // return playRoom;
    }

    async getAvatars(namePlayRoom: string){
        const ret = this.runningMatches.createQueryBuilder('match')
        .where({playRoom: namePlayRoom})
        .select(['match.avatar1', 'match.avatar2'])
        .getOne();
    }

    /*async sleep(time: number) {
        await new Promise(f => setTimeout(f, time * 1000));
      }

    // async startTick(namePlayRoom: string){
    //     const playRoom = this.mapPlRoom.get(namePlayRoom);

    // }
*/
}