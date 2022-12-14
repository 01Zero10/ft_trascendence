import { Rooms } from "src/chat/rooms.entity";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Online } from "./online.entity";

@Entity("users")
export class User {
  @PrimaryColumn() //xk non generated?
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  nickname: string;

  @Column()
  avatar: string;

  @Column()
  two_fa_auth: boolean;
  
  @Column({ nullable: true }) //inserire default
  public twoFaAuthSecret?: string;
  
  @ManyToMany(() => Rooms, (rooms) => rooms.members)
  rooms: Rooms[];

  @OneToMany(() => Rooms, (rooms) => rooms.builder)
  ownedRooms: Rooms[];

  @ManyToMany(() => Rooms, (rooms) => rooms.admins) //non impostato ancora
  @JoinTable()
  managedRooms: Rooms[];

  @OneToOne(() => Online, (online) => online.user)
  status: Online;

  @Column({ nullable: true })
  socket_id: string;

  @Column('simple-array', { nullable: true})
  friends: string[];

  @Column('simple-array', { nullable: true, default: [] })
  blockedUsers: string[];

  @Column()
  public points: number;

  @Column()
  public wins: number;

  @Column()
  public losses: number;
}
