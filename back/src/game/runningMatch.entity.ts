import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity ("runningMatch")
export class RunningMatch {
    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column()
    playRoom: string;

    @Column({default: 'classic'})
    typo: string;

    @Column({default: 'false'})
    invited: string;

    @Column()
    player1: string;

    @Column({default: ''})
    player2: string;

    @Column()
    avatar1: string;

    @Column({default: ''})
    avatar2: string;

    @Column()
    leftSide: string;

    @Column({default: ''})
    rightSide: string;

}