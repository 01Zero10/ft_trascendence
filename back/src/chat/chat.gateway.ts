import { Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import {RoomMessages} from "./roomsMessages.entity"
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "src/user/user.service";
import { GameService } from "src/game/game.service";

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService,
            private userService: UserService,
            private gameService: GameService){}

  private logger: Logger = new Logger('ChatGateway');

  private UserDatabase = new Map();


  @WebSocketServer()
  server: Server; // Nest.js will populate server with the server for the gateway

  @SubscribeMessage('deleteUser')
  handleDeleteUser(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {usr: string}): any {
    //console.log("");
    //console.log("[deleteUser]");
    //capire cosa aggiungere
    this.server.emit('lostUser', data.usr);
    return data.usr;
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(
    @ConnectedSocket() clientSocket: Socket, 
    @MessageBody() data: {room: string, username: string, message: string, avatar: string}):
    Promise<WsResponse<{room: string, username: string, message: string, avatar: string}>> { 
    //console.log("");
    //console.log("[handleMessage?]")
    //console.log(data.room);
    //console.log(data.message);
    //const packMessage: RoomMessages = {...data, id: 1, userSocket: clientSocket.id, createdAt: new Date};
    const packMessage = await this.chatService.createMessage({...data, clientSocket})
    this.server.to(data.room).emit('msgToClient', packMessage);
    return {event:"msgToServer", data: data}; // equivalent to clientSocket.emit(data);
  }

  @SubscribeMessage('msgPrivateToServer')
  handlePrivateMessage(@MessageBody() data: {name: string, message: string}): 
    WsResponse<{name: string, message: string}> {
    //console.log("");
    //console.log("[handelPrivateMessage]");
    this.server.to(this.UserDatabase.get(data.name)).emit('msgPrivateToClient', data);
    return {event:"msgToServer", data: data}; 
}

  @SubscribeMessage('joinRoom') //RIPRENDERE DA QUI
  async handleJoinRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {client: string, room: string}): Promise<any> {
    //console.log("");
    //console.log("[joinRoom]")
    //console.log("client:", data.client);
    //console.log("room:", data.room);
    await this.chatService.createRoom(data.client, data.room);
    clientSocket.join(data.room);
    clientSocket.emit('joinedRoom', data.room);
    //console.log(`Client ${clientSocket.id} has joined the chatroom ${data.room}.`);
    return data.room;
  }

  @SubscribeMessage('expiredMuteOrBan')
  async checkExpiredMuteOrBan(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {channelName: string}): Promise<any> {
    // console.log("[expiredMuteOrBan] ", data.channelName);
    await this.chatService.expiredMuteOrBan(data.channelName);
    //this.server.emit('update', data.type);
  }

  @SubscribeMessage('singleMuteOrBanRemove')
  async singleMuteOrBanRemove(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {channelName: string, client: string, status: string}): Promise<any> {
    // console.log("[dataaaaaa] ", data.channelName, data.client, data.status);
    await this.chatService.singleMuteOrBanRemove(data.channelName, data.client, data.status);
    //this.server.emit('update', data.type);
  }

  @SubscribeMessage('updateList')
  handleUpdateListChannel(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {type: string}): any {
    // console.log("no, vabbe, dai", data.type);
    this.server.emit('update', data.type);
    return data.type;
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {room: string}): any {
    clientSocket.leave(data.room);
    clientSocket.emit('leftRoom', data.room);
    return data.room;
  }

  //Game-----

  @SubscribeMessage('onPress')
  handleKeyPress(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {key: string, side: string, playRoom: string}): any {
    console.log(data);
    console.log("pllll", data.playRoom)
    //if (data.key) 
    //this.server.to(data.playRoom).emit('onPress', data.key, data.side);
    if(data.key === 'w' || data.key === 'ArrowUp' )
      this.gameService.setKeysPlayerPress(data.playRoom, data.side)
    if (data.key === 's' || data.key === 'ArrowDown' )
      this.gameService.setKeysPlayerPress(data.playRoom, data.side, -1)
  }

  @SubscribeMessage('onRelease')
  handleKeyRelease(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {key: string, side: string, playRoom: string}): any {
    if(data.key === 'w' || data.key === 'ArrowUp' )
      this.gameService.setKeysPlayerRelease(data.playRoom, data.side)
    if (data.key === 's' || data.key === 'ArrowDown' )
      this.gameService.setKeysPlayerRelease(data.playRoom, data.side, -1)
  }

  @SubscribeMessage('connectToGame')
  async handleClientSide(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {username: string, avatar: string}): Promise<any> {
    const ret = await this.gameService.createOrJoinPlayRoom(data.username, data.avatar)
    clientSocket.join(ret.namePlayRoom);
    console.log("reeeet = ", ret);
    this.server.to(clientSocket.id).emit('connectedToGame', ret.namePlayRoom, ret.side)
  }

  @SubscribeMessage('requestOpponent') //RIPRENDERE DA QUI
  handleJoinPlayRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string, side: string}): any {
    console.log("socket = ", clientSocket.id);
    this.server.to(data.namePlayRoom).emit('ready', data.namePlayRoom)
  }

  @SubscribeMessage('gol_right')
  handleGol_right(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {name: string}){
    this.server.to(data.name).emit('restart', false)
  }

  @SubscribeMessage('gol_left')
  handleGol_left(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {name: string}){
    this.server.to(data.name).emit('restart', true)
  }

  @SubscribeMessage('setStart')
  async handleSetStart(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string}){
    console.log("socket start = ", clientSocket.id);
    const roomInMap = await this.gameService.generateBallDirection(data.namePlayRoom);
    console.log("romminmap ", roomInMap);
    this.server.to(data.namePlayRoom).emit('start', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
    this.startTick(data.namePlayRoom);
    //await this.sleep(3);
    //this.gameService.updateIdInterval(data.namePlayRoom, this.startTick(data.namePlayRoom));
    //console.log(typeof(id));
  }

  @SubscribeMessage('restart')
  async handleRestart(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string}){
    console.log(clientSocket.id)
    console.log('loooooog', data)
    this.startTick(data);
  }

  startTick(data: {namePlayRoom: string}) {
    var id = setInterval(async () => {
      let roomInMap = await this.gameService.updatePlayer(data.namePlayRoom);
      const restart = await this.gameService.updateBall(data.namePlayRoom);
      if (restart){
        roomInMap = await this.gameService.restart(data.namePlayRoom);
        console.log(roomInMap.ball);
        this.server.to(data.namePlayRoom).emit('update', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
        this.server.to(data.namePlayRoom).emit('goal', data.namePlayRoom, );
        clearInterval(id);
      }
      else
        this.server.to(data.namePlayRoom).emit('update', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
    }, 10)
  }
  //--------

  afterInit(server: Server) {
    this.logger.log('Init');
    //join memberships rooms;
  }

  async handleConnection(clientSocket: Socket) {
    await this.chatService.updateUserSocket(String(clientSocket.handshake.query.userID), clientSocket.id);
    //await this.userService.setOnlineStatus(String(clientSocket.handshake.query.userID));
    this.logger.log(`Client connected: ${clientSocket.id}`);
  }

  async handleDisconnect(clientSocket: Socket) {
    await this.userService.setOfflineStatus(String(clientSocket.handshake.query.userID));
    this.logger.log(`clientSocket disconnected: ${clientSocket.id}`);
  }

  async sleep(time: number) {
    await new Promise(f => setTimeout(f, time * 1000));
  }
}