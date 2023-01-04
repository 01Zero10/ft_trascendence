import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user";
import { Repository } from "typeorm";
import { Notifications } from "./notifications.entity";

@Injectable()
export class NavigationService{
    constructor(
        @InjectRepository(Notifications) private notificationRepository: Repository<Notifications>,
        @InjectRepository(User) private userRepository: Repository<User>,
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
        await this.notificationRepository
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

    async removeNotif(client: string){
        const notif = await this.notificationRepository
        .createQueryBuilder('notif')
        .where("sender = :client_n", { client_n: client})
        .getOne();

        if (notif)
        {
            const ret = notif.receiver;
            await this.notificationRepository.remove(notif)
            return ret;
        }
        return null;
        //Riprendere da qui
        //da testare se dopo invito non accettato
        //la notifica viene rimossa nel database e la campanella aggiornata
    }
}