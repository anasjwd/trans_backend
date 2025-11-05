<<<<<<< HEAD
import {fastify} from 'fastify';
=======
import Fastify from 'fastify';
>>>>>>> cbccef3 (initial commit)
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/authRoutes.js';
import jwtPlugin from './plugins/jwtPlugin.js';
import 'dotenv/config';

<<<<<<< HEAD
const app = fastify({logger: true});
=======
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
>>>>>>> cbccef3 (initial commit)

app.register(jwtPlugin);

await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
});

await app.register(authRoutes, {prefix: '/api/auth'});

app.get('/health', async (request, reply) => {
    return {status: 'OK', timestamp: new Date().toISOString()};
});

const start = async () => {
    try {
<<<<<<< HEAD
        await app.listen({port: 3306});
        console.log('🚀 Server started successfully on http://localhost:3306');
=======
        const address = await app.listen({port: PORT, host: HOST});
        app.log.info(`🚀 Server started successfully on ${address}`);
>>>>>>> cbccef3 (initial commit)
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};


start();
