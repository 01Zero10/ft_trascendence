import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
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
      this.server.to(clientSocket.id).emit('checkInvite');
  }

  async handleDisconnect(clientSocket: Socket) {
      this.logger.log(`disconesso dal GAME namespace ${clientSocket.id}`);
      const client = String(clientSocket.handshake.query.username);
      await this.gameService.handleLeaveQueue(client);
  }

  @SubscribeMessage('onPress')
  handleKeyPress(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {key: string, player: string, playRoom: string}): any {
    if(data.key === 'w' || data.key === 'ArrowUp' )
      this.gameService.setKeysPlayerPress(data.playRoom, data.player)
    if (data.key === 's' || data.key === 'ArrowDown' )
      this.gameService.setKeysPlayerPress(data.playRoom, data.player, -1)
  }

  @SubscribeMessage('onRelease')
  handleKeyRelease(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {key: string, player: string, playRoom: string}): any {
    if(data.key === 'w' || data.key === 'ArrowUp' )
      this.gameService.setKeysPlayerRelease(data.playRoom, data.player)
    if (data.key === 's' || data.key === 'ArrowDown' )
      this.gameService.setKeysPlayerRelease(data.playRoom, data.player, -1)
  }

  @SubscribeMessage('connectToGame')
  async handleClientSide(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {username: string, avatar: string}): Promise<any> {
    const ret = await this.gameService.createOrJoinPlayRoom(data.username, data.avatar)
    clientSocket.join(ret.namePlayRoom);
    if (ret.side === "right")
      this.server.to(ret.namePlayRoom).emit('ready', {namePlayRoom: ret.namePlayRoom, leftClient: ret.left, rightClient: ret.right});
    //this.server.to(clientSocket.id).emit('connectedToGame', ret.namePlayRoom, ret.side)
  }

  @SubscribeMessage('connectToInviteGame')
  async connectToInviteGame(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {client: string, playRoom: string, side: string}){
    console.log('connectToInviteGame');
    console.log(data);
    clientSocket.join(data.playRoom);
    if (data.side === "right")
      this.server.to(data.playRoom).emit('readyFromInvite', {namePlayRoom: data.playRoom, rightClient: data.client});
  }

  @SubscribeMessage('watchGameRequest')
  async handleWatchGame(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string, username: string}): Promise<any> {
    const ret = await this.gameService.getMatchByName(data.namePlayRoom);
    clientSocket.join(data.namePlayRoom);
      this.server.to(clientSocket.id).emit('watchGameConfirm', {nameRoom: data.namePlayRoom, leftClient: ret.leftPlayer.username , rightClient: ret.rightPlayer.username, leftPoints: ret.leftPoint, rightPoints: ret.rightPoint});
  }

  // @SubscribeMessage('requestOpponent')
  // async handleJoinPlayRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {namePlayRoom: string, side: string}): Promise<any> {
  //   const playRoom = await this.gameService.getPlayRoomByName(data.namePlayRoom);
  //   this.server.to(data.namePlayRoom).emit('ready', data.namePlayRoom, playRoom.leftSide, playRoom.rightSide)
  // }

  @SubscribeMessage('setStart')
  async handleSetStart(@ConnectedSocket() clientSocket: Socket, @MessageBody() namePlayRoom: string){//, rightPlayer: string, leftPlayer: string}){
    const roomInMap = await this.gameService.generateBallDirection(namePlayRoom);
    this.server.to(namePlayRoom).emit('start', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
    await this.sleep(3);
    this.startTick(namePlayRoom);
  }

  @SubscribeMessage('restart')
  async handleRestart(@ConnectedSocket() clientSocket: Socket, @MessageBody() roomName: string){
    this.startTick(roomName);
  }

  async handleLeftGame(namePlayRoom: string){
    this.server.to(namePlayRoom).emit('endGame', 'left');
  }

  startTick(namePlayRoom: string){//<, rightPlayer: string, leftPlayer: string}) {
    this.gameService.mapPlRoom.get(namePlayRoom).idInterval = setInterval(async () => {
      let roomInMap = await this.gameService.updatePlayer(namePlayRoom);
      const restart = await this.gameService.updateBall(namePlayRoom);
      if (restart){
        roomInMap = await this.gameService.restart(namePlayRoom);
        this.server.to(namePlayRoom).emit('update', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
        if (roomInMap.leftPoint !== 3 && roomInMap.rightPoint !== 3)
          this.server.to(namePlayRoom).emit('goal', {roomName: namePlayRoom, leftPoint: roomInMap.leftPoint,  rightPoint: roomInMap.rightPoint});//, restart);
        else
        {
          const winner = await this.gameService.saveMatch(namePlayRoom, roomInMap.leftPoint, roomInMap.rightPoint);
          this.server.to(namePlayRoom).emit('endGame', winner);
        }
        clearInterval(this.gameService.mapPlRoom.get(namePlayRoom).idInterval)
      }
      else
        this.server.to(namePlayRoom).emit('update', roomInMap.ball, roomInMap.leftPlayer, roomInMap.rightPlayer);
    }, 10)
  }

  async sleep(time: number) {
    await new Promise(f => setTimeout(f, time * 1000));
  }

}