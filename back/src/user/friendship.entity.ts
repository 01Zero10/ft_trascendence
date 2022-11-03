import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("friendship")
export class Friendship {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    user1: string;

    @Column()
    user2: string;

    @Column()
    friendship: string;

    @Column({nullable: true})
    sender: string;
}