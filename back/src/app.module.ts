import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { User } from "./user";
import { UsersModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AuthController } from "./auth/auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ChatModule } from "./chat/chat.module";
import { Chat } from "./chat/chat.entity";
import { ChatGateWay } from "./chat/chat.gateway";
import { ChatController } from "./chat/chat.controller";
import { GameModule } from "./game/game.module";
import { Match } from "./game/match.entity";
import { Friendship } from "./user/friendship.entity";
import { GameGateWay } from "./game/game.gateway";
import { NavigationModule } from "./navigation/navigation.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      username: "postgres",
      password:  "mysecretpassword",
      database:  "nestjs",
      entities: [User, Chat, Match, Friendship],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ChatModule,
    GameModule,
    NavigationModule,
    JwtModule.register({
      secret: "Segreto243",
      signOptions: {expiresIn: "99d",}
    })
  ],
  controllers: [AuthController, ChatController], 
  providers: [],
}) 
export class AppModule {}
