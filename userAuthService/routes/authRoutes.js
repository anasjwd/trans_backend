import AuthController from '../controllers/authController.js';

const authController = new AuthController();

async function authRoutes(fastify, options) {
    fastify.post('/signup', authController.signup.bind(authController));
    fastify.post('/signin', authController.signin.bind(authController));
}

export default authRoutes;