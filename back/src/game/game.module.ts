import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { Match } from "./match.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Match])],
    providers: [GameService],
    controllers: [GameController],
    exports: [GameService],
})
export class GameModule{}