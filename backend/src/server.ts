import http from 'http';
import app from './app';
import { config } from './config';
import { initSocket } from './socket';
import prisma from './config/db';

const server = http.createServer(app);

initSocket(server);

server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Connectify API listening on port ${config.port} [${config.env}]`);
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
