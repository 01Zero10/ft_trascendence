import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import {RoomMessages} from "./roomsMessages.entity"
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "src/user/user.service";
import { GameService } from "src/game/game.service";

@WebSocketGateway({ cors: true, namespace: '/chat' })
@Injectable()
export class ChatGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    //@Inject(forwardRef(() => GameService)) private readonly gameService: GameService
    @Inject(forwardRef(() => ChatService)) private chatService: ChatService,
            private userService: UserService,
          ){}

  private logger: Logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server; // Nest.js will populate server with the server for the gateway

  @SubscribeMessage('deleteUser')
  handleDeleteUser(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {usr: string}): any {
    //capire cosa aggiungere
    this.server.emit('lostUser', data.usr);
    return data.usr;
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(
    @ConnectedSocket() clientSocket: Socket, 
    @MessageBody() data: {room: string, username: string, message: string, avatar: string, type: string}):
    Promise<WsResponse<{room: string, username: string, message: string, avatar: string}>> { 
    const packMessage = await this.chatService.createMessage({...data, clientSocket}, data.type)
    this.server.to(data.room).emit('msgToClient', packMessage);
    return {event:"msgToServer", data: data}; // equivalent to clientSocket.emit(data);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {client: string, room: string}): Promise<any> {
    await this.chatService.createRoom(data.client, data.room);
    clientSocket.join(data.room);
    clientSocket.emit('joinedRoom', data.room);
    return data.room;
  }

  @SubscribeMessage('expiredMuteOrBan')
  async checkExpiredMuteOrBan(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {channelName: string}): Promise<any> {
    await this.chatService.expiredMuteOrBan(data.channelName);
  }

  @SubscribeMessage('singleMuteOrBanRemove')
  async singleMuteOrBanRemove(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {channelName: string, client: string, status: string}): Promise<any> {
    await this.chatService.singleMuteOrBanRemove(data.channelName, data.client, data.status);
  }

  @SubscribeMessage('updateList')
  handleUpdateListChannel(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {type: string}): any {
    this.server.emit('update', data.type);
    return data.type;
  }

  async handleUpdateListMembers(channelName: string){
    this.server.to(channelName).emit('updateListMembers');
  }

  async updateAllListMembers(){
    this.server.emit('updateAllListMembers');
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {room: string}): any {
    clientSocket.leave(data.room);
    clientSocket.emit('leftRoom', data.room);
    return data.room;
  }

  afterInit(server: Server) {
    this.logger.log('Init')
    //join memberships rooms;
  }

  async handleConnection(clientSocket: Socket) {
    const client_id = String(clientSocket.handshake.query.userID);
    this.logger.log(`client ${client_id} ${clientSocket.id} arrived in /chat`);
    // if (clientSocket.handshake.query.userID !== 'undefined' 
    // && clientSocket.handshake.query.userID !== "null" 
    // )
    // {
    //   await this.chatService.updateUserSocket(String(clientSocket.handshake.query.userID), clientSocket.id);
    //   await this.userService.setOnlineStatus(String(clientSocket.handshake.query.userID));
    //   this.logger.log(`Client connected: ${clientSocket.id}`);
    // }
  }

  async handleDisconnect(clientSocket: Socket) {
    const client_id = String(clientSocket.handshake.query.userID);
    this.logger.log(`client ${client_id} ${clientSocket.id} left /chat`);
    // if (clientSocket.handshake.query.userID !== 'undefined' && clientSocket.handshake.query.userID !== "null")
    // {
    //   await this.userService.setOfflineStatus(String(clientSocket.handshake.query.userID));
    //   this.logger.log(`clientSocket disconnected: ${clientSocket.id}`);
    // }
  }

  async sleep(time: number) {
    await new Promise(f => setTimeout(f, time * 1000));
  }
}