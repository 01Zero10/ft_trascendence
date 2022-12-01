import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user";
import { Repository } from "typeorm";
import { GameGateWay } from "./game.gateway";
import { Leaderboard } from "./leaderboard.entity";
import { Match } from "./match.entity";
import { RunningMatch } from "./runningMatch.entity";

type Player = {
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
    radius: number
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
}

const canvasHeight = 750
const canvasWidth = 1500
const defaultPlayer = { x: 0, y: 0, height: 150, width: 20, up: false, down: false }
const defaultBall = { x: canvasWidth / 2, y: canvasHeight / 2, radius: 20, dx: 0, dy: 0, direction: "" }
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
        console.log('get services')
        return await this.runningMatches
        .createQueryBuilder('match')
        .where({typo: 'classic'})
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

    async createOrJoinPlayRoom(client: string, avatar: string){
        let playRoom = await this.runningMatches
        .createQueryBuilder('runningMatch')
        .where({player2: ''})
        .getOne()
        if (playRoom === null){
            playRoom = this.runningMatches.create({playRoom: 'heldBy' + client, player1: client, leftSide: client, avatar1: avatar});
            await this.runningMatches.save(playRoom);
            this.mapPlRoom.set('heldBy' + client, {
                leftPlayer: {...defaultPlayer, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                rightPlayer:{...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                ball: {...defaultBall}, leftPoint: 0, rightPoint: 0}
                )
            return {namePlayRoom: 'heldBy' + client, side: 'left'};
        }
        playRoom.player2 = client;
        playRoom.avatar2 = avatar;
        playRoom.rightSide = client;
        await this.runningMatches.save(playRoom);
        return {namePlayRoom: playRoom.playRoom, side: 'right'};
    }

    async handleLeaveQueue(client: string){
        console.log('cclient1 ', client);
        
        let playRoom = await this.runningMatches
        .createQueryBuilder()
        .where({player1: client})
        .andWhere({player2: ''})
        .getOne()
        if (playRoom !== null)
        {
            await this.runningMatches.remove(playRoom);
            return ;
        }
        this.handleLeavePlayRoom(client);
    }

    async handleLeavePlayRoom(client: string){
        console.log('cclient2 ', client);

        // let playRoom = await this.runningMatches
        // .findOne({ where : [{player1: client}, {player2: client}]});
        
        let playRoom = await this.runningMatches
        .createQueryBuilder('playroom')
        .where("playroom.player1 = :client_n", { client_n: client })
        .orWhere("playroom.player2 = :client_n", { client_n: client })
        .getOne()
        console.log('p-p-pl = ', playRoom);
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
        this.mapPlRoom.get(namePlayRoom).ball.dy= array_dir_y[Math.round(Math.random())];
        this.mapPlRoom.get(namePlayRoom).ball.direction = dir[Math.round(Math.random())] as "l" | "r";
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
        this.mapPlRoom.get(namePlayRoom).leftPlayer = {...defaultPlayer, y: canvasHeight / 2 - defaultPlayer.height / 2},
        this.mapPlRoom.get(namePlayRoom).rightPlayer = {...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}
        this.ballDirectionAtRestart(namePlayRoom)
        return this.mapPlRoom.get(namePlayRoom);
    }

    async getPlayRoomByName(playRoom: string){
        return this.runningMatches.findOne({where: {playRoom: playRoom}});
    }

    async setKeysPlayerPress(namePlayRoom: string, side: string, dir: number=1){
        if (side === 'left'){
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
        if (side === 'left'){
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

    updateIdInterval(namePlayRoom: string, id: ReturnType<typeof setInterval>){
        this.mapPlRoom.get(namePlayRoom).idInterval = id;
    }

    async updatePlayer(namePlayRoom: string){
        // console.log(namePlayRoom)
        // console.log(this.mapPlRoom.get(namePlayRoom))
        //console.log('entrato update player')
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
        if ((this.mapPlRoom.get(namePlayRoom).ball.y + this.mapPlRoom.get(namePlayRoom).ball.radius) + this.mapPlRoom.get(namePlayRoom).ball.dy > canvasHeight || (this.mapPlRoom.get(namePlayRoom).ball.y - this.mapPlRoom.get(namePlayRoom).ball.radius) + this.mapPlRoom.get(namePlayRoom).ball.dy < 0) {
            this.mapPlRoom.get(namePlayRoom).ball.dy = -this.mapPlRoom.get(namePlayRoom).ball.dy
        }
        if (this.mapPlRoom.get(namePlayRoom).ball.x + this.mapPlRoom.get(namePlayRoom).ball.dx < this.mapPlRoom.get(namePlayRoom).ball.radius) {
            if (this.mapPlRoom.get(namePlayRoom).ball.y > this.mapPlRoom.get(namePlayRoom).leftPlayer.y + this.mapPlRoom.get(namePlayRoom).leftPlayer.width && 
                this.mapPlRoom.get(namePlayRoom).ball.y < (this.mapPlRoom.get(namePlayRoom).leftPlayer.y + this.mapPlRoom.get(namePlayRoom).leftPlayer.height) + this.mapPlRoom.get(namePlayRoom).leftPlayer.width){
                this.mapPlRoom.get(namePlayRoom).ball.dx = -this.mapPlRoom.get(namePlayRoom).ball.dx + 0.25
                if (this.mapPlRoom.get(namePlayRoom).ball.dx > 20){
                    this.mapPlRoom.get(namePlayRoom).ball.dx = 20
                }
            }
            else {
                this.mapPlRoom.get(namePlayRoom).ball.dx = 0
                this.mapPlRoom.get(namePlayRoom).ball.dy = 0
                this.mapPlRoom.get(namePlayRoom).rightPoint += 1
                return 1;
            //props.socket.emit("gol_right", { name: props.clientPaddle.playRoom })
            // startBall() reset
            }
        }
        if (this.mapPlRoom.get(namePlayRoom).ball.x + this.mapPlRoom.get(namePlayRoom).ball.dy > canvasWidth - this.mapPlRoom.get(namePlayRoom).ball.radius) {
            if (this.mapPlRoom.get(namePlayRoom).ball.y > this.mapPlRoom.get(namePlayRoom).rightPlayer.y + this.mapPlRoom.get(namePlayRoom).rightPlayer.width && 
                this.mapPlRoom.get(namePlayRoom).ball.y < (this.mapPlRoom.get(namePlayRoom).rightPlayer.y + this.mapPlRoom.get(namePlayRoom).rightPlayer.height) + this.mapPlRoom.get(namePlayRoom).rightPlayer.width){
                this.mapPlRoom.get(namePlayRoom).ball.dx = -this.mapPlRoom.get(namePlayRoom).ball.dx - 0.25
                if (this.mapPlRoom.get(namePlayRoom).ball.dx < -20){
                    this.mapPlRoom.get(namePlayRoom).ball.dx = -20
                }
            }
            else {
                this.mapPlRoom.get(namePlayRoom).ball.dx = 0
                this.mapPlRoom.get(namePlayRoom).ball.dy = 0
                this.mapPlRoom.get(namePlayRoom).leftPoint += 1
                return 2;
            //props.socket.emit("gol_left", { name: props.clientPaddle.playRoom })
            // startBall() reset
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
            return roomSaved.player1;
        return roomSaved.player2;
    }

    async updatePosition(winner: string){
        const points_to_add = 100;
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

        const all = await this.leaderboardRepository
        .createQueryBuilder('board')
        .leftJoin('board.user', 'user')
        .orderBy('user.points', 'DESC')
        .getMany();

        if (!all.length)
            return await this.leaderboardRepository.save(winnerRow);

        let index = 0;
        while(all[index] && all[index].points >= winnerRow.points)
            index++;
        
        if (!all[index])
        {
            winnerRow.position = all[index - 1].position + 1;
            return await this.leaderboardRepository.save(winnerRow);
        }

        winnerRow.position = all[index].position;
        await this.leaderboardRepository.save(winnerRow);

        while(all[index])
        {
            all[index].position += 1;
            await this.leaderboardRepository.save(all[index]);
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

    async sleep(time: number) {
        await new Promise(f => setTimeout(f, time * 1000));
      }

    // async startTick(namePlayRoom: string){
    //     const playRoom = this.mapPlRoom.get(namePlayRoom);

    // }
}