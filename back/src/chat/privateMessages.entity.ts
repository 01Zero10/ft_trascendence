import { User } from "src/user";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity ("privateMessages")
export class PrivateMessages {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    username: string;

    @Column()
    avatar: string;

    @Column()
    userSocket: string;

    @Column()
    room: string;

    @Column()
    message: string;

    @ManyToOne(() => User, user => user.sentPrivateMessage)
    userInfo: User;

    @Column()
    createdAt: Date;
}