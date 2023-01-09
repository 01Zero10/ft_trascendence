import { User } from "src/user";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity ("match")
export class Match {
    @PrimaryGeneratedColumn('increment')
    id: number;

    // @Column()
    // player1: string;

    // @Column()
    // player2: string;

    // @Column()
    // avatar1: string;

    // @Column()
    // avatar2: string;

    @ManyToOne(() => User)
    player1: User;

    @ManyToOne(() => User)
    player2: User;

    @Column()
    points1: Number;

    @Column()
    points2: Number;
}