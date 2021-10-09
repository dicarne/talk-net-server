import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'http';

interface MessageData {
  type: 'text' | 'img' | 'r' | 'e',
  payload: string
}

interface ControlData {
  data: string
}

interface Client extends Socket {
  id: string
}

@WebSocketGateway(8882)
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Client, ...args: any) {
    console.log(`connected ${client.id}`)
    console.log(args)
  }

  handleDisconnect(client: Client) {
    console.log(`disconnect ${client.id}`)
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: MessageData,
    @ConnectedSocket() client: Socket,) {
    console.log("---message---")
    console.log(data)
    client.emit('message', { type: 'r' })
  }
  @SubscribeMessage('control')
  handleControl(@MessageBody() data: ControlData,
    @ConnectedSocket() client: Socket,) {
    console.log("---control---")
    console.log(data)
  }
}
