import Database from 'better-sqlite3';

class SocialModel {
    constructor() {
        this.db = new Database('social.db');
        this.init();
    }

    init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY,
            bio TEXT,
            avatar_url TEXT,
            status TEXT DEFAULT 'online',
            rating INTEGER DEFAULT 100,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_updated_at
            AFTER UPDATE ON user_profiles
            WHEN NEW.updated_at = OLD.updated_at
            BEGIN
                UPDATE user_profiles
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS friendships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                friendA INTEGER NOT NULL,
                friendB INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                blocker INTEGER DEFAULT -1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(friendA, friendB),
                FOREIGN KEY (friendA) REFERENCES user_profiles(id) ON DELETE CASCADE,
                FOREIGN KEY (friendB) REFERENCES user_profiles(id) ON DELETE CASCADE
                )
        `);

        this.db.exec(`
            CREATE TRIGGER IF NOT EXISTS prevent_duplicate_pairs
            BEFORE INSERT ON friendships
            FOR EACH ROW
            WHEN EXISTS (
                SELECT 1 FROM friendships 
                WHERE (friendA = NEW.friendA AND friendB = NEW.friendB) 
                OR (friendA = NEW.friendB AND friendB = NEW.friendA)
            )
            BEGIN
                SELECT RAISE(ABORT, 'Duplicate pair detected');
            END;
        `);
    }

    createProfile(userId) {
        const stmt = this.db.prepare(`
                INSERT INTO user_profiles (id) VALUES(?)
            `);
        return stmt.run(userId);
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
        const stmt = this.db.prepare(`
            UPDATE user_profiles SET ${toUpdate.join(', ')} WHERE id = ?
            `);
            return stmt.run(...values, userId);
    }

    getProfile(userId) {
        const stmt = this.db.prepare(`
                SELECT * FROM user_profiles WHERE id = ?
            `);
        return stmt.get(userId);
    }

    createFriendship(userId, friendId) {
        const stmt = this.db.prepare(`
                INSERT INTO friendships (friendA, friendB) VALUES(?, ?)
            `);
        return stmt.run(userId, friendId);
    }

    acceptFriendship(userId, friendId) {
        const stmt = this.db.prepare(`
                UPDATE friendships SET status = 'accepted' WHERE friendA = ? AND friendB = ? AND status <> 'blocked'
            `)
        return stmt.run(friendId, userId);
    }

    deleteFriendship(userId, friendId) {
        const stmt = this.db.prepare(`
                DELETE FROM friendships WHERE (friendA = ? AND friendB = ?) OR (friendA = ? AND friendB = ?)
            `)
        return stmt.run(userId, friendId, friendId, userId);
    }

    blockFriendship(userId, friendId) {
        const stmt = this.db.prepare(`
                UPDATE friendships SET status = 'blocked', blocker = ? WHERE ((friendA = ? AND friendB = ?) OR (friendA = ? AND friendB = ?)) AND status <> 'blocked'
            `);
        return stmt.run(userId, userId, friendId, friendId, userId);
    }

    unblockFriendship(userId, friendId) {
        const stmt = this.db.prepare(`
                UPDATE friendships SET status = 'accepted', blocker = -1 WHERE ((friendA = ? AND friendB = ?) OR (friendA = ? AND friendB = ?)) AND blocker = ?
            `);
        return stmt.run(userId, friendId, friendId, userId, userId);
    }

    checkFriendship(userId, friendId) {
        const stmt = this.db.prepare(`
                SELECT * FROM friendships WHERE (friendA = ? AND friendB = ?) OR (friendA = ? AND friendB = ?)
            `);
        return stmt.get(userId, friendId, friendId, userId);
    }

    getAllUserFriendships(userId) {
        const stmt = this.db.prepare(`
                SELECT * FROM friendships WHERE (friendA = ? OR friendB = ?) AND status = 'accepted'
            `);
        return stmt.all(userId, userId);
    }

    getReceivedRequests(userId) {
        const stmt = this.db.prepare(`
                SELECT * FROM friendships WHERE friendB = ? AND status = 'pending'
            `);
        return stmt.all(userId);
    }

    getSentRequests(userId) {
        const stmt = this.db.prepare(`
                SELECT * FROM friendships WHERE friendA = ? AND status = 'pending'
            `);
        return stmt.all(userId);
    }

    getFriendshipStatus(userId, friendId) {
        const stmt = this.db.prepare(`
                SELECT status, blocker FROM friendships WHERE (friendA = ? AND friendB = ?) OR (friendA = ? AND friendB = ?)
            `);
        return stmt.get(userId, friendId, friendId, userId);
    }

    close() {
        this.db.close();
    }
}

export default SocialModel;