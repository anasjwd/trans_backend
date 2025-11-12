// shared database connection
import Database from 'better-sqlite3';

class DatabaseConnection {
    constructor() {
        if (DatabaseConnection.instance) {
            return DatabaseConnection.instance;
        }
        
        this.db = new Database('/home/ajawad/Projects/trans_backend-main/userService/database/user.db');
        this.db.pragma('foreign_keys = ON'); // Enable foreign keys
        this.initTables();
        
        DatabaseConnection.instance = this;
    }

    initTables() {
        // Users table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                alias TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                secret2fa TEXT DEFAULT NULL,
                key TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User profiles table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY,
                bio TEXT DEFAULT 'Hello, I am new here!',
                avatar_url TEXT,
                status TEXT DEFAULT 'online',
                rating INTEGER DEFAULT 100,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Trigger for updating updated_at
        this.db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_profile_timestamp
            AFTER UPDATE ON user_profiles
            WHEN NEW.updated_at = OLD.updated_at
            BEGIN
                UPDATE user_profiles
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        // Friendships table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS friendships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                requested_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                blocker_id INTEGER DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(requester_id, requested_id),
                FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (requested_id) REFERENCES users(id) ON DELETE CASCADE,
                CHECK (requester_id != requested_id)
            )
        `);

        // Trigger for preventing duplicate friendships (both directions)
        this.db.exec(`
            CREATE TRIGGER IF NOT EXISTS prevent_duplicate_friendship
            BEFORE INSERT ON friendships
            FOR EACH ROW
            WHEN EXISTS (
                SELECT 1 FROM friendships 
                WHERE (requester_id = NEW.requester_id AND requested_id = NEW.requested_id)
                   OR (requester_id = NEW.requested_id AND requested_id = NEW.requester_id)
            )
            BEGIN
                SELECT RAISE(ABORT, 'SQLITE_CONSTRAINT_UNIQUE: Friendship already exists');
            END;
        `);
    }

    getConnection() {
        return this.db;
    }

    close() {
        this.db.close();
    }
}

// Export singleton instance
const dbInstance = new DatabaseConnection();
export default dbInstance;