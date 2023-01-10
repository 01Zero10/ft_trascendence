import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { NavigationService } from "./navigation.service";

@Controller("navigation")
export class NavigationController{
    constructor(
        private readonly navigationService: NavigationService,
    ){}
    
    @Get('notifications/:client')
    async GetNotifications(@Param('client') client: string){
        return await this.navigationService.getNotifications(client);
    }

    @Post('notifications/seen')
    async MarkSeen(@Body('client') client: string){
      await this.navigationService.markSeen(client);
    }

    @Post('inviteToGame')
    async InviteToGame(@Body('client') client: string, @Body('userToPlayWith') userToPlayWith: string){
        await this.navigationService.inviteToGame(client, userToPlayWith);
    }

    @Get('removeNotif/:client')
    async RemoveNotif(@Param('client') client: string){
        await this.navigationService.removeNotif(client);
    }
}