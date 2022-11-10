import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match } from "./match.entity";
import { RunningMatch } from "./runningMatch.entity";

type Player = {
    x: number
    y: number
    height: number
    width: number
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
}

const canvasHeight = 750
const canvasWidth = 1500
const defaultPlayer = { x: 0, y: 0, height: 150, width: 20 }
const defaultBall = { x: canvasWidth / 2, y: canvasHeight / 2, radius: 20, dx: 0, dy: 0, direction: "" }
const dir: Array<string> = ["l", "r"];
const array_dir_y: Array<number> = [-3, 3];

@Injectable()
export class GameService{
    private mapPlRoom: Map<string, plRoom>
    constructor(
        @InjectRepository(Match) private matchRepository: Repository<Match>,
        @InjectRepository(RunningMatch) private runningMatches: Repository<RunningMatch>,
        ){this.mapPlRoom = new Map<string, plRoom>()}
        

    async getMatches(client: string){
        return await this.matchRepository.find({ where : [{ player1: client}, {player2: client} ]})
    }

    async createOrJoinPlayRoom(client: string, avatar: string){
        let playRoom = await this.runningMatches
        .createQueryBuilder('runningMatch')
        .where({player2: ''})
        .getOne()
        //console.log("playrooomn ==== ", playRoom);
        if (playRoom === null){
            playRoom = this.runningMatches.create({playRoom: 'heldBy' + client, player1: client, leftSide: client, avatar1: avatar});
            this.runningMatches.save(playRoom);
            this.mapPlRoom.set('heldBy' + client, {
                leftPlayer: {...defaultPlayer, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                rightPlayer:{...defaultPlayer, x: canvasWidth - defaultPlayer.width, y: canvasHeight / 2 - defaultPlayer.height / 2}, 
                ball: {...defaultBall}})
            return {namePlayRoom: 'heldBy' + client, side: 'left'};
        }
        playRoom.player2 = client;
        playRoom.avatar2 = avatar;
        playRoom.rightSide = client;
        this.runningMatches.save(playRoom);
        return {namePlayRoom: playRoom.playRoom, side: 'right'};
    }

    async generateBallDirection(namePlayRoom: string){
        console.log('gnereat ', namePlayRoom);
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
        if (prevDir === "r")
            this.mapPlRoom.get(namePlayRoom).ball.dx -= 3;
        else
            this.mapPlRoom.get(namePlayRoom).ball.dx += 3;
        this.mapPlRoom.get(namePlayRoom).ball.dy= array_dir_y[Math.round(Math.random())];
    }

    async restart(namePlayRoom: string){
        this.mapPlRoom.get(namePlayRoom).leftPlayer = {...defaultPlayer}
        this.mapPlRoom.get(namePlayRoom).rightPlayer = {...defaultPlayer}
        this.ballDirectionAtRestart(namePlayRoom)
        return this.mapPlRoom.get(namePlayRoom);
    }


    async getPlayRoomByName(playRoom: string){
        return this.runningMatches.findOne({where: {playRoom: playRoom}});
    }
}