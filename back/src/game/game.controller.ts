import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { GameService } from "./game.service";

@Controller("game")
export class GameController{
    constructor(private readonly gameService: GameService) {}

    @Get('getMatches/:client')
    async getMatches(@Param('client') client: string){
        return await this.gameService.getMatches(client);
    }

    @Get('getClassicRunningMatches')
    async GetClassicRunningMatches(){
        return await this.gameService.getClassicRunningMatches();
    }

    @Get('getAdvancedRunningMatches')
    async GetAdvancedRunningMatches(){
        return await this.gameService.getAdvancedRunningMatches();
    }

    @Get('getLeaderBoard')
    async GetLeaderBoard(){
        return await this.gameService.getLeaderBoard();
    }

    @Get('test/:winner')
    async getTest(@Param('winner') winner: string){
        return await this.gameService.updatePosition(winner);
    }

    @Post('createDirectGame')
    async CreateDirectGame(@Body('client') client: string, @Body('userToPlayWith') userToPlayWith: string){
        await this.gameService.createDirectGame(client, userToPlayWith);
    }

    @Get('checkInvite/:client')
    async CheckInvite(@Param('client') client: string){
        console.log("passaggio 1");
        console.log(await this.gameService.checkInvite(client))
       return await this.gameService.checkInvite(client);
    }

    @Post('acceptGameRequest')
    async AcceptGameRequest(@Body('client') client: string, @Body('sender') sender: string){
      await this.gameService.acceptGameRequest(client)//, sender);
      //DA COMPLETARE
    }
}