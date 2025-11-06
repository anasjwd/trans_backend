import dbInstance from "./database";

class ProfileModel {
    constructor() {
        this.db = dbInstance.getConnection();
    }

    createProfile(userId) {
        const stmt = this.db.prepare(`INSERT INTO user_profiles (id) VALUES(?)`);
        return stmt.run(userId);
    }

    getProfile(userId) {
        const stmt = this.db.prepare(`SELECT * FROM user_profiles WHERE id = ?`);
        return stmt.get(userId);
    }

    updateProfile(userId, updates) {
        const toUpdate = [];
        const values = [];
        const validFields = ['bio', 'avatar_url', 'status', 'rating', 'wins', 'losses'];
        
        Object.keys(updates).forEach(field => {
            if (validFields.includes(field)) {
                toUpdate.push(`${field} = ?`);
                values.push(updates[field]);
            }
        });
        if (toUpdate.length === 0) {
            return null;
        }
        const stmt = this.db.prepare(`UPDATE user_profiles SET ${toUpdate.join(', ')} WHERE id = ?`);
        return stmt.run(...values, userId);
    }

    createFriendship(userId, friendId) {
        const stmt = this.db.prepare(`INSERT INTO friendships (requester_id, requested_id) VALUES(?, ?)`);
        return stmt.run(userId, friendId);
    }
}