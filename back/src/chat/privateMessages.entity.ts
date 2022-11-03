import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity ("privateMessages")
export class PrivateMessages {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    username: string;

    @Column()
    userSocket: string;

    @Column()
    room: string;

    @Column()
    message: string;

    @Column()
    createdAt: Date;
}