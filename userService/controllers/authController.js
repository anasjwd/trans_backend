import UserModel from '../models/user.js'
import ProfileModel from '../models/profile.js';

class AuthController {
    constructor() {
        this.userModel = new UserModel();
        this.profileModel = new ProfileModel();
    }

    signup = async (request, reply) => {
        const {firstName, lastName, alias, email, password} = request.body;
        try {
            const user = await this.userModel.create({firstName, lastName, alias, email, password});
            const token = request.server.jwt.sign({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                alias: user.alias,
                email: user.email
            });
            reply.setCookie('token', token, {
                path: '/',
                httpOnly: true,
                secure: false, // TODO: false for HTTP, learn to use HTTPS
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            // TODO: add profile creation here
            const holder = this.profileModel.createProfile(user.id);
            console.log("_________________________________")
            console.log(holder);
            console.log("_________________________________")
            return {
                success: true, 
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    alias: user.alias,
                    email: user.email
                },
            };
        } catch(error) {
            if (error.message === 'ALIAS_TAKEN') {
                return reply.code(409).send({
                    success: false,
                    error: 'alias is taken'
                });
            } else if (error.message === 'EMAIL_USED') {
                return reply.code(409).send({
                    success: false,
                    error: 'Email already used'
                });
            } else if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - Failed to create user'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to create user'});
            }
        }
    }

    signin = async (request, reply) => {
        const {alias, password} = request.body;
        try {
            const user = this.userModel.checkCredentials(alias, password);
            const token = request.server.jwt.sign({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                alias: user.alias,
                email: user.email
            });
            reply.setCookie('token', token, {
                path: '/',
                httpOnly: true,
                secure: false, // false for HTTP
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return {
                success: true, 
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    alias: user.alias,
                    email: user.email
                },
            };
        } catch(error) {
            if (error.message === 'USER_NOT_FOUND') {
                return reply.code(404).send({ 
                    success: false, 
                    error: 'User not found' 
                });
            } else if (error.message === 'PASSWORD_INCORRECT') {
                return reply.code(401).send({ 
                    success: false, 
                    error: 'Invalid password' 
                });
            } else if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - failed to login'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to login'});
            }
        }
    }

    logout = async (request, reply) => {
        try {
            reply.setCookie('token', '', {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: -1,
            });
            // TODO: set status from online to offline in profile db
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch(error) {
            return reply.code(500).send({
                success: false,
                error: 'Logout failed'
            });
        }
    }
}

export default AuthController;