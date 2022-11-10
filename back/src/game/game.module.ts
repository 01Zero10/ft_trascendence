import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { Match } from "./match.entity";
import { RunningMatch } from "./runningMatch.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Match, RunningMatch])],
    providers: [GameService],
    controllers: [GameController],
    exports: [GameService],
})
export class GameModule{}