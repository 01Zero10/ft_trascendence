import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";
import { NavigationService } from "./navigation.service";

@WebSocketGateway({ cors: true })
@Injectable()
export class NavigationGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor( private userService: UserService,
            private navigationService: NavigationService,
    )
    {}

  private logger: Logger = new Logger('NavigationGateway');

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Notification Gateway On')
  }

  async handleConnection(clientSocket: Socket) {
    if (clientSocket.handshake.query.userID !== 'undefined' 
    && clientSocket.handshake.query.userID !== "null" 
    )
    {
        String(clientSocket.handshake.query.userID), clientSocket.id
      await this.navigationService.updateUserSocket(String(clientSocket.handshake.query.userID), clientSocket.id);
      // await this.userService.setOnlineStatus(String(clientSocket.handshake.query.userID));
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