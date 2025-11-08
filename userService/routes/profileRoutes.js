import ProfileController from '../controllers/profileController.js'

const profileController = new ProfileController();

async function profileRoutes(fastify, options) {
    fastify.get('/', {onRequest: [fastify.jwtAuth]}, profileController.getOwnProfile); // GET own profile
    // fastify.put('/', ); // Update own profile
    fastify.get('/:userId', {onRequest: [fastify.jwtAuth]}, profileController.viewUserProfile); // View another user's profile
}

export default profileRoutes;