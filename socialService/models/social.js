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
            AFTER UPDATE
            ON user_profiles
            WHEN NEW.updated_at IS OLD.updated_at
            BEGIN
                UPDATE user_profiles
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `)
    }

    createProfile(userId) {
        const stmt = this.db.prepare(`
                INSERT INTO user_profiles (id) VALUES(?)
            `);
        return stmt.run(userId);
    }

    getProfile(userId) {
        const stmt = this.db.prepare(`
                SELECT 1 FROM user_profiles WHERE id = ?
            `);
        return stmt.get(userId);
    }

    updateProfile(userId, updates) {

    }
}

export default SocialModel;