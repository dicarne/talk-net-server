
export type uid = string

export interface MessageData {
  type: 'text' | 'img' | 'r' | 'e'
  id: uid
  room: string
}

export interface ExitRoomMessage extends MessageData {
  type: 'e'
  detail: 'exit_room',
  target: {
    id: uid,
    name: string
  }
}

export interface TextMessage extends MessageData {
  type: 'text'
  name: string
  time: Date
  data: {
    text: string
  }
}



export interface ControlData {
  action: string
  room: string
}


export interface ControlConnect extends ControlData {
  action: 'connect'
  id: uid
  name: string
}

export interface ControlEnterRoom extends ControlData {
  action: 'enter_room'
  id: uid
  room_name?: string
  name: string
}

export interface ControlExitRoom extends ControlData {
  action: 'exit_room'
  id: uid
  name: string
}

export interface ControlLoginSuccess extends ControlData {
  action: 'login_success'
}

export interface ControlAskOnlineUsers extends ControlData {
  action: 'ask_online_users'
}

export interface ControlRespOnlineUsers extends ControlData {
  action: 'resp_online_users'
  count: number
}