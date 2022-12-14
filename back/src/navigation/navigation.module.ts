import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user";
import { Friendship } from "src/user/friendship.entity";
import { Online } from "src/user/online.entity";
import { UserService } from "src/user/user.service";
import { NavigationController } from "./navigation.controller";
import { NavigationGateWay } from "./navigation.gateway";
import { NavigationService } from "./navigation.service";
import { Notifications } from "./notifications.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User, Notifications, Friendship, Online]),
    JwtModule.register({
        secret: "Segreto243",
        signOptions: {expiresIn: "1d",}
      })],
    providers: [NavigationService],
    controllers: [NavigationController],
    exports: [NavigationService],
})
export class NavigationModule{}