import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { NavigationService } from "./navigation.service";

@Controller("navigation")
export class NavigationController{
    constructor(
        private readonly navigationService: NavigationService,
    ){}
    
    @Get('notifications/:client')
    async GetNotifications(@Param('client') client: string){
        console.log(client)
        return this.navigationService.getNotifications(client);
    }

    @Post('notifications/seen')
    async MarkSeen(@Body('client') client: string){
      await this.navigationService.markSeen(client);
    }
}