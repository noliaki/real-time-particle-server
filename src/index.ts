import dotenv from 'dotenv'
import socketIo from 'socket.io'
import { v4 as uuidv4 } from 'uuid'

export const SocketIoEvent = {
  VIEW_JOIN_ROOM: 'VIEW_JOIN_ROOM',
  VIEW_JOINED_ROOM: 'VIEW_JOINED_ROOM',
  CONTROLLER_JOIN_ROOM: 'CONTROLLER_JOIN_ROOM',
  CONTROLLER_JOINED_ROOM: 'CONTROLLER_JOINED_ROOM',
  ON_CAMERA_POSITION_CHANGE: 'ON_CAMERA_POSITION_CHANGE',
  ON_UPLOAD_IMAGE: 'ON_UPLOAD_IMAGE',

  CONNECTED_CONTROLLER: 'CONNECTED_CONTROLLER',
  MOVE_CAMERA: 'MOVE_CAMERA',
  DEVICE_ORIENTATION: 'DEVICE_ORIENTATION',
} as const

export type SocketIoEvent = typeof SocketIoEvent[keyof typeof SocketIoEvent]

dotenv.config()

const PORT: string = process.env.PORT || '8000'

const io: socketIo.Server = socketIo(PORT, {
  origins: process.env.ALLOW_ORIGIN || '*:*',
})

io.on('connection', (socket: socketIo.Socket): void => {
  socket.on(SocketIoEvent.VIEW_JOIN_ROOM, () => {
    const roomId = uuidv4()

    socket.join(roomId, () => {
      io.to(roomId).emit(SocketIoEvent.VIEW_JOINED_ROOM, { roomId })
    })
  })

  socket.on(SocketIoEvent.CONTROLLER_JOIN_ROOM, ({ roomId }) => {
    console.log(socket.rooms)

    socket.join(roomId, () => {
      io.to(roomId).emit(SocketIoEvent.CONTROLLER_JOINED_ROOM, { roomId })
    })
  })

  socket.on(SocketIoEvent.CONNECTED_CONTROLLER, ({ roomId }) => {
    if (socket.rooms[roomId] !== roomId) {
      return
    }

    io.to(roomId).emit(SocketIoEvent.CONNECTED_CONTROLLER, { roomId })
  })

  socket.on(
    SocketIoEvent.DEVICE_ORIENTATION,
    ({ roomId, alpah, beta, gamma }) => {
      if (socket.rooms[roomId] !== roomId) {
        return
      }

      console.log(alpah, beta, gamma)
    }
  )

  socket.on(
    SocketIoEvent.ON_CAMERA_POSITION_CHANGE,
    ({ roomId, x, y, z }): void => {
      if (socket.rooms[roomId] !== roomId) {
        return
      }

      io.to(roomId).emit(SocketIoEvent.ON_CAMERA_POSITION_CHANGE, { x, y, z })
    }
  )

  socket.on(
    SocketIoEvent.ON_UPLOAD_IMAGE,
    ({ roomId, imageRate, data }): void => {
      if (socket.rooms[roomId] !== roomId) {
        return
      }

      io.to(roomId).emit(SocketIoEvent.ON_UPLOAD_IMAGE, { imageRate, data })
    }
  )
})
