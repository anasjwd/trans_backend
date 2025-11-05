import AuthController from '../controllers/authController.js';

const authController = new AuthController();

async function authRoutes(fastify, options) {
    fastify.post('/signup', authController.signup);
    // TODO: add this endpoint:
    //fastify.post('/verify-email', authController.verifyEmail.bind(authController));
    // TODO: enable 2FA
    fastify.post('/signin', authController.signin);
    // TODO: add logout, change status from online to offline
}

export default authRoutes;
