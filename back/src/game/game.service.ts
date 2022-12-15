import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user";
import { Repository } from "typeorm";
import { GameGateWay } from "./game.gateway";
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
        @Inject(forwardRef(() => GameGateWay)) private readonly gameGateway: GameGateWay
        ){this.mapPlRoom = new Map<string, plRoom>()}

    async getMatches(client: string){
        return await this.matchRepository.find({ where : [{ player1: client}, {player2: client} ]})
    }

    async getClassicRunningMatches(){
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
                leftPlayer: {...defaultPlayer, username: client, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                rightPlayer:{...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                ball: {...defaultBall}, leftPoint: 0, rightPoint: 0}
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
        this.handleLeavePlayRoom(client).then();
    }

    async handleLeavePlayRoom(client: string){
        let playRoom = await this.runningMatches
        .createQueryBuilder('playroom')
        .where("playroom.player1 = :client_n", { client_n: client })
        .orWhere("playroom.player2 = :client_n", { client_n: client })
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
        this.mapPlRoom.get(namePlayRoom).leftPlayer = {...defaultPlayer, y: canvasHeight / 2 - defaultPlayer.height / 2}
        this.mapPlRoom.get(namePlayRoom).rightPlayer = {...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}
        await this.ballDirectionAtRestart(namePlayRoom)
        return this.mapPlRoom.get(namePlayRoom);
    }

    async getPlayRoomByName(playRoom: string){
        return this.runningMatches.findOne({where: {playRoom: playRoom}});
    }

    async setKeysPlayerPress(namePlayRoom: string, side: string, dir: number=1){
        console.log("left === ", this.mapPlRoom.get(namePlayRoom).leftPlayer.username);
        console.log("right === ", this.mapPlRoom.get(namePlayRoom).rightPlayer.username);
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
        console.log(ball.dx)
        if (leftPlayer){
            return ((ball.y + ball.height) + ball.dy > leftPlayer.y + leftPlayer.width &&
                ball.y + ball.dy <= (leftPlayer.y + leftPlayer.height) + leftPlayer.width)
        }
        else{
            return (((ball.y + ball.width) + ball.height) + ball.dy > rightPlayer.y  &&
                (ball.y + ball.width) + ball.dy < (rightPlayer.y + rightPlayer.height))
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
            return roomSaved.player1;
        return roomSaved.player2;
    }
}