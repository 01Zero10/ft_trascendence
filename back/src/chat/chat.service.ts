import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/user/user.entity';
import { In, Repository } from 'typeorm';
import { RoomMessages } from './roomsMessages.entity';
import { Rooms } from './rooms.entity';
import { PrivateMessages } from './privateMessages.entity';
import { BanOrMute } from './banOrMute.entity';
import { createCipheriv, scrypt, randomBytes} from 'crypto';
import { promisify } from 'util';
import { ChatGateWay } from './chat.gateway';
import { DirectRooms } from './directRooms.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(RoomMessages) private roomMessagesRepository: Repository<RoomMessages>,
        @InjectRepository(PrivateMessages) private privateMessagesRepository: Repository<PrivateMessages>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Rooms) private roomsRepository: Repository<Rooms>,
        @InjectRepository(DirectRooms) private directRoomsRepository: Repository<DirectRooms>,
        @InjectRepository(BanOrMute) private banOrMuteRepository: Repository<BanOrMute>,
        @Inject(forwardRef(() => ChatGateWay)) private readonly chatGateway: ChatGateWay
        ){}

    //Getters

    async getRoomByName(roomName: string): Promise<Rooms> {
        return this.roomsRepository.findOne({where: {name: roomName}});
    }

    async getUsersOnDB() {
        return await this.userRepository
        .createQueryBuilder('users')
        .select(['users.username', 'users.nickname', 'users.avatar'])
        .getMany()
    }
    
    async getAllChannels() {
        const Rooms = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.builder', 'builder')
        .where("room.type != :type_n", {type_n: 'private'})
        .select(['room.name', 'room.type', 'builder.username', 'builder.nickname'])
        .getMany()
        return Rooms;
    }

    async getPublicChannels() {
        const Rooms = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.builder', 'builder')
        .where({type: 'public'})
        .select(['room.name', 'room.type', 'builder.username'])
        .getMany()
        return Rooms;
    }

    async getPrivateChannels() {
        const Rooms = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.builder', 'builder')
        .where({type: 'private'})
        .select(['room.name', 'room.type', 'builder.username'])
        .getMany()
        return Rooms;
    }

    async getProtectedChannels() {
        const Rooms = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.builder', 'builder')
        .where({type: 'protected'})
        .select(['room.name', 'room.type', 'builder.username'])
        .getMany()
        return Rooms;
    }

    async getDirectChannels(client: string) {
        const ret = this.directRoomsRepository
        .createQueryBuilder("direct")
        .where([{user1: client}, {user2: client}])
        .getMany();
        return ret;
    }

    async getChannel(channelName: string){
        //const Room = await this.getRoomByName(channelName);

        const Room = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.builder', 'builder')
        .where({name: channelName})
        .select(['room.name', 'room.type', 'builder.username', 'builder.nickname'])
        .getOne()
        return Room;

        //return Room;
    }

    async getDirectChat(nameDirectChat: string) {
        const Room = await this.directRoomsRepository
        .createQueryBuilder('room')
        .where({name: nameDirectChat})
        .select(['room.name', 'room.type'])
        .getOne()

        return Room;
    }

    async getMemberships(client_id: number){
        const User = (await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.rooms", "rooms")
        .where({id: client_id})
        .getOne())
        const groups = User ? User.rooms : [];
        const rooms = []
        for(let i of groups)
            rooms.push(await this.getChannel(i.name))
        return (rooms);
    }
    
    async getClientRooms(client_id: number) {
        const usersOnDB = await this.getUsersOnDB();
        const memberships = await this.getMemberships(client_id);
        const clientRooms: string[] = [];
        usersOnDB.forEach((element) => {
            clientRooms.push(element.username);
        })
        memberships.forEach((element) => {
            clientRooms.push(element.name);
        })
        return clientRooms;
    }

    async getFriendsRooms(client: string){
        const arrayFriends = (await this.userRepository.findOne({ where: { username: client } })).friends;
        const response: {name: string, type: string, builder: {username: string}}[] = [];
        if (arrayFriends)
        {
          await Promise.all(await arrayFriends.map(async (element) => {
            response.push({
                name: element,
                type: 'direct',
                builder: {username: ''},
            });
          }))
        }
        return response;
      }

    //work in progress

    async getBannedUsers(channelName: string) {
        const limitedUsers = (await this.getRoomByName(channelName)).bannedUsers;
        return (limitedUsers ? limitedUsers : []);
    }

    async getMutedUsers(channelName: string) {
        const limitedUsers = (await this.getRoomByName(channelName)).mutedUsers;
        return (limitedUsers ? limitedUsers : []);
    }

    async getMuteBanOptions(channelName: string, mode: string) {
        const options: string[] = [];
        const usersOnChannel = await this.getChatMembers(channelName);
        const adminsOnChannel = await this.getRoomAdmins(channelName);
        await Promise.all(await usersOnChannel.map(async (element) => {
            if (adminsOnChannel.findIndex( x => x.username == element.username) === -1)
            //{
                //    if (oppositeLimited.findIndex( x => x == element.username) > -1)
                //        options.push(element.username + emoticon);
                //    else
                options.push(element.username);
                //}
            }))
        if (mode === 'kick')
            return options;
        const limitedUsers = (mode === 'ban') ? await this.getBannedUsers(channelName) : await this.getMutedUsers(channelName);
        //const oppositeLimited = (mode === 'mute') ? await this.getBannedUsers(channelName) : await this.getMutedUsers(channelName);
        //const emoticon = (mode === 'ban') ? '🚫' : '🔇';
        await Promise.all(await limitedUsers.map(async (element) => {
            const index = options.findIndex( x => x === element)
            if (index > -1)
                options.splice(index, 1);
        }))
        return options;
    }

    //end work in progress

    async getMessages(roomName: string, type: string): Promise<RoomMessages[]> {
        if (type !== 'direct')    
            // return await this.roomMessagesRepository.find({
            //     where: {
            //         room: roomName,
            //     }
            // });
            return await this.roomMessagesRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.userInfo', 'userInfo')
        .where({ room: roomName})
        .select(['message.id',
            'message.username',
            'message.room',
            'message.message',
            'message.createdAt',
            'userInfo.username',
            'userInfo.nickname',
            'userInfo.avatar'
        ])
        .orderBy('message.createdAt', 'ASC')
        .getMany()
        else
            // return await this.privateMessagesRepository.find({
            //     where: {
            //         room: roomName,
            //     }
            // });
            return await this.privateMessagesRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.userInfo', 'userInfo')
            .where({ room: roomName})
            .select(['message.id',
                'message.username',
                'message.room',
                'message.message',
                'message.createdAt',
                'userInfo.username',
                'userInfo.nickname',
                'userInfo.avatar'
            ])
            .orderBy('message.createdAt', 'ASC')
            .getMany()
    }

    async getChatMembersAndStatus(roomName: string){
        //const room = await this.roomsRepository.findOne({where: {name: roomName}});
        /*if (!room)
        return ;*/
        
        //old arrayUser
        // const arrayUser = (await this.roomsRepository.createQueryBuilder('room')
        // .leftJoinAndSelect("room.members", "members")
        // .where({name: roomName})
        // .getOne()).members;
        // return arrayUser;

        const arrayUser = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.members', 'user')
        .leftJoinAndSelect('user.status', 'status')
        .where({name: roomName})
        .select(['room.name', 'user.username', 'user.nickname', 'status.status'])
        .getOne();

        return arrayUser.members;
		
    }

    async getChatMembers(roomName: string){
        const room = await this.roomsRepository.findOne({where: {name: roomName}});
        /*if (!room)
        return ;*/
        const arrayUser = (await this.roomsRepository.createQueryBuilder('room')
        .leftJoinAndSelect("room.members", "members")
        .where({name: roomName})
        .getOne()).members;
        return arrayUser;
		
    }

    async getChatMembersTest(roomName: string){
        const arrayUser = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.members', 'user')
        .leftJoinAndSelect('user.status', 'status')
        .where({name: roomName})
        .select(['room.name', 'user.nickname', 'status.status'])
        .getOne();

        return arrayUser.members;
    }

    async getRoomAdmins(roomName: string){
        const arrayAdmins = (await this.roomsRepository.createQueryBuilder('room')
        .leftJoinAndSelect("room.admins", "admins")
        .where([{name: roomName}, {name: roomName}])
        .getOne()).admins;
        return arrayAdmins; //modificare il ritorno?
    }

    async getRoomOwner(roomName: string){
        const owner = (await this.roomsRepository.createQueryBuilder("room")
        .leftJoinAndSelect("room.builder", "builder")
        .where({name: roomName})
        .getOne()).builder
        return owner; //da cambiare ritorno?
    }

    //da gestire anche i bannati?
    async getAddMembersOptions(channelName: string, client: string){
        const clientFriends = (await this.userRepository.findOne({where: {username: client}})).friends;
        const chatMembers = await this.getChatMembers(channelName);
        const addMembersOptions : string[] = [];
        await Promise.all(await clientFriends.map(async (element) => {
            const index = chatMembers.findIndex(x => x.username === element);
            if (index === -1)
                addMembersOptions.push(element);
        }))
        return addMembersOptions;
    }

    async getMyState(channelName: string, client: string){
        const nullo: string = "null" //porco dio, ci deve essere un modo diverso
        const response = await this.banOrMuteRepository
        .createQueryBuilder("banOrMute")
        .where("banOrMute.channelName = :channelName", {channelName})
        .andWhere("banOrMute.username = :client", {client})
        .select(['banOrMute.status', 'banOrMute.reason','banOrMute.expireDate'])
        .getOne()
        if (!response)
            return nullo;
        return response;
    }

    async getMyMutesAndBans(client: string){
        const response = await this.banOrMuteRepository
        .createQueryBuilder("banOrMute")
        .where('banOrMute.username = :client', {client})
        .select(['banOrMute.channelName', 'banOrMute.expireDate', 'banOrMute.status'])
        .orderBy('banOrMute.expireDate', 'ASC')
        .getMany()
        return response;
    }
    //Adders

    async addAdmins(nameChannel: string, newAdmins: string[]){ //da testare, forse non serve
        const room = await this.getRoomByName(nameChannel);
        // if (!room){
        //     return error
        // }
        let updatingAdmins: User[] = (await this.roomsRepository.createQueryBuilder('room')
                .leftJoinAndSelect("room.admins", "admins")
                .where({name: nameChannel})
                .getOne()).admins;
        await Promise.all(await newAdmins.map(async (element) => {
            updatingAdmins.push(await this.userRepository.findOne({ where : { username: element} }))
        }))
        room.admins = updatingAdmins;
        return await this.roomsRepository.save(room);
    }

    async addMembers(nameChannel: string, newMembers: string[]){
        const room = await this.getRoomByName(nameChannel);
        const updatingMembers = await this.getChatMembers(nameChannel);
        await Promise.all( await newMembers.map(async (element) => {
            updatingMembers.push(await this.userRepository.findOne({ where: { username: element} }))
        }))
        room.members = updatingMembers;
        await this.roomsRepository.save(room);
        await this.chatGateway.handleUpdateListMembers(nameChannel);
        //return await this.roomsRepository.save(room);
    }
    
    //Removers

    async removeOwner(nameChannel: string, exMember: string){
        const room = await this.getRoomByName(nameChannel);
        const admins = await this.getRoomAdmins(nameChannel);
        const members = await this.getChatMembers(nameChannel);
        let index = admins.findIndex(x => x.username == exMember)
        admins.splice(index, 1);
        room.admins = admins;
            //room.admins = admins;}
        index = members.findIndex(x => x.username == exMember)
        members.splice(index, 1);
        room.members = members;
        if (admins.length)
            room.builder = admins[0]
        else if (members.length)
            room.builder = members[0];
        else
            return await this.roomsRepository.remove(room)
        return this.roomsRepository.save(room);
    }
    
    // async removeAdmins(nameChannel: string, oldAdmins: string[]){
    async removeAdmin(nameChannel: string, oldAdmin: string){
        const room = await this.getRoomByName(nameChannel);
        const admins = await this.getRoomAdmins(nameChannel);
        const members = await this.getChatMembers(nameChannel);
        let index = admins.findIndex(x => x.username == oldAdmin)
        admins.splice(index, 1);
        room.admins = admins;
        index = members.findIndex(x => x.username == oldAdmin)
        members.splice(index, 1);
        room.members = members;
        if(members.length)
            return await this.roomsRepository.remove(room)
        else
            return this.roomsRepository.save(room);
    }

    async removeUser(nameChannel: string, oldUser: string){
        const room = await this.getRoomByName(nameChannel);
        const updatingMembers = await this.getChatMembers(nameChannel);
        const index = updatingMembers.findIndex(x => x.username === oldUser);
        updatingMembers.splice(index, 1);
        if (updatingMembers.length)
        {
            room.members = updatingMembers;
            this.roomsRepository.save(room);
        }
        else
            await this.roomsRepository.remove(room)
    }
    
    async leaveChannel(nameChannel: string, exMember: string){
        //se Owner -> removeOwner
        const owner = await this.getRoomOwner(nameChannel);
        const admins = await this.getRoomAdmins(nameChannel);
        if (exMember == owner.username)
            await this.removeOwner(nameChannel, exMember);
        //se Admin -> removeAdmin
        else if(admins.findIndex(x => x.username === exMember) > -1)
            await this.removeAdmin(nameChannel, exMember);
        //if se membro
        else
            await this.removeUser(nameChannel, exMember);
        await this.chatGateway.handleUpdateListMembers(nameChannel);
        //this.chatGateway.handleUpdateListMembers(nameChannel);
    }

    async kickUsers(users: string[], channelName: string){
        await Promise.all(await users.map(async (element) => {
            this.leaveChannel(channelName, element);
        }));
    }
    
    async expiredMuteOrBan(channel: string){
        const now = new Date();
        const rows = await this.banOrMuteRepository
        .createQueryBuilder('banOrMute')
        .where("banOrMute.expireDate <= :now", {now})
        .andWhere("banOrMute.channelName = :channel", {channel})
        .getMany();
        for (const element of rows) {
            const channel = await this.getRoomByName(element.channelName);
            const arrayToSplice = (element.status === 'ban') ? channel.bannedUsers : channel.mutedUsers;
            const index = arrayToSplice.findIndex(x => x === element.username);
            if (index > -1)
                arrayToSplice.splice(index, 1);
            if (element.status === 'ban')
                channel.bannedUsers = arrayToSplice;
            else
                channel.mutedUsers = arrayToSplice;
            await this.roomsRepository.save(channel);
        }
        await this.banOrMuteRepository.remove(rows);
    }

    async singleMuteOrBanRemove(channelName: string, client: string, status: string){
        const row = await this.banOrMuteRepository
        .createQueryBuilder('banOrMute')
        .where('banOrMute.status = :status', {status})
        .andWhere('banOrMute.channelName = :channelName', {channelName})
        .getOne()
        const channel = await this.getRoomByName(channelName);
        const arrayToSplice = (status === 'ban') ? channel.bannedUsers : channel.mutedUsers;
        const index = arrayToSplice.findIndex(x => x === client);
        if (index > -1) {
            arrayToSplice.splice(index, 1);
            if (status === 'ban')
                channel.bannedUsers = arrayToSplice;
            else
                channel.mutedUsers = arrayToSplice;
            await this.roomsRepository.save(channel);
        }
        await this.banOrMuteRepository.remove(row);
    }

    //Generaters

    async createMessage(payload: {room: string, username: string, message: string, avatar: string, clientSocket: Socket }, type: string): Promise<RoomMessages>{
        
        const infoUser = await this.userRepository.findOne({where: {username: payload.username}});


        if (type !== 'direct')
            return await this.roomMessagesRepository.save({
                username: payload.username,
                userSocket: payload.clientSocket.id,
                room: payload.room,
                avatar: payload.avatar,
                message: payload.message,
                userInfo: infoUser,
                createdAt: new Date,
            })
        else 
            return await this.privateMessagesRepository.save({
                username: payload.username,
                userSocket: payload.clientSocket.id,
                room: payload.room,
                avatar: payload.avatar,
                message: payload.message,
                userInfo: infoUser,
                createdAt: new Date,
            })
    }
    
    async createRoom(client: string, roomName: string, password?: string){
        const user = await this.userRepository.findOne({where: {username: client}});
        const room = await this.roomsRepository.findOne({where: {name: roomName}});
        if (!room){
            const newRoom = await this.roomsRepository.create({name: roomName});
            if (password?.length > 0)
            {
                newRoom.type = 'protected';
                newRoom.password = password;
            }
            return newRoom;
            // newRoom.members = [user];
            // return await this.roomsRepository.save(newRoom);
        }
        else {
            // const arrayUser = (await this.roomsRepository.createQueryBuilder('room')
            //         .leftJoinAndSelect("room.members", "members")
            //         .where({name: roomName})
            //         .getOne()).members;
            // if (arrayUser.findIndex(x => x.username === client) == -1) //
            // {
                //     arrayUser.push(user);
                //     room.members = arrayUser;//
                //     return await this.roomsRepository.save(room); //non lo fa???
                // }
            }
    }

    async buildCipherPass(builder: string, pass: string, channel: string){
        const iv = Buffer.from('ciao', 'base64');
        // const iv = randomBytes(16);
        const key = (await promisify(scrypt)("process.env.PASS_TO_ENCRYPT", 'salt', 32)) as Buffer;
        const cipher = createCipheriv("aes-256-gcm", key, iv);
        let crypted = cipher.update(pass, 'utf-8', 'hex') + cipher.final('hex');
        return crypted;
    }

    async createRoom2(builder: string, roomName: string, type: string, password: string){
        //const user = await this.userRepository.findOne({where: {username: client}});
        const room = await this.roomsRepository.findOne({where: {name: roomName}});
        if (!room){
            const newRoom = await this.roomsRepository.create({name: roomName});
            newRoom.type = type;
            if (type === 'protected')
                newRoom.password = await this.buildCipherPass(builder, password, roomName);
            return newRoom;
        }
        }

        
    //Qui x protected;
    async createGroupChat(builder: string, nameGroup: string, members: string[], password: string){
        const room = await this.getRoomByName(nameGroup);
        if (!room){
            const newRoom = await this.createRoom(builder, nameGroup, password);
            const builder_ = await this.userRepository.findOne({where: {username: builder}});
            newRoom.builder = builder_;
            let arrayUser: User[] = [builder_];
            await Promise.all(await members.map(async (element) => {
                arrayUser.push(await this.userRepository.findOne({where: {username: element}}));
            }))
            newRoom.members = arrayUser;
            return await this.roomsRepository.save(newRoom);
        }
        ///else "room giá esistente";
    }

    async createGroupChat2(builder: string, nameGroup: string, members: string[], type: string, password: string){
        const room = await this.getRoomByName(nameGroup);
        if (!room){
            const newRoom = await this.createRoom2(builder, nameGroup, type, password);
            const builder_ = await this.userRepository.findOne({where: {username: builder}});
            newRoom.builder = builder_;
            let arrayUser: User[] = [builder_];
            await Promise.all(await members.map(async (element) => {
                arrayUser.push(await this.userRepository.findOne({where: {username: element}}));
            }))
            newRoom.members = arrayUser;
            return await this.roomsRepository.save(newRoom);
        }
        ///else "room giá esistente";
    }

    async createDirectChat(client: string, userToChatWith: string){
        const nameDirectChat = (client < userToChatWith) ? client + userToChatWith : userToChatWith + client;
        let room = await this.getDirectChat(nameDirectChat);
        if (!room){
            const user1 = (client < userToChatWith) ? client : userToChatWith;
            const user2 = (client < userToChatWith) ? userToChatWith : client;
            room = this.directRoomsRepository.create({
                name: nameDirectChat,
                user1: user1,
                user2: user2
            });
            await this.directRoomsRepository.save(room);
        }
        return room;
    }
    
    //Setters

    async editChannel(channelName: string, type: string, adminsSetted: string[], password?: string, newName?: string){
        let room = await this.getRoomByName(channelName);
        const nameToEmit = room.name;
        const typeToEmit = room.type;
        //da gestire un eventuale room null?
        if (newName)
        {
            room.name = newName;
            await this.roomMessagesRepository.update({room: channelName}, {room: newName});
            //controllo validitá nuovo nome?
        }
        if (type == 'public'){
            room.type = 'public';
            room.password = null;

        }
        else if (type == 'protected'){
            room.type = 'protected';
            if (password)
                room.password = password;
        }
        else if (type == 'private'){
            room.type = 'private';
            room.password = null;
        }
        room = await this.roomsRepository.save(room);
        await this.editUsersOnChannel(adminsSetted, room.name);
        const newDates = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.builder', 'builder')
        .where({name: room.name})
        .select(['room.name', 'room.type', 'builder.username', 'builder.nickname'])
        .getOne();
        this.chatGateway.server.emit('update', typeToEmit);
        this.chatGateway.server.to(nameToEmit).emit('updateChannel', newDates.name, newDates.type, newDates.builder);
    }
 
    async editUsersOnChannel(admins: string[], channelName: string){
        const room = await this.roomsRepository.findOne({where : {name: channelName}});
        let updatingAdmins: User[] = [(await this.getRoomOwner(channelName))];
        await Promise.all(await admins.map(async (element) => {
            updatingAdmins.push(await this.userRepository.findOne({ where : { username: element} }))
        }))
        room.admins = updatingAdmins;
        return await this.roomsRepository.save(room);
    }

    async setJoin(client: string, channelName: string, joined: boolean){
        if (joined)
            await this.leaveChannel(channelName, client);
        else
            await this.addMembers(channelName, [client]);
    }

    async handleMuteBan(channel: Rooms, mode: string, cleanLimited: string[], oppositeLimited: string[]){
        if (mode === 'ban'){
            channel.bannedUsers = cleanLimited;
            channel.mutedUsers = oppositeLimited;
        }
        else {
            channel.mutedUsers = cleanLimited;
            channel.bannedUsers = oppositeLimited;
        }
        this.roomsRepository.save(channel);
    }

    async updateMuteBanTable(
        channelName: string,
        rowsToDelete: string [],
        rowsToUpdate: string[],
        rowsToAdd: string[],
        mode: string,
        reason: string,
        expirationDate: Date){
        
        console.log(rowsToDelete);
        console.log(rowsToUpdate);
        console.log(rowsToAdd);

        //remove rows phase
        Promise.all(await rowsToDelete.map(async (element) => {
            let index = await this.banOrMuteRepository.findOne({ where: [{channelName: channelName}, {username: element}]});
            await this.banOrMuteRepository.remove(index)
            // await this.setUnbanOrUnmute()
        }))

        //update rows phase
        Promise.all(await rowsToUpdate.map(async (element) => {
            let index = await this.banOrMuteRepository.findOne({ where: [{channelName: channelName}, {username: element}]});
            index.status = mode,
            index.reason = reason;
            index.expireDate = expirationDate;
            await this.banOrMuteRepository.save(index);
            this.setUnbanOrUnmute(element, channelName, mode, expirationDate);
        }))

        //add rows phase
        Promise.all(await rowsToAdd.map(async (element) => {
            console.log("entrato");
            await this.banOrMuteRepository.save({
                channelName: channelName,
                username: element,
                status: mode,
                reason: reason,
                expireDate: expirationDate,
            })
            this.setUnbanOrUnmute(element, channelName, mode, expirationDate);
        }))

    }

    async setUnbanOrUnmute(username: string, channelName: string, mode: string, expirationDate: Date){
        const timer = expirationDate.getTime() - new Date().getTime();
        setTimeout(async () => {
            let row = await this.banOrMuteRepository
            .createQueryBuilder('banOrMute')
            .where({ channelName: channelName})
            .andWhere({ username: username })
            .andWhere({ status: mode })
            .getOne();
            //findOne({ where: [{channelName: channelName}, {username: username}, {status: mode}]});
            console.log("row === ", row);
            if (row) {
                await this.banOrMuteRepository.remove(row)
                const channel = await this.roomsRepository.findOne({ where: [{ name: channelName}] });
                const arrayToSplice = (mode === 'ban') ? channel.bannedUsers : channel.mutedUsers;
                const index = arrayToSplice.findIndex(x => x === username);
                if (index > -1)
                    arrayToSplice.splice(index, 1);
                if (mode === 'ban')
                    channel.bannedUsers = arrayToSplice;
                else
                    channel.mutedUsers = arrayToSplice;
                await this.roomsRepository.save(channel);
            }
        }, timer)
    }

    //Checkers
    
    async checkTarget(target: string): Promise<User | null>{
        return await this.userRepository.findOne({ where: { username: target } })
        .catch(() => {return null});
    }

    async checkJoined(client: string, channelName: string) {
        const index = (await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect("user.rooms", "rooms")
        .where({id: client})
        .getOne()).rooms.findIndex(x => x.name === channelName);
        return (index > -1 ? true : false);
    }

    async checkChannelName(channelName){
        if (await this.getRoomByName(channelName))
            return true;
        return false;
    }

    async updateChannelUsersList(){
        await this.chatGateway.updateAllListMembers();
    }
    // ???

    async updateUserSocket(userID: string, userSocket: string){
        if (userID)
            await this.userRepository.update(userID, {socket_id: userSocket})
    }

    async checkProtectedPassword(input: string, channel: string){
        const iv = Buffer.from('ciao', 'base64');
        // const iv = randomBytes(16);
        const key = (await promisify(scrypt)("process.env.PASS_TO_ENCRYPT", 'salt', 32)) as Buffer;
        const cipher = createCipheriv("aes-256-gcm", key, iv);
        let cipherInput = cipher.update(input, 'utf-8', 'hex') + cipher.final('hex');
        if (cipherInput === (await this.getRoomByName(channel)).password)
            return true;
        return false;
    }

    async test(nameChannel: string) {
        const messages = await this.roomMessagesRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.userInfo', 'userInfo')
        .where({ room: nameChannel})
        .select(['message.id',
            'message.username',
            'message.room',
            'message.message',
            'message.createdAt',
            'userInfo.username',
            'userInfo.nickname',
            'userInfo.avatar'
        ])
        .getMany()

        return messages;
    }
}