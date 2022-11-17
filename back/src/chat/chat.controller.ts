import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Render, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { User } from 'src/user/user.entity';
import { AuthGuard } from "src/auth/auth.guard";
import { Rooms } from "./rooms.entity";
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

interface DataAdmins{
    value: string,
    label: string,
}

interface DataMembers{
    value: string,
    label: string,
}

interface DataLimited{
    value: string,
    label: string,
}

interface DataNotLimited{
    value: string,
    label: string,
}

export interface Data{
    admins: DataAdmins[],
    members: DataMembers[],
}

export interface Limited{
    limited: DataLimited[],
    notLimited: DataNotLimited[],
}

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService,
    ) {}

    //Getters
    @Get('getuod')
    async UsersOnDB(): Promise<User[]>{
        return (await this.chatService.getUsersOnDB());
    }

    @Get('getpublic')
    async getPublicChannels(): Promise<Rooms[]> {
        return (await this.chatService.getPublicChannels());
    }

    @Get('private')
    async getPrivateChannels() {
        return (await this.chatService.getPrivateChannels());
    }
    
    @Get('getprotected')
    async getProtectedChannels() {
        return (await this.chatService.getProtectedChannels());
    }
    
    @Get('getChannel/:channelName')
    async getChannel(@Param('channelName') channelName: string){
        return (await this.chatService.getChannel(channelName));
    }

    @Get('allmembers/:roomName')
    async GetAllChatMembers(@Param('roomName') roomName: string): Promise<User[]>{
        const members = await this.chatService.getChatMembers(roomName);
        return (members);
    }

    @Get('members/:roomName')
    async GetChatMembers(@Param('roomName') roomName: string): Promise<User[]>{
        const admins = await this.chatService.getRoomAdmins(roomName);
        const members = await this.chatService.getChatMembers(roomName);
        const owner = await this.chatService.getRoomOwner(roomName);
        await Promise.all(await admins.map(async (element) => {
            const index = members.findIndex(x => x.username === element.username);
            if (index != -1)
                members.splice(index, 1);
        }))
        const index2 = await members.findIndex(x => x.username == owner.username);
        if (index2 != -1)
            members.splice(index2, 1);
        //admins.splice(admins.indexOf(owner), 1); //da levare per includere owner negli admin.. se serve
        //console.log("admins = ", admins);
        //console.log("members = ", members);
        return (members);
    }

    @Get('admins/:roomName')
    async GetRoomAdmins(@Param('roomName') roomName: string): Promise<User[]>{
        //console.log("startRoomAdmins");
        const owner = await this.chatService.getRoomOwner(roomName);
        const admins = await this.chatService.getRoomAdmins(roomName);
        const index = admins.findIndex(x => x.username === owner.username);
        if (index != -1)
            admins.splice(index, 1); // Da levare per includere owner negli admin.. se serve
        return (admins);
    }

    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('chrono')
    async GetChatChronology(@Body('user') username: string, @Body('roomName') roomName: string){
        const messages = await this.chatService.getMessages(roomName);
        return (messages);
    }
    
    @Get('clientrooms/:client_id')
    async GetClientRooms(@Param('client_id') client_id: number){
        return await this.chatService.getClientRooms(client_id);
    }
    
    @Get('membership/:client_id')
    async GetMemberships(@Param('client_id') client_id: number){
        const groups = await this.chatService.getMemberships(client_id);
        return groups;
    }

    @Get('getmembership/:client_id')
    async GetMemberships2(@Param('client_id') client_id: number){
        const groups = await this.chatService.getMemberships(client_id);
        return groups;
    }

    @Get('getFriendsChatList/:client')
    async GetFriendsChatList(@Param('client') client: string){
        return await this.chatService.getFriendsRooms(client);
    }

    @Post('addMembersOptions')
    async GetAddMembersOptions(@Body('channelName') channelName: string, @Body('client') client: string){
        const options = await this.chatService.getAddMembersOptions(channelName, client);
        return options;
    }

    //work in progress

    @Get('getBannedUsers/:channelName')
    async GetBannedUsers(@Param('channelName') channelName: string) {
        return this.chatService.getBannedUsers(channelName);        
    }

    @Get('getMutedUsers/:channelName')
    async GetMutedUsers(@Param('channelName') channelName: string) {
        return this.chatService.getMutedUsers(channelName);        
    }

    @Post('getMuteBanOptions')
    async GetMuteBanOptions(@Body('channelName') channelName: string, @Body('mode') mode: string) {
        return this.chatService.getMuteBanOptions(channelName, mode);
    }

    @Post('getMyState')
    async GetMyState(@Body('channelName') channelName: string, @Body('client') client: string){
        //console.log("[@GMS]");
        //console.log(client);
        //console.log(channelName);
        return this.chatService.getMyState(channelName, client);
    }

    @Get('getMyMutesAndBans/:client')
    async GetMyMutesAndBans(@Param('client') client: string){
        return this.chatService.getMyMutesAndBans(client);
    }
    //end work in progress

    //Adders
    @Post('addAdmins') //da testare
    async addAdmins(@Body('nameChannel') nameChannel: string, @Body('newAdmins') newAdmins: string[]) {
        return (await this.chatService.addAdmins(nameChannel, newAdmins));
    }

    @Post('addMembers')
    async addMembers(@Body('nameChannel') nameChannel: string, @Body('newMembers') newMembers: string[]){
        return (await this.chatService.addMembers(nameChannel, newMembers));
    }

    //Removers
    @Post('removeAdmins')
    async removeAdmins(@Body('nameChannel') nameChannel: string, @Body('admin') admin: string){
        return (await this.chatService.removeAdmin(nameChannel, admin));
    }

    //Generaters
    @Post('createGroupChat')
    async CreateGroupChat(@Body('builder') builder: string,
    @Body('nameGroup') nameGroup: string,
    @Body('members') members: string[],
    @Body('pwd') password: string){
        const room = await this.chatService.createGroupChat(builder, nameGroup, members, password);
        return room;
    }

    @Post('checkProtectedPass')
    async CheckProtectedPass(@Body('input') input: string, @Body('channelName') channelName: string){
        return await this.chatService.checkProtectedPassword(input, channelName);
    }

    @Post('createGroupChat2')
    async CreateGroupChat2(@Body('builder') builder: string,
    @Body('nameGroup') nameGroup: string,
    @Body('members') members: string[],
    @Body('type') type: string,
    @Body('password') password: string){
        console.log("builder", builder);
        console.log("nameGroup", nameGroup);
        console.log("members", members);
        console.log("type", type);
        console.log("pwd", password);
        const room = await this.chatService.createGroupChat2(builder, nameGroup, members, type, password);
        return room;
    }

    //fatto con socket emit... non dovrebbe servire
    // @Get('expiredMuteOrBan/:channelName')
    // async ExpiredMuteOrBan(@Param('channelName') channelName: string){
    //     //console.log("canalisssimo = ", channelName);
    //     await this.chatService.expiredMuteOrBan(channelName);
    // }

    //Setters
    @Post('editChannel')
    async EditChannel(
        @Body('channelName') channelName: string,
        @Body('type') type: string,
        @Body('password') password?: string,
        @Body('newName') newName?: string){
            await this.chatService.editChannel(channelName, type, password, newName); //impostare un return?
    }

    @Post('editUsers')
    async editUsersOnChannel(@Body('data') data: Data, @Body('channelName') channelName: string){
        this.chatService.editUsersOnChannel(data[0], data[1], channelName);
    }

    @Post('setJoin')
    async setJoin(
        @Body('client') client: string,
        @Body('channelName') channelName: string,
        @Body('joined') joined: boolean){
            await this.chatService.setJoin(client, channelName, joined);
    }

    @Post('handleMuteBan')
    async HandleMuteBan(
        @Body('channelName') channelName: string,
        @Body('limited') limited: Limited,
        @Body('mode') mode: string,
        @Body('time') time: number,
        @Body('reason') reason: string,
    ){
        //console.log("ahahaha, entratio")
        if (mode === 'kick')
            return await this.chatService.kickUsers(limited[0], channelName);
        const room = await this.chatService.getRoomByName(channelName);
        let currentLimited = (mode === 'ban') ? room.bannedUsers : room.mutedUsers;
        let oppositeLimited = (mode === 'ban') ? room.mutedUsers : room.bannedUsers;
        currentLimited = currentLimited ? currentLimited : [];
        oppositeLimited = oppositeLimited ? oppositeLimited : [];
        const cleanLimited: string [] = [];
        const rowsToUpdate: string [] = [];
        const rowsToDelete: string [] = [];
        const rowsToAdd: string [] = [];
        
        await Promise.all(await limited[0].map(async (element) => {
            cleanLimited.push(element.value);
        }))

        //console.log("opposite = ", oppositeLimited);

        await Promise.all(await cleanLimited.map(async (element) => {
            const index = oppositeLimited.findIndex(x => x === element);
            if (index > -1)
            {
                rowsToUpdate.push(element);
                oppositeLimited.splice(index, 1);
            }
        }))
        await Promise.all(await cleanLimited.map(async (element) => {
            if (rowsToUpdate.findIndex(x => x === element) === -1)
            {            
                if (currentLimited.findIndex(x => x === element) === -1)
                    rowsToAdd.push(element);
            }
        }))

        await Promise.all(await currentLimited.map(async (element) => {           
            if (cleanLimited.findIndex(x => x === element) === -1)
                rowsToDelete.push(element);
        }))

        //console.log("rowsToUpdate = ", rowsToUpdate);
        //console.log("rowsToDelete = ", rowsToDelete);
        //console.log("rowstoAdd = ", rowsToAdd);
        //console.log("");
        const expDate = new Date();
        //console.log(expDate)
        expDate.setSeconds(expDate.getSeconds() + time);
        //console.log(expDate)
        //console.log(rowsToAdd)
        //console.log(rowsToDelete)
        //console.log(rowsToUpdate)
        //console.log(mode)
        await this.chatService.updateMuteBanTable(channelName, rowsToDelete, rowsToUpdate, rowsToAdd, mode, reason, expDate);
        await this.chatService.handleMuteBan(room, mode, cleanLimited, oppositeLimited);
    }

    //Checkers

    @Get('checkTarget/:client')
    async CheckTarget(@Param('client') client: string){
        const user = await this.chatService.checkTarget(client);
        if (user)
            return true;
        else
            return false;
    }

    @Post('checkJoined')
    async checkJoined(@Body('client') client: string, @Body('channelName') channelName: string){
        return await this.chatService.checkJoined(client, channelName);
    }

    //path per test
    // @Get('test')
    // async test(){
    //     await this.chatService.expiredMuteOrBan();
    // }

    @Get('test')
    async test(){
         const iv = randomBytes(16); //<Buffer 06 d3 9c 9a 68 d8 4e ba 19 47 3b 49 4c 95 62 fe>
         console.log(iv)
         console.log(iv.toString('base64'));
        // console.log(process.env.BUFFER_IV)
        console.log(Buffer.from(process.env.BUFFER_IV, 'base64'))
        //---const iv = Buffer.from(process.env.BUFFER_IV, 'base64')
        //console.log('IV');
        //console.log(iv);
        //console.log('');
        //---const key = (await promisify(scrypt)(process.env.PASS_TO_ENCRYPT, 'salt', 32)) as Buffer;
        //console.log('KEY')
        //console.log(key);
        //console.log('');
        //console.log('CIPHER');
        //---const cipher = createCipheriv(process.env.ALGORITHM_TO_ENCRYPT, key, iv);
        //---let crypted = cipher.update('Bop Bop Bop', 'utf-8', 'hex') + cipher.final('hex');    
        //console.log("encrypted ", crypted)
        //console.log('');
        //console.log('DECIPHER');
        //---const decipher = createDecipheriv(process.env.ALGORITHM_TO_ENCRYPT, key, iv);
        //---let decrypted = decipher.update(crypted, 'hex', 'utf-8') + decipher.final('utf-8');
        //console.log("decrypted = ", decrypted);
        
        //this.chatService.saveEntityProtectedChannel('ciao', iv, key);
        
        // return cipher;
    }
}