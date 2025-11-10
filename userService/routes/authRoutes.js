import AuthController from '../controllers/authController.js';
import {signupValidation, signinValidation} from '../middleware/validation.js'

const authController = new AuthController();

async function authRoutes(fastify, options) {
    fastify.post('/signup', {preValidation: [signupValidation]}, authController.signup);
    fastify.post('/signin', {preValidation: [signinValidation]}, authController.signin);
    fastify.post('/request-verification', {onRequest: [fastify.jwtAuth]}, authController.requestVerification);
    fastify.get('/verify-email/:key', authController.verifyEmail); // don't need to be protected
    fastify.post('/logout', {onRequest: [fastify.jwtAuth]}, authController.logout);
}

export default authRoutes;