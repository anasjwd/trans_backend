import SocialModel from '../models/social.js'

class SocialController {
    constructor() {
        this.socialDb = new SocialModel();
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

    createProfile = async (request, reply) => { //POST
        const userId = parseInt(request.headers['x-user-id']);
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }

        try {
            const result = this.socialDb.createProfile(userId);
            return {success: true, message: 'Profile created'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    getProfile = async (request, reply) => { //GET
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }

        try {
            const profile = this.socialDb.getProfile(userId);
            return {success: true, data: profile};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    getUserProfile = async (request, reply) => {
        const userId = parseInt(request.params.userId);
        if (!userId || isNaN(userId)) {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }

        try {
            const profile = this.socialDb.getProfile(userId);
            return {success: true, data: profile};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    updateProfile = async (request, reply) => { //PUT
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }
        const updates = request.body;
        if (Object.keys(updates).length === 0) {
            return {success: true, message: 'No Updates are made'};
        }
        try {
            const result = this.socialDb.updateProfile(userId, updates);
            return {success: true, message: 'Profile updated'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        } 
    }

    sendFriendRequest = async (request, reply) => { // POST
       const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }
        if (userId === friendId) {
            return reply.code(400).send({success: false, error: 'Cannot befriend yourself'});
        }
        try {
            this.socialDb.createFriendship(userId, friendId);
            return {success: true, message: 'Request sent'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    acceptFriendRequest = async (request, reply) => { // PUT
       const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }

        try {
            this.socialDb.acceptFriendship(userId, friendId);
            return {success: true, message: 'Request accepted'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    deleteFriendship = async (request, reply) => { // DELETE
        const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }

        try {
            this.socialDb.deleteFriendship(userId, friendId);
            return {success: true, message: 'Friend deleted'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    blockFriend = async (request, reply) => { // PUT
       const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }

        try {
            this.socialDb.blockFriendship(userId, friendId);
            return {success: true, message: 'Friend blocked'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    unblockFriend = async (request, reply) => { // PUT
       const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }

        try {
            this.socialDb.unblockFriendship(userId, friendId);
            return {success: true, message: 'Friend unblocked'};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    checkFriendship = async (request, reply) => {
       const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }

        try {
            const friendship = this.socialDb.checkFriendship(userId, friendId);
            if (friendship) {
                return {success: true, areFriends: true, data: friendship};
            } else {
                return {success: true, areFriends: false, data: null};
            }
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    getAllUserFriends = async (request, reply) => {
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }

        try {
            const friends = this.socialDb.getAllUserFriendships(userId);
            return {success: true, data: friends};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    getReceivedRequests = async (request, reply) => {
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }

        try {
            const recReq = this.socialDb.getReceivedRequests(userId);
            return {success: true, data: recReq};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    getSentRequests = async (request, reply) => {
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        }

        try {
            const recReq = this.socialDb.getSentRequests(userId);
            return {success: true, data: recReq};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    getFriendshipStatus = async (request, reply) => {
       const friendId = parseInt(request.params.friendId);
        const userId = request.user.id;
        if (!userId || typeof userId !== 'number') {
            return reply.code(400).send({success: false, error: 'The user ID should be a number'});
        } else if (!friendId || isNaN(friendId)) {
            return reply.code(400).send({success: false, error: 'The friend ID should be a number'});
        }

        try {
            const friendshipStatus = this.socialDb.getFriendshipStatus(userId, friendId);
            return {success: true, data: friendshipStatus};
        } catch (error) {
           if (error.code && error.code.includes('SQLITE')) {
                const {status, message} = this.handleSqlError(error.code);
                return reply.code(status).send({success: false, error: message});
           } else {
            return reply.code(500).send({success: false, error: 'Internal Server Error'});
           }
        }
    }

    close() {
        this.socialDb.close();
    }
}

export default SocialController;