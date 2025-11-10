import UserModel from '../models/user.js'
import ProfileModel from '../models/profile.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

class AuthController {
    constructor() {
        this.userModel = new UserModel();
        this.profileModel = new ProfileModel();
    }

    signup = async (request, reply) => {
        const {firstName, lastName, alias, email, password} = request.body;
        try {
            const key = crypto.randomBytes(16).toString('hex');
            const user = await this.userModel.create({firstName, lastName, alias, email, password, key});
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
            const holder = this.profileModel.createProfile(user.id);
            return {
                success: true, 
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    alias: user.alias,
                    email: user.email
                },
                profileCreated: holder.changes === 1 ? true : false,
            };
        } catch(error) {
            console.log(error);
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
            this.profileModel.updateProfile(request.user.id, {'status': 'offline'});
            reply.setCookie('token', '', {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: -1,
            });
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch(error) {
            if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - failed to logout'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to logout'});
            }
        }
    }

    sendMail = (email, key) => {
        let Transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "anasjawad7777@gmail.com",
                pass: "losa ppku ybdl ozvf"
            }
        });
        const sender = "anas jawad";
        let mailOption = {
            from: sender,
            to: email,
            subject: "Email Confirmation",
            html: `Press <a href=http://localhost:3306/api/users/auth/verify-email/${key}> here </a> to verify your email. Thanks`
        };
        Transport.sendMail(mailOption, (error, response) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Message sent");
            }
        })
    }

    requestVerification = async (request, reply) => {
        const {email} = request.user;
        try {
            const holder = this.userModel.getKey(email);
            this.sendMail(email, holder.key);
        } catch(error) {
            if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - failed to send request'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to send request'});
            }
        }
    }

    verifyEmail = async (request, reply) => {
        const {key} = request.params;
        try {
            const user = this.userModel.findByKey(key);
            if (!user) {
                return reply.code(400).send({
                    success: false,
                    error: 'Failed to verify email - Invalid key'
                });
            }
            this.profileModel.updateProfile(user.id, {"verified":"1"});
            return {success: true, message: 'Email verified successfully'};
        } catch(error) {
            if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({success: false, error: 'Database Error - failed to verify email'});
            } else {
                return reply.code(500).send({success: false, error: 'Internal Server Error - Failed to verify email'});
            }
        }
    }
}

export default AuthController;