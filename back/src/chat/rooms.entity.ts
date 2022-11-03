import { User } from "src/user/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("rooms")
export class Rooms {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    password: string;

    @Column({default: "public"})
    type: string;

    @ManyToMany(() => User, user => user.rooms, { cascade: true })
    @JoinTable()
    members: User[];

    @Column('simple-array', {nullable: true})
    bannedUsers: string[];

    @Column('simple-array', {nullable: true})
    mutedUsers: string[];

    @ManyToOne(() => User, user => user.ownedRooms)
    builder: User;

    @ManyToMany(() => User, user => user.managedRooms) //non impostato ancora
    admins: User[];
}