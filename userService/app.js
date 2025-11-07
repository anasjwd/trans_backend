import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import jwtPlugin from './plugins/jwtPlugin.js';
import fastifyCookie from '@fastify/cookie';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';

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

app.register(fastifyCookie);

app.register(jwtPlugin);

await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
});

await app.register(authRoutes, {prefix: '/api/users/auth'});

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
