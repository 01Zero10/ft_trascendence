import { Column, Entity, JoinColumn, JoinTable, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity ("online")
export class Online {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    status: string;

    @OneToOne(() => User, (user) => user.status, {cascade: true})
    @JoinColumn()
    user: User;
}