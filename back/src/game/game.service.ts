import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match } from "./match.entity";

@Injectable()
export class GameService{
    constructor(
        @InjectRepository(Match) 
        private matchRepository: Repository<Match>
    ){}

    async getMatches(client: string){
        return await this.matchRepository.find({ where : [{ player1: client}, {player2: client} ]})
    }
}