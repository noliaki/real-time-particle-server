import * as http from 'http'
import express from 'express'
import dotenv from 'dotenv'
import socketIo from 'socket.io'
import cors from 'cors'
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

const app: express.Express = express()
app.use(cors())
const server: http.Server = http.createServer(app)

const io: socketIo.Server = socketIo(server)

io.on('connection', (socket: socketIo.Socket): void => {
  socket.on(SocketIoEvent.VIEW_JOIN_ROOM, () => {
    const roomId = uuidv4()
    socket.join(roomId, () => {
      io.to(roomId).emit(SocketIoEvent.VIEW_JOINED_ROOM, { roomId })
    })
  })

  socket.on(SocketIoEvent.CONTROLLER_JOIN_ROOM, ({ roomId }) => {
    console.log('SocketIoEvent.JOIN_ROOM: ' + roomId)
    socket.join(roomId, () => {
      io.to(roomId).emit(SocketIoEvent.CONTROLLER_JOINED_ROOM, { roomId })
    })
  })

  socket.on(SocketIoEvent.CONNECTED_CONTROLLER, ({ roomId }) => {
    io.to(roomId).emit(SocketIoEvent.CONNECTED_CONTROLLER, { roomId })
  })

  socket.on(
    SocketIoEvent.DEVICE_ORIENTATION,
    ({ roomId, alpah, beta, gamma }) => {
      if (!roomId) {
        return
      }

      console.log(alpah, beta, gamma)
    }
  )

  socket.on(
    SocketIoEvent.ON_CAMERA_POSITION_CHANGE,
    ({ roomId, x, y, z }): void => {
      if (!roomId) {
        return
      }

      io.to(roomId).emit(SocketIoEvent.ON_CAMERA_POSITION_CHANGE, { x, y, z })
    }
  )

  socket.on(
    SocketIoEvent.ON_UPLOAD_IMAGE,
    ({ roomId, imageRate, data }): void => {
      console.log(roomId, imageRate, data)
      io.to(roomId).emit(SocketIoEvent.ON_UPLOAD_IMAGE, { imageRate, data })
    }
  )
})

server.listen(parseInt(PORT, 10), '0.0.0.0', () => {
  console.log(`listen start: ${PORT}`)
})
