import ProfileController from '../controllers/profileController.js'

const profileController = new ProfileController();

async function profileRoutes(fastify, options) {
    fastify.get('/profile', {onRequest: [fastify.jwtAuth]}, profileController.getOwnProfile); // GET own profile
    // fastify.put('/profile', ); // Update own profile
    // fastify.get('/profile/:userId', ); // View another user's profile
}

export default profileRoutes;