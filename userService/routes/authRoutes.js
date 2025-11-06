import AuthController from '../controllers/authController.js';

const authController = new AuthController();

async function authRoutes(fastify, options) {
    fastify.post('/auth/signup', authController.signup);
    fastify.post('/auth/signin', authController.signin);
    fastify.post('/verify-email', authController.verifyEmail);
    // logout should be protected using JWT
    fastify.post('/auth/logout', authController.logout);
}

export default authRoutes;