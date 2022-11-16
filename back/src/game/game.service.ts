import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user";
import { Repository } from "typeorm";
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
    leftPoint: number
    rightPoint: number
    idInterval?: object;
}

const canvasHeight = 750
const canvasWidth = 1500
const defaultPlayer = { x: 0, y: 0, height: 150, width: 20, up: false, down: false }
const defaultBall = { x: canvasWidth / 2, y: canvasHeight / 2, radius: 20, dx: 0, dy: 0, direction: "" }
const dir: Array<string> = ["l", "r"];
const array_dir_y: Array<number> = [-3, 3];

@Injectable()
export class GameService{
    private mapPlRoom: Map<string, plRoom>
    constructor(
        @InjectRepository(Match) private matchRepository: Repository<Match>,
        @InjectRepository(RunningMatch) private runningMatches: Repository<RunningMatch>,
        @InjectRepository(User) private userRepository: Repository<User>
        ){this.mapPlRoom = new Map<string, plRoom>()}
        

    async getMatches(client: string){
        return await this.matchRepository.find({ where : [{ player1: client}, {player2: client} ]})
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

    // async setKeysPlayer(namePlayRoom: string, side: string, dir: number=1){
    //     console.log("set keys ", this.mapPlRoom.get(namePlayRoom));
    //     if (side === 'left'){
    //         if (dir > 0)
    //             this.mapPlRoom.get(namePlayRoom).leftPlayer.up = !this.mapPlRoom.get(namePlayRoom).leftPlayer.up;
    //         else
    //             this.mapPlRoom.get(namePlayRoom).leftPlayer.down = !this.mapPlRoom.get(namePlayRoom).leftPlayer.down;
    //     }
    //     else {
    //         if (dir > 0)
    //             this.mapPlRoom.get(namePlayRoom).rightPlayer.up = !this.mapPlRoom.get(namePlayRoom).rightPlayer.up;
    //         else
    //             this.mapPlRoom.get(namePlayRoom).rightPlayer.down = !this.mapPlRoom.get(namePlayRoom).rightPlayer.down;
    //     }
    // }

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

    updateIdInterval(namePlayRoom: string, id: object){
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
        //delete this.mapPlRoom[namePlayRoom];
    }

    async sleep(time: number) {
        await new Promise(f => setTimeout(f, time * 1000));
      }

    // async startTick(namePlayRoom: string){
    //     const playRoom = this.mapPlRoom.get(namePlayRoom);

    // }
}