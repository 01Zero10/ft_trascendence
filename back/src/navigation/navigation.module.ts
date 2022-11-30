import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NavigationController } from "./navigation.controller";
import { NavigationService } from "./navigation.service";
import { Notifications } from "./notifications.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Notifications])],
    providers: [NavigationService],
    controllers: [NavigationController],
    exports: [NavigationService],
})
export class NavigationModule{}