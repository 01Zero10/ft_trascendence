import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity ("roomMessages")
export class RoomMessages {
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

    @Column({nullable: true})
    avatar: string;

    @Column()
    createdAt: Date;
}