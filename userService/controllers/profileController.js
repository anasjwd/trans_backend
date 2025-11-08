import ProfileModel from "../models/profile.js";
import UserModel from "../models/user.js";

class ProfileController {
    constructor() {
        this.userModel = new UserModel();
        this.profileModel = new ProfileModel();
    }

    getOwnProfile = (request, reply) => {
        const userId = request.user.id;
        const {iat, ...user} =  request.user;
        try {
            const ownProfile = this.profileModel.getProfile(userId);
            return {
                success: true,
                profile: { ...user, ...ownProfile },
            };
        } catch(error) {
            if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({
                    success: false,
                    error: 'Database Error - Failed to get Profile'
                });
            } else {
                return reply.code(500).send({
                    success: false,
                    error: 'Interanl Server Error - Failed to get Profile'
                });
            }
        }
    }

    viewUserProfile = (request, reply) => {
        const userId = request.params.userId;
        try {
            const user = this.userModel.findById(userId);
            if (!user) {
                return reply.code(404).send({
                    success: false,
                    error: 'User not found'
                });
            }
            const profile = this.profileModel.getProfile(userId);
            if (!profile) {
                return reply.code(404).send({
                    success: false,
                    error: 'Profile can\'t be reached'
                });
            }
            return {
                success: true,
                profile: { ...user, ...profile },
            };
        } catch(error) {
            console.log(error);
            if (error.code && error.code.includes('SQLITE')) {
                return reply.code(500).send({
                    success: false,
                    error: 'Database Error - Failed to get Profile'
                });
            } else {
                return reply.code(500).send({
                    success: false,
                    error: 'Interanl Server Error - Failed to get Profile'
                });
            }
        }
    }

    updateProfile = (request, reply) => {
        const userId = request.user.id;
        const updates = request.body;
        if (Object.keys(updates).length === 0) {
            return {success: true, message: 'No updates are made'};
        }
        try {
            const result = this.profileModel.updateProfile(userId, updates);
            return {success: true, message: 'Profile updated'};
        } catch(error) {
            
        }
    }
}

export default ProfileController;