import UserModel from '../models/user.js'

class authController {
    constructor() {
        this.userModel = new UserModel();
    }

    // TODO: validation middlewere should only validate input
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
            // TODO: add profile creation here
            return {
                success: true, 
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    alias: user.alias,
                    email: user.email
                },
                token: token,
                // TODO: add a profileCreated state attribue here
            };
        } catch(error) {
            if (error === 'ALIAS_TAKEN') {
                return reply.code(409).send({
                    success: false,
                    error: 'alias is taken'
                });
            } else if (error === 'EMAIL_USED') {
                return reply.code(409).send({
                    success: false,
                    error: 'Email already used'
                });
            } else if (error.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - Failed to create user'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to create user'});
            }
        }
    }

    signin = async (request, reply) => {
        const {alias, password} = request.body;
        try {
            const user = checkCredentials(alias, password);
            token = request.server.jwt.sign({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                alias: user.alias,
                email: user.email
            });
            return {
                success: true, 
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    alias: user.alias,
                    email: user.email
                },
                token: token,
            };
        } catch(error) {
            if (error === 'USER_NOT_FOUND') {
                return reply.code(404).send({ 
                    success: false, 
                    error: 'User not found' 
                });
            } else if (error === 'PASSWORD_INCORRECT') {
                return reply.code(401).send({ 
                    success: false, 
                    error: 'Invalid password' 
                });
            } else if (error.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - failed to login'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to login'});
            }
        }
    }
}
