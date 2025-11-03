import UserService from '../services/userService.js';
import {userValidation} from '../utils/validation.js';
import {fastifyJwt} from '@fastify/jwt';

class AuthController {
    constructor() {
        this.userService = new UserService();
    }

    // TODO: add a prehandler to validate credentials
    signup(request, reply) {
        const {alias, email, password} = request.body;
        const errors = {};

        const aliasValidation = userValidation.validateAlias(alias);
        if (!aliasValidation.isValid) {
            errors.alias = aliasValidation.errorMsg;
        }

        const emailValidation = userValidation.validateEmail(email);
        if (!emailValidation.isValid) {
            errors.email = emailValidation.errorMsg;
        }

        const passwordValidation = userValidation.validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errorMsg;
        }

        if (Object.keys(errors).length > 0) {
            return reply.code(400).send({success: false, errors});
        }

        try {
            // TODO: check if user is unique
            const user = this.userService.register({alias, email, password});
            // TODO: validate email
            const token = request.server.jwt.sign({
                id: user.id,
                alias: user.alias,
                email: user.email
            });
            return {
                success: true,
                user: {
                    id: user.id,
                    alias: user.alias,
                    email: user.email
                },
                token: token
            };
        } catch (error) {
            if (error.message.includes('alias')) {
                errors.alias = 'Alias already exists';
            } else if (error.message.includes('email')) {
                errors.email = 'Email already exists';
            } else {
                return reply.code(500).send({
                    success: false,
                    error: 'Failed to create user'
                });
            }

            if (Object.keys(errors).length > 0) {
                return reply.code(400).send({success: false, errors});
            }
        }
    }

    signin(request, reply) {
        const {alias, password} = request.body;
        const errors = {};

        if (!alias) {
            errors.alias = 'Alias is required';
        } else if (typeof alias !== 'string') {
            errors.alias = 'Alias should be a string';
        }
        if (!password) {
            errors.password = 'Password is required';
        } else if (typeof password !== 'string') {
            errors.password = 'Password must be a string';
        }

        if (Object.keys(errors).length > 0) {
            return reply.code(400).send({success: false, errors});
        }

        try {
            const user = this.userService.login(alias, password);
            const token = fastify.jwt.sign({
                payload: {
                    alias, email: user.email, id: user.id
                }
            });
            return reply.send({
                success: true,
                user: {
                    id: user.id,
                    alias: user.alias,
                    email: user.email
                },
                token: token
            });
        } catch(error) {
            return reply.code(401).send({
                success:false,
                error: 'Invalid alias or password'
            });
        }
    }
}


export default AuthController;