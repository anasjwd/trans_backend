import {fastify} from 'fastify';
import fastifyCors from '@fastify/cors';
import jwtPlugin from './plugins/jwtPlugin.js';
import 'dotenv/config';

const app = fastify({logger: true});

app.register(jwtPlugin);

await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
});

await app.register(socialRoutes, {prefix: '/api'});

app.get('/health', async (request, reply) => {
    return {status: 'OK', timestamp: new Date().toISOString()};
})

const start = async () => {
    try {
        await app.listen({port: 3307});
        console.log('🚀 Server started successfully on http://localhost:3306');
    } catch(error) {
        app.log.error(error);
        process.exit(1);
    }
};


start();