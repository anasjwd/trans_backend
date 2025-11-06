import fastifyPlugin from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function jwtPlugin(fastify, opts) {
    await fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET });

    fastify.decorate("jwtAuth", async function(request, reply){
        try {
            await request.jwtVerify();
        } catch(error) {
            reply.code(401).send({success: false, message: 'Unauthorized'});
        }
    });
}

export default fastifyPlugin(jwtPlugin);