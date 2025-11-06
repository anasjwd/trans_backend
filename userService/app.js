import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import jwtPlugin from './plugins/jwtPlugin.js';
import 'dotenv/config';

const PORT = Number(process.env.PORT) || 3306;
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  }
});

app.register(jwtPlugin);

await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
});

//await app.register(, {prefix: '/api/user'});

app.get('/health', async (request, reply) => {
    return {status: 'OK', timestamp: new Date().toISOString()};
});

const start = async () => {
    try {
        const address = await app.listen({port: PORT, host: HOST});
        app.log.info(`🚀 Server started successfully on ${address}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};


start();
