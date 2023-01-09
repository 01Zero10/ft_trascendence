import { User } from "src/user";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @ManyToOne(() => User, user => user.sentChannelMessage)
    userInfo: User;

    @Column()
    createdAt: Date;
}