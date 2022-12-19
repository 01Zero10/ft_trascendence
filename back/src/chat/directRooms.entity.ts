import { number, string } from "@hapi/joi";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("directRooms")
export class directRooms{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    user1: string;

    @Column()
    user2: string;
}