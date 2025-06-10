import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { PORT } from './lib/constants';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3001', // 프론트 주소
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(' 소켓 연결됨:', socket.id);
});

export { io };

httpServer.listen(PORT, () => {
  console.log(` 서버 실행됨! http://localhost:${PORT}`);
});
