import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "src/game/match.entity";
import { RunningMatch } from "src/game/runningMatch.entity";
import { User } from "src/user";
import { Repository } from "typeorm";
import { NavigationGateWay } from "./navigation.gateway";
import { Notifications } from "./notifications.entity";

@Injectable()
export class NavigationService{
    constructor(
        @InjectRepository(Notifications) private notificationRepository: Repository<Notifications>,
        //@InjectRepository(Match) private matchRepository: Repository<Match>,
        //@InjectRepository(RunningMatch) private runningMatches: Repository<RunningMatch>,
        @InjectRepository(User) private userRepository: Repository<User>,
        //@Inject(forwardRef(() => NavigationGateWay)) private readonly navigationGateway: NavigationGateWay,
    ){}

    async updateUserSocket(userID: string, userSocket: string){
        if (userID)
            await this.userRepository.update(userID, {socket_id: userSocket})
    }

    async getNotifications(client: string) {
        const ret = this.notificationRepository
        .createQueryBuilder('notif')
        .where({receiver: client})
        .getMany()
        return ret;
    }

    async markSeen(client: string) {
        this.notificationRepository
        .createQueryBuilder()
        .update(Notifications)
        .set({ seen: true })
        .where("receiver = :client_n", { client_n: client })
        .execute()
    }

    async inviteToGame(client: string, userToPlayWith: string){
        const notif = this.notificationRepository.create({
            receiver: userToPlayWith,
            sender: client,
            type: 'game_request',
            sentAt: new Date(),
        })
        this.notificationRepository.save(notif);
    }
}