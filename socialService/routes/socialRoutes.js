import SocialController from '../controllers/socialController.js';

const socialController = new SocialController();

async function socialRoutes(fastify, options) {
    // Current user's profile
    fastify.post('/profile', socialController.createProfile.bind(socialController));
<<<<<<< HEAD
    fastify.get('/profile', socialController.getProfile.bind(socialController));
    fastify.put('/profile', socialController.updateProfile.bind(socialController));
=======
    fastify.get('/profile', {onRequest: [fastify.jwtAuth]}, socialController.getProfile.bind(socialController));
    fastify.put('/profile', {onRequest: [fastify.jwtAuth]}, socialController.updateProfile.bind(socialController));
>>>>>>> cbccef3 (initial commit)

    // Specific user's profile
    fastify.get('/:userId/profile', socialController.getUserProfile.bind(socialController));

    // Friendships
<<<<<<< HEAD
    fastify.get('/friends', socialController.getAllUserFriends.bind(socialController));
    fastify.get('/friends/requests/received', socialController.getReceivedRequests.bind(socialController));
    fastify.get('/friends/requests/sent', socialController.getSentRequests.bind(socialController));
    
    // Friend Requests
    fastify.post('/friends/:friendId', socialController.sendFriendRequest.bind(socialController));
    fastify.put('/friends/:friendId', socialController.acceptFriendRequest.bind(socialController));
    fastify.delete('/friends/:friendId', socialController.deleteFriendship.bind(socialController));
    
    // Friendship Status
    fastify.get('/friends/:friendId/status', socialController.getFriendshipStatus.bind(socialController));
    
    // Blocking/Unblocking
    fastify.put('/block/:friendId', socialController.blockFriend.bind(socialController));
    fastify.put('/unblock/:friendId', socialController.unblockFriend.bind(socialController));
=======
    fastify.get('/friends', {onRequest: [fastify.jwtAuth]}, socialController.getAllUserFriends.bind(socialController));
    fastify.get('/friends/requests/received', {onRequest: [fastify.jwtAuth]}, socialController.getReceivedRequests.bind(socialController));
    fastify.get('/friends/requests/sent', {onRequest: [fastify.jwtAuth]}, socialController.getSentRequests.bind(socialController));
    
    // Friend Requests
    fastify.post('/friends/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.sendFriendRequest.bind(socialController));
    fastify.put('/friends/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.acceptFriendRequest.bind(socialController));
    fastify.delete('/friends/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.deleteFriendship.bind(socialController));
    
    // Friendship Status
    fastify.get('/friends/:friendId/status', {onRequest: [fastify.jwtAuth]}, socialController.getFriendshipStatus.bind(socialController));
    
    // Blocking/Unblocking
    fastify.put('/block/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.blockFriend.bind(socialController));
    fastify.put('/unblock/:friendId', {onRequest: [fastify.jwtAuth]}, socialController.unblockFriend.bind(socialController));
>>>>>>> cbccef3 (initial commit)
}

export default socialRoutes;
