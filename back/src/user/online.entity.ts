import { Column, Entity, JoinColumn, JoinTable, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity ("online")
export class Online {
    @PrimaryGeneratedColumn('uuid')
    id: number;
    
    @Column()
    status: string;

    //@OneToOne(() => User, {cascade: true})
    //@JoinColumn()
    //user: User;

    @OneToOne(() => User, (user) => user.status)//, {cascade: true})
    @JoinColumn()
    user: User;
}