import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";
import { GameService } from "src/game/game.service";

@WebSocketGateway({ cors: true, namespace: '/game' })
@Injectable()
export class GameGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => GameService)) private readonly gameService: GameService)
    {}

  private logger: Logger = new Logger('GameGateway');

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Game Gateway On')
  }

  async handleConnection(clientSocket: Socket) {
      this.logger.log(`connesso al GAME namespace ${clientSocket.id}`);
      //this.server.emit('ciao');
  }

  async handleDisconnect(clientSocket: Socket) {
      this.logger.log(`disconesso dal GAME namespace ${clientSocket.id}`);
      const client = String(clientSocket.handshake.query.username);
      const ret = this.gameService.handleLeaveQueue(client);
      if (!ret)
        this.gameService.handleLeavePlayRoom(client);
  }

  @SubscribeMessage('onPress')
  handleKeyPress(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {key: string, side: string, playRoom: string}): any {
    //console.log(data);
    //console.log("pllll", data.playRoom)
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
    //console.log("reeeet = ", ret);
    this.server.to(clientSocket.id).emit('connectedToGame', ret.namePlayRoom, ret.side)
  }

  @SubscribeMessage('requestOpponent') //RIPRENDERE DA QUI
  async handleJoinPlayRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string, side: string}): Promise<any> {
    //console.log("socket = ", clientSocket.id);
    const playRoom = await this.gameService.getPlayRoomByName(data.namePlayRoom);
    this.server.to(data.namePlayRoom).emit('ready', data.namePlayRoom, playRoom.leftSide, playRoom.rightSide)
  }

  @SubscribeMessage('setStart')
  async handleSetStart(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string, rightPlayer: string, leftPlayer: string}){
    console.log("start = ", data);
    const roomInMap = await this.gameService.generateBallDirection(data.namePlayRoom);
    //console.log("romminmap ", roomInMap);
    this.server.to(data.namePlayRoom).emit('start', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
    await this.sleep(3);
    this.startTick(data);
    //this.gameService.updateIdInterval(data.namePlayRoom, this.startTick(data.namePlayRoom));
    //console.log(typeof(id));
  }

  @SubscribeMessage('restart')
  async handleRestart(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string, rightPlayer: string, leftPlayer: string}){
    //console.log(clientSocket.id)
    console.log('loooooog', data)
    this.startTick(data);
  }

  async handleLeftGame(namePlayRoom: string){
    this.server.to(namePlayRoom).emit('endGame', 'left');
  }

  startTick(data: {namePlayRoom: string, rightPlayer: string, leftPlayer: string}) {
    this.gameService.mapPlRoom.get(data.namePlayRoom).idInterval = setInterval(async () => {
    //var id = setInterval(async () => {
      let roomInMap = await this.gameService.updatePlayer(data.namePlayRoom);
      const restart = await this.gameService.updateBall(data.namePlayRoom);
      if (restart){
        console.log("dataTick ", data);
        roomInMap = await this.gameService.restart(data.namePlayRoom);
        this.server.to(data.namePlayRoom).emit('update', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
        if (roomInMap.leftPoint !== 3 && roomInMap.rightPoint !== 3)
          this.server.to(data.namePlayRoom).emit('goal', data, restart);
        else
        {
          const winner = await this.gameService.saveMatch(data.namePlayRoom, roomInMap.leftPoint, roomInMap.rightPoint);
          this.server.to(data.namePlayRoom).emit('endGame', winner);
        }
        //clearInterval(id);
        clearInterval(this.gameService.mapPlRoom.get(data.namePlayRoom).idInterval)
      }
      else
        this.server.to(data.namePlayRoom).emit('update', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
    }, 10)
    //console.log(id);
  }

  async sleep(time: number) {
    await new Promise(f => setTimeout(f, time * 1000));
  }

}