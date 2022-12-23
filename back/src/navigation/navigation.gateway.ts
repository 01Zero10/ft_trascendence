import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";
import { NavigationService } from "./navigation.service";

@WebSocketGateway({ cors: true })
@Injectable()
export class NavigationGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor( @Inject(forwardRef(() => UserService)) private userService: UserService,
            private navigationService: NavigationService,
    )
    {}

  private logger: Logger = new Logger('NavigationGateway');

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Notification Gateway On')
  }

  async updateBell(receiver: string){
    const client = await this.userService.getByUsername(receiver);
    console.log("client = ", client.username, " sock_id = ", client.socket_id);
    this.server.to(client.socket_id).emit('updateBell');
    //const id_socket = (await this.userService.getByUsername(receiver)).socket_id;
    //this.server.to(id_socket).emit('updateBell');
  }

  async handleConnection(clientSocket: Socket) {
    if (clientSocket.handshake.query.userID !== 'undefined' 
    && clientSocket.handshake.query.userID !== "null" 
    )
    {
        String(clientSocket.handshake.query.userID), clientSocket.id
      await this.navigationService.updateUserSocket(String(clientSocket.handshake.query.userID), clientSocket.id);
      await this.userService.setOnlineStatus(String(clientSocket.handshake.query.userID));
      this.logger.log(`Client connected: ${clientSocket.id}`);
    }
  }

  async handleDisconnect(clientSocket: Socket) {
    if (clientSocket.handshake.query.userID !== 'undefined' && clientSocket.handshake.query.userID !== "null")
    {
      await this.userService.setOfflineStatus(String(clientSocket.handshake.query.userID));
      this.logger.log(`clientSocket disconnected: ${clientSocket.id}`);
    }
    const client = String(clientSocket.handshake.query.userID);
    this.logger.log(`disconesso dal sito ${client}`);
  }
}