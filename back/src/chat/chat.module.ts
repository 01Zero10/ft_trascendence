import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { RoomMessages } from "./roomsMessages.entity";
import { User } from "../user/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { Rooms } from "./rooms.entity";
import { PrivateMessages } from "./privateMessages.entity";
import { ChatGateWay } from "./chat.gateway";
import { BanOrMute } from "./banOrMute.entity";
import { UserService } from "src/user/user.service";
import { Friendship } from "src/user/friendship.entity";
import { UsersModule } from "src/user/user.module";
import { DirectRooms } from "./directRooms.entity";

@Module({
    imports: [TypeOrmModule.forFeature([RoomMessages, PrivateMessages, User, Rooms, DirectRooms, BanOrMute]),
    JwtModule.register({
        secret: "Segreto243",
        signOptions: {expiresIn: "1d",}
      }), UsersModule],
    providers: [ChatGateWay, ChatService, User],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule{}