import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rooms } from "src/chat/rooms.entity";
import { NavigationGateWay } from "src/navigation/navigation.gateway";
import { NavigationModule } from "src/navigation/navigation.module";
import { NavigationService } from "src/navigation/navigation.service";
import { Notifications } from "src/navigation/notifications.entity";
import { Friendship } from "./friendship.entity";
import { Online } from "./online.entity";
import { UsersController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Rooms, Friendship, Online, Notifications]),
  JwtModule.register({
    secret: "Segreto243",
    signOptions: {expiresIn: "1d",}
  })
],
  providers: [UserService, NavigationGateWay, NavigationService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UsersModule {}
