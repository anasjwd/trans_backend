import {userValidation} from '../utils/validation.js';
import {fastifyJwt} from '@fastify/jwt';
import UserModel from "../models/user.js"

class AuthController {
    constructor() {
        this.userModel = new UserModel();
        this.socialServiceUrl = process.env.SOCIAL_SERVICE_URL || 'http://localhost:3307';
    }

    handleSqlError(error) {
        switch (error.code) {
            case 'SQLITE_CONSTRAINT_UNIQUE':
                return { status: 409, message: 'Friendship already exists' };
            case 'SQLITE_CONSTRAINT_FOREIGNKEY':
                return { status: 404, message: 'User not found' };
            case 'SQLITE_CONSTRAINT_PRIMARYKEY':
                return { status: 409, message: 'Profile already exists' };
            case 'SQLITE_CONSTRAINT_NOTNULL':
                return { status: 400, message: 'Missing required fields' };
            case 'SQLITE_CONSTRAINT_CHECK':
                return { status: 400, message: 'Invalid data provided' };
            default:
                return { status: 500, message: 'Database error' };
        }
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
    signup = async (request, reply) => {
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
            const user = this.userModel.create({alias, email, password});
            // TODO: validate email
            const token = request.server.jwt.sign({
                id: user.id,
                alias: user.alias,
                email: user.email
            });
            
            const profileCreation = await this.createSocialProfile(user.id, token);
            if (!profileCreation.success) {
                console.warn(`User created but profile creation failed for user ${user.id}`);
                // TODO: You might want to implement a retry mechanism or queue here
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    alias: user.alias,
                    email: user.email
                },
                token: token,
                profileCreated: profileCreation.success
            };
        } catch (error) {
            if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
            }
            return reply.code(500).send({success: false, error: 'Failed to create user'});
        }
    }

    signin = async (request, reply) => {
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
            const user = this.userModel.checkCredentials(alias, password);
            if (!user) {
                return reply.code(401).send({
                    success: false,
                    error: 'Invalid alias or password'
                });
            }
            const token = request.server.jwt.sign({
                payload: {
                    alias: user.alias,
                    email: user.email,
                    id: user.id
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
            if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
            } else {
                return reply.code(500).send({
                    success:false,
                    error: 'Server Interal Error'
                });
            }
        }
    }
}


export default AuthController;