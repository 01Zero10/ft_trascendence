import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user";
import { GameController } from "./game.controller";
import { GameGateWay } from "./game.gateway";
import { GameService } from "./game.service";
import { Leaderboard } from "./leaderboard.entity";
import { Match } from "./match.entity";
import { RunningMatch } from "./runningMatch.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Match, RunningMatch, User, Leaderboard])],
    providers: [GameGateWay, GameService],
    controllers: [GameController],
    exports: [GameService],
})
export class GameModule{}