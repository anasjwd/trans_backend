import UserService from '../services/userService.js';
import {userValidation} from '../utils/validation.js';
import {fastifyJwt} from '@fastify/jwt';

class AuthController {
    constructor() {
        this.userService = new UserService();
<<<<<<< HEAD
    }

    // TODO: add a prehandler to validate credentials
    signup(request, reply) {
=======
        this.socialServiceUrl = process.env.SOCIAL_SERVICE_URL || 'http://localhost:3307';
    }

    async createSocialProfile(userId, token) {
        try {
            const response = await fetch(`${this.socialServiceUrl}/api/users/profile`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-user-id': userId
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to create social profile:', errorData);
                return { success: false, error: errorData };
            }

            return { success: true, data: await response.json() };
        } catch (error) {
            console.error('Error calling social service:', error);
            return { success: false, error: error.message };
        }
    }

    // TODO: add a prehandler to validate credentials
    async signup(request, reply) {
>>>>>>> cbccef3 (initial commit)
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
<<<<<<< HEAD
=======
            console.log(">>>>>>>>>>>>>>>>>1<<<<<<<<<<<<<<");
>>>>>>> cbccef3 (initial commit)
            // TODO: validate email
            const token = request.server.jwt.sign({
                id: user.id,
                alias: user.alias,
                email: user.email
            });
<<<<<<< HEAD
=======
            console.log(">>>>>>>>>>>>>>>>>2<<<<<<<<<<<<<<");

            const profileCreation = await this.createSocialProfile(user.id, token);
            console.log(">>>>>>>>>>>>>>>>>3<<<<<<<<<<<<<<");
            
            if (!profileCreation.success) {
                console.warn(`User created but profile creation failed for user ${user.id}`);
                // TODO: You might want to implement a retry mechanism or queue here
            }
            console.log(">>>>>>>>>>>>>>>>>4<<<<<<<<<<<<<<");


>>>>>>> cbccef3 (initial commit)
            return {
                success: true,
                user: {
                    id: user.id,
                    alias: user.alias,
                    email: user.email
                },
<<<<<<< HEAD
                token: token
=======
                token: token,
                profileCreated: profileCreation.success
>>>>>>> cbccef3 (initial commit)
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