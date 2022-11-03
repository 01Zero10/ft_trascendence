import { Controller, Get, Param, Post } from "@nestjs/common";
import { GameService } from "./game.service";

@Controller("game")
export class GameController{
    constructor(private readonly gameService: GameService) {}

    @Get('getMatches/:client')
    async getMatches(@Param('client') client: string){
        return await this.gameService.getMatches(client);
    }
}