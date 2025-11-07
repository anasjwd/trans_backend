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

    // viewUserProfile(request, reply) {

    // }

    // updateProfile(request, reply) {

    // }
}

export default ProfileController;