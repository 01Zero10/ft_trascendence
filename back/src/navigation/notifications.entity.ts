import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("notifications")
export class Notifications {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    receiver: string;

    @Column()
    sender: string;

    @Column()
    type: string;

    @Column({nullable: true})
    sentAt: Date;

    @Column({default: false})
    seen: boolean;
}