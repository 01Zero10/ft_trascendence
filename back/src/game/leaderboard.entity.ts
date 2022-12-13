import { User } from "src/user";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("leaderboard")
export class Leaderboard {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    position: number;
    
    @Column()
    points: number;

    // @Column()
    // username: string;

    // @Column()
    // nickname: string;

    // @Column()
    // avatar: string;

    @OneToOne(() => User, {cascade: true})
    @JoinColumn()
    user: User;

}