import ProfileModel from "../models/profile";

class ProfileController {
    constructor() {
        this.profileModel = new ProfileModel();
    }

    getOwnProfile(request, reply) {
        const userId = request.user.id;
        try {
            const ownProfile = this.profileModel.getProfile(userId);
            return {
                success: true,
                profile: { ...request.user, ...ownProfile }
            }
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

    viewUserProfile(request, reply) {
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
            
        } catch(error) {

        }
    }

    // updateProfile(request, reply) {

    // }
}

export default ProfileController;