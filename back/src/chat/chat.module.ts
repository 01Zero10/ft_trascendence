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

@Module({
    imports: [TypeOrmModule.forFeature([RoomMessages, PrivateMessages, User, Rooms, BanOrMute]),
    JwtModule.register({
        secret: "Segreto243",
        signOptions: {expiresIn: "1d",}
      })],
    providers: [ChatService],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule{}