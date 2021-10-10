import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'http';
import { uid, MessageData, TextMessage, ControlData, ControlConnect, ExitRoomMessage, ControlEnterRoom, ControlLoginSuccess } from './interface';

interface Client extends Socket {
  id: string
}

interface Talker {
  id: string
  session: Client
  name: string
  rooms: Set<string>
}

interface Room {
  talkers: Set<uid>
  name: string
}

@WebSocketGateway(8882)
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor() {
    this.talkers = new Map()
    this.clients = new Map()
    this.rooms = new Map()
  }

  handleConnection(client: Client, ...args: any) {
    console.log(`connected ${client.id}`)
  }

  handleDisconnect(client: Client) {
    console.log(`disconnect ${client.id}`)
    if (this.clients.has(client.id)) {
      const u = this.clients.get(client.id)
      this.logout(u)
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: MessageData,
    @ConnectedSocket() client: Client) {
    console.log("---message---")
    console.log(data)
    this.checkTalker(data.id, client.id)
    switch (data.type) {
      case 'text':
        const d = data as TextMessage
        const r = this.rooms.get(d.data.room)
        const sender = this.talkers.get(d.id)
        r.talkers.forEach(t => {
          if (true || t != d.id) {
            const ti = this.talkers.get(t)
            ti.session.emit('message', {
              type: 'text',
              id: data.id,
              name: sender.name,
              time: new Date,
              data: {
                room: d.data.room,
                text: d.data.text
              }
            } as TextMessage)
          }
        })
        break;

      default:
        break;
    }


    //client.emit('message', { type: 'r' })
  }

  @SubscribeMessage('control')
  handleControl(@MessageBody() data: ControlData,
    @ConnectedSocket() client: Client) {
    console.log("---control---")
    console.log(data)
    switch (data.action) {
      case 'connect': {
        const c = data as ControlConnect
        this.clients.set(client.id, c.id)
        if (!this.talkers.has(c.id)) {
          this.talkers.set(c.id, {
            id: c.id,
            session: client,
            name: c.name,
            rooms: new Set()
          })
        } else {
          this.talkers.get(c.id).session = client;
        }
      }
        break;
      case 'enter_room': {
        const c = data as ControlEnterRoom
        if (!this.rooms.has(c.room)) {
          this.rooms.set(c.room, {
            name: 'ROOM',
            talkers: new Set()
          })
        }
        const r = this.rooms.get(c.room)
        r.talkers.add(c.id)
        const t = this.talkers.get(c.id)
        t.rooms.add(c.room)
        client.emit('control', {
          action: 'login_success'
        } as ControlLoginSuccess)
      }
        break;
      default:
        break;
    }
  }

  talkers: Map<uid, Talker>
  clients: Map<string, uid>
  rooms: Map<string, Room>

  exitRoom(talker: uid, room: string) {
    const r = this.rooms.get(room)
    r.talkers.delete(talker)
    const t = this.talkers.get(talker)
    r.talkers.forEach(v => {
      this.talkers.get(v).session.emit('message', {
        type: 'e',
        detail: 'exit_room',
        target: {
          id: talker,
          name: t.name
        }
      } as ExitRoomMessage)
    })
  }

  logout(talker: uid) {
    const u = this.talkers.get(talker)
    if (u) {
      u.rooms.forEach(r => this.exitRoom(talker, r))
      this.talkers.delete(talker)
    }

  }

  checkTalker(talker: uid, client: string) {
    const c = this.clients.get(client)
    if (c) {
      if (!this.talkers.has(c))
        throw new Error("User Denine")
      else return
    }
    throw new Error("User Denine")
  }
}
