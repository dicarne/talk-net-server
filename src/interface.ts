
export type uid = string

export interface MessageData {
  type: 'text' | 'img' | 'r' | 'e'
  id: uid
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
    room: string
    text: string
  }
}



export interface ControlData {
  action: string
}


export interface ControlConnect extends ControlData {
  action: 'connect'
  id: uid
  name: string
}

export interface ControlEnterRoom extends ControlData {
  action: 'enter_room'
  id: uid
  room: string
  room_name?: string
  name: string
}

export interface ControlExitRoom extends ControlData {
    action: 'exit_room'
    id: uid
    room: string
    name: string
  }

export interface ControlLoginSuccess extends ControlData {
  action: 'login_success'
}