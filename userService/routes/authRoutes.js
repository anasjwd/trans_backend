import AuthController from '../controllers/authController.js';
import {signupValidation, signinValidation} from '../middleware/validation.js'

const authController = new AuthController();

async function authRoutes(fastify, options) {
    fastify.post('/signup', {preValidation: [signupValidation]}, authController.signup);
    fastify.post('/signin', {preValidation: [signinValidation]}, authController.signin);
    // TODO: fastify.post('/verifyemail/:code', authController.verifyEmail);
    fastify.post('/logout', {onRequest: [fastify.jwtAuth]}, authController.logout);
}

export default authRoutes;