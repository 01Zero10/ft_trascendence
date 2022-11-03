import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity ("banOrMute")
export class BanOrMute {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    channelName: string;

    @Column()
    username: string;

    @Column()
    status: string;
    
    @Column({default: ''})
    reason: string;

    @Column()
    expireDate: Date;
}