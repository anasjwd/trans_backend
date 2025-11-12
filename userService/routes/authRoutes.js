import AuthController from '../controllers/authController.js';
import {signupValidation, loginValidation} from '../middleware/validation.js'

const authController = new AuthController();

async function authRoutes(fastify, options) {
    fastify.post('/signup', {preValidation: [signupValidation]}, authController.signup);
    fastify.post('/login', {preValidation: [loginValidation]}, authController.login);
    fastify.post('/logout', {onRequest: [fastify.jwtAuth]}, authController.logout);
    //TODO: delete user

    //Email verification:
    fastify.post('/request-verification', {onRequest: [fastify.jwtAuth]}, authController.requestVerification);
    fastify.get('/verify-email/:key', authController.verifyEmail); // don't need to be protected

    //2FA:
    fastify.put('/enable-2fa', {onRequest: [fastify.jwtAuth]}, authController.enable2FA);
    fastify.post('/validate-2fa', {onRequest: [fastify.jwtAuth]}, authController.validate2FA);
}

export default authRoutes;