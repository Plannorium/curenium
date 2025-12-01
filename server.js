const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Store io instance on the server
  httpServer.io = io;

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
    });

    socket.on('join_org', (orgId) => {
      socket.join(orgId);
      console.log(`user ${socket.id} joined org: ${orgId}`);
    });

    // Handle new lab order events
    socket.on('new_lab_order', (data) => {
      // Broadcast to all users in the same organization
      if (data.organizationId) {
        socket.to(data.organizationId).emit('new_lab_order', data);
      }
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on default path: /socket.io`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});