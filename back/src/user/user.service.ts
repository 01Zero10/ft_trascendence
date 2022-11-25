import { Body, Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { Repository } from "typeorm";
import fetch from 'node-fetch';
import { User } from "./user.entity";
import { CreateUserDto } from "./utils/user.dto";
import { JwtService } from "@nestjs/jwt";
import { Friendship } from "./friendship.entity";
import { Online } from "./online.entity";

export interface FriendListItem {
  username: string;
  nickname: string;
  avatar: string;
  friendship: Friendship;
  position: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Friendship) private friendShipRepository: Repository<Friendship>,
    @InjectRepository(Online) private onlineRepository: Repository<Online>,
    private readonly jwt: JwtService,
  ) {}

  async getById(id_p : number): Promise<User> {
    return await this.userRepository.findOne({ where: { id: id_p } });
  }

  async getByUsername(login: string): Promise<User> {
    return this.userRepository.findOne({ where: { username: login } });
  }

  async changeName(newName: string, oldName: string) {
    //console.log("entrato change name");
    //console.log(newName);
    //console.log(oldName);
    if (newName !== "")
    {
      const user: User = await this.userRepository.findOne({where: {username: oldName}});
      //console.log(user);
      user.username = newName;
      this.userRepository.save(user);
    }
  }

  async changeAvatar(userId: number, newavatar: string){
    
    const updateAvatar = "data:image/png;base64," + newavatar;
    await this.userRepository.update(userId, {
      avatar: updateAvatar,
    });
    return updateAvatar;
  }

  async create(userData: any): Promise<User> {
    const exists = await this.getByUsername(userData.login);
    if (exists) {
      const rnd = Math.floor(Math.random() * 100);
      return this.create({ ...userData, login: userData.login + rnd });
    }

    return this.userRepository.save({
      id: userData.id,
      username: userData.login,
      nickname: userData.login,
      avatar: userData.image.link,
      two_fa_auth: false,
      points: 0,
      wins: 0,
      losses: 0,
    });
  }

  async set2FASecret(secret: string, userId: number) {
    return this.userRepository.update(userId, {
      twoFaAuthSecret: secret,
    });
  }

  async userCookie(cookie): Promise<any> {
    const data = await this.jwt.verifyAsync(cookie);
    const user = await this.getById(data['id']);
    return user;
  }

  async turnOn2FA(userId: number) {
    if ((await this.getById(userId)).two_fa_auth)
      return this.userRepository.update(userId, { two_fa_auth: false });
    return this.userRepository.update(userId, { two_fa_auth: true });
  }

  async login(
    mycode: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ user: User; first: boolean }> {
    const body: any = {
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: mycode,
      redirect_uri: `http://${process.env.IP_ADDR}:3001/login`,
    };
    let response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status != 200) {
      return { user: null, first: false };
    }

    let data = (await response.json());
    let token: string = data.access_token;
    response= await fetch('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: 'Bearer ' + token },
    });
    data = await response.json();
    //console.log(data);
    const user: User = await this.getById(data.id);
    token = await this.jwt.signAsync({
      id: data.id,
      two_fa: user ? user.two_fa_auth : false,
    });
    res.cookie('token', token, { httpOnly: true });
    if (!user) {
      const user2 = await this.create(data);
      return { user: user2, first: true };
    } else return { user, first: false };
  } 

  async blockUser(client: string, userToBlock: string){ //da testare
    const User = await this.userRepository.findOne({ where : {username: client}});
    const index = User.blockedUsers.indexOf(userToBlock, 0);
    if (index > -1)
        User.blockedUsers.splice(index, 1);
    else
        User.blockedUsers.push(userToBlock);
    await this.userRepository.save(User)
  }

  async checkFriendship(client1: string, client2: string){
    
    //const nofriend: {friendship: string} = {friendship: "nope"};

    const nofriend: Friendship = {
      id: 0,
      friendship: 'nope',
      user1: '',
      user2: '',
      sender: null
      };
    const param1 = (client1 < client2) ? client1 : client2;
    const param2 = (param1 == client1) ? client2 : client1;
    //console.log("param", param1, param2)
    const response = await this.friendShipRepository
    .createQueryBuilder("friend")
    .where("friend.user1 = :param1", { param1 })
    .andWhere("friend.user2 = :param2", { param2 })
    .select(['friend.friendship', 'friend.sender'])
    .getOne()
    .catch(() => { //pare non faccia niente
      //console.log("dentro no friend")
     return nofriend;
    });
    if (response == null) 
      return nofriend
    return response;
    //return response;
  }

  async addFriend(client: string, profileUser: string){
    const friend1: string = (client < profileUser) ? client : profileUser;
    const friend2: string = (client == friend1) ? profileUser : client;
    
    return this.friendShipRepository.save({
      user1: friend1,
      user2: friend2,
      friendship: "pending",
      sender: client,
    })
  }

  async acceptRequest(client: string, profileUser: string){
    const friend1: string = (client < profileUser) ? client : profileUser;
    const friend2: string = (client == friend1) ? profileUser : client;
    const request = await this.friendShipRepository.findOneBy({user1: friend1, user2: friend2});
    request.friendship = "friends";
    request.sender = null;
    await this.friendShipRepository.save(request);
  }

  async deleteRequestOrFriendship(client: string, profileUser: string){
    const userClient = await this.getByUsername(client);
    const userProfileUser = await this.getByUsername(profileUser);
    const friend1: string = (client < profileUser) ? client : profileUser;
    const friend2: string = (client == friend1) ? profileUser : client;
    const request = await this.friendShipRepository.findOneBy({user1: friend1, user2: friend2});
    const indexClient = userClient.friends.findIndex(x => x == profileUser);
    if (indexClient > -1){
      userClient.friends.splice(indexClient, 1);
      await this.userRepository.save(userClient);
    }
    const indexProfileClient = userProfileUser.friends.findIndex(x => x == client);
    if (indexProfileClient > -1)
    {
      userProfileUser.friends.splice(indexProfileClient, 1);
      await this.userRepository.save(userProfileUser);
    }
    await this.friendShipRepository.remove(request);
  }

  async acceptFriendRequest(client: string, profileUser: string){
    const userClient = await this.getByUsername(client);
    const userProfileUser = await this.getByUsername(profileUser);
    const friend1: string = (client < profileUser) ? client : profileUser;
    const friend2: string = (client == friend1) ? profileUser : client;
    const request = await this.friendShipRepository.findOneBy({user1: friend1, user2: friend2});
    request.friendship = "friends";
    request.sender = null;
    if (!userClient.friends)
      userClient.friends = [];
    userClient.friends.push(profileUser)
    if (!userProfileUser.friends)
      userProfileUser.friends = [];
    userProfileUser.friends.push(client)
    await this.userRepository.save(userClient);
    await this.userRepository.save(userProfileUser);
    await this.friendShipRepository.save(request);
  }

  async getFriendships(client: string){
    const userClient = await this.getByUsername(client);
    return userClient.friends;
  }

  async getFriends(client: string, profileUser: string){
    const arrayFriends = (await this.getByUsername(profileUser)).friends;
    const response: FriendListItem[] = [];
    if (arrayFriends && arrayFriends.length > 0)
    {
      await Promise.all(await arrayFriends.map(async (element) => {
        const player = await this.getByUsername(element);
        const item: FriendListItem = { 
          username: player.username,
          nickname: player.nickname,
          avatar: player.avatar,
          friendship: (await this.checkFriendship(client, player.username)),
          position: 42, //TODO: forzato xk manca ancora tutto il resto
        }
        response.push(item);
      }))
    }
    return response;
  }

  async getFriendsRequest(client: string, profileUser: string){
    const arrayRequest = await this.friendShipRepository
    .createQueryBuilder('request')
    .where("request.user1 = :client_n", { client_n: client })
    //.orWhere("request.user2 = :client_n", { client_n: client })
    .andWhere("request.friendship = :state", { state: "pending" })
    .andWhere("request.sender != :sender_n", { sender_n: client })
    .getMany()

    console.log(arrayRequest);
    const response: FriendListItem[] = [];
    if (arrayRequest && arrayRequest.length > 0)
    {
      await Promise.all(await arrayRequest.map(async (element) => {
        const player = await this.getByUsername(element.sender);
        const item: FriendListItem = { 
          username: player.username,
          nickname: player.nickname,
          avatar: player.avatar,
          friendship: (await this.checkFriendship(client, player.username)),
          position: 42, //TODO: forzato xk manca ancora tutto il resto
        }
        response.push(item);
      }))
    }
    return response;
  }

  async getListFriends(client: string){
    const arrayFriends = (await this.getByUsername(client)).friends;
    //console.log(arrayFriends);
    const response: string[] = [];
    if (arrayFriends)
    {
      await Promise.all(await arrayFriends.map(async (element) => {
        response.push(element);
      }))
    }
    return response;
  }

  async setOnlineStatus(userID: string){
    const client = await this.getById(Number(userID));
    await this.setOfflineStatus(userID);
    console.log(userID);
    if (client){
    const newbie = this.onlineRepository.create();
    newbie.id = Number(userID)
    newbie.status = 'online'
    newbie.user = client;
    return await this.onlineRepository.save(newbie);
    }
  }

  async setOfflineStatus(userID: string){
    const toSetOffline = await this.onlineRepository.findOne({ where : { id: Number(userID)} })
    if (toSetOffline)
      await this.onlineRepository.remove(toSetOffline);
  }

  async getOnlineFriends(client: string){
    console.log("help", client)
    const clientFriends = (await this.getByUsername(client)).friends;
    const onlineFriends = await this.onlineRepository
    .createQueryBuilder('online')
    .leftJoinAndSelect('online.user', 'user')
    .where('user.username IN (:...clientFriends)', {clientFriends: clientFriends})
    .andWhere("online.status = :online", {online: 'online'})
    .select(['online.id', 'user.username', 'user.nickname', 'user.avatar'])
    .getMany()
    .catch(() => {return null});
    //console.log("onlineFriends", onlineFriends);
    return onlineFriends;
  }
  
}