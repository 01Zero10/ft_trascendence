import { number, string } from "@hapi/joi";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("directRooms")
export class DirectRooms{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({default: 'direct'})
    type: string;

    @Column()
    user1: string;

    @Column()
    user2: string;
}