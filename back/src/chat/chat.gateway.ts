import { Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import {RoomMessages} from "./roomsMessages.entity"
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService){}

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
    console.log("[expiredMuteOrBan] ", data.channelName);
    await this.chatService.expiredMuteOrBan(data.channelName);
    //this.server.emit('update', data.type);
  }

  @SubscribeMessage('singleMuteOrBanRemove')
  async singleMuteOrBanRemove(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {channelName: string, client: string, status: string}): Promise<any> {
    console.log("[dataaaaaa] ", data.channelName, data.client, data.status);
    await this.chatService.singleMuteOrBanRemove(data.channelName, data.client, data.status);
    //this.server.emit('update', data.type);
  }

  @SubscribeMessage('updateList')
  handleUpdateListChannel(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {type: string}): any {
    console.log("no, vabbe, dai", data.type);
    this.server.emit('update', data.type);
    return data.type;
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {room: string}): any {
    clientSocket.leave(data.room);
    clientSocket.emit('leftRoom', data.room);
    //console.log(`Client ${clientSocket.id} has left the chatroom.`);
    return data.room;
  }

  afterInit(server: Server) {
    this.logger.log('Init');
    //join memberships rooms;
  }

  handleConnection(clientSocket: Socket) {
    this.chatService.updateUserSocket(String(clientSocket.handshake.query.userID), clientSocket.id);
    this.logger.log(`Client connected: ${clientSocket.id}`);
  }

  handleDisconnect(clientSocket: Socket) {
    this.logger.log(`clientSocket disconnected: ${clientSocket.id}`)
  }
}