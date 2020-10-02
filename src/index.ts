import * as http from 'http'
import express from 'express'
import dotenv from 'dotenv'
import socketIo from 'socket.io'

dotenv.config()

const PORT: string = process.env.PORT || '8000'

const app: express.Express = express()
const server: http.Server = http.createServer(app)

const io: socketIo.Server = socketIo(server)

io.on('connection', (socket: socketIo.Socket): void => {
  console.log('a user connected')
})

server.listen(parseInt(PORT, 10), '0.0.0.0', () => {
  console.log(`listen start: ${PORT}`)
})
