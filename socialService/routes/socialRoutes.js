import SocialController from '../controllers/socialController.js';

const socialController = new SocialController();

async function socialRoutes(fastify, options) {
    // Current user's profile
    fastify.post('/profile', socialController.createProfile);
    fastify.get('/profile', {onRequest: [fastify.jwtAuth]}, socialController.getProfile);
    fastify.put('/profile', {onRequest: [fastify.jwtAuth]}, socialController.updateProfile);

    // Specific user's profile
    fastify.get('/:userId/profile', socialController.getUserProfile);

    // Friendships
    fastify.get('/friends', {onRequest: [fastify.jwtAuth]}, socialController.getAllUserFriends);
    fastify.get('/friends/requests/received', {onRequest: [fastify.jwtAuth]}, socialController.getReceivedRequests);
    fastify.get('/friends/requests/sent', {onRequest: [fastify.jwtAuth]}, socialController.getSentRequests);
    
    // Friend Requests
    fastify.post('/friends/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.sendFriendRequest);
    fastify.put('/friends/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.acceptFriendRequest);
    fastify.delete('/friends/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.deleteFriendship);
    
    // Friendship Status
    fastify.get('/friends/:friendId/status', {onRequest: [fastify.jwtAuth]}, socialController.getFriendshipStatus);
    
    // Blocking/Unblocking
    fastify.put('/block/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.blockFriend);
    fastify.put('/unblock/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.unblockFriend);
}

export default socialRoutes;
