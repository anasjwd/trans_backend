import SocialController from '../controllers/socialController.js';

const socialController = new SocialController();

async function socialRoutes(fastify, options) {
    fastify.get('/:userId', socialController.getUserProfile.bind(socialController));
    fastify.get('/friends', socialController.getFriends.bind(socialController));
};