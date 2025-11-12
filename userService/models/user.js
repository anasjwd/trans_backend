import dbInstance from './database.js';
import bcrypt from 'bcrypt';

class UserModel {
    constructor() {
        this.db = dbInstance.getConnection();
    }

    getPublicInfo(id) {
        const stmt = this.db.prepare('SELECT id, first_name, last_name, alias, email FROM users WHERE id = ?');
        return stmt.get(id);
    }

    findAll() {
        const stmt = this.db.prepare('SELECT id, alias, email, created_at FROM users');
        return stmt.all();
    }

    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    findByAlias(alias) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE alias = ?');
        return stmt.get(alias);
    }

    findByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    }

    getKey(email) {
        const stmt = this.db.prepare(`SELECT key FROM users WHERE email = ?`);
        return stmt.get(email);
    }

    findByKey(key) {
        const stmt = this.db.prepare(`SELECT * FROM users WHERE key = ?`);
        return stmt.get(key);
    }

    areUniqueCredentials(alias, email) {
        const aliasExists = this.findByAlias(alias);
        const emailExists = this.findByEmail(email);

        if (aliasExists) return { isValid: false, field: 'alias' };
        if (emailExists) return { isValid: false, field: 'email' };
        return { isValid: true };
    }

    create(userData) {
        const unique = this.areUniqueCredentials(userData.alias, userData.email);
        if (unique.isValid === false) {
            if (unique.field === 'alias') {
                throw new Error('ALIAS_TAKEN');
            } else if (unique.field === 'email') {
                throw new Error('EMAIL_USED');
            }
        }
        const hashedPassword = bcrypt.hashSync(userData.password, 10);
        const stmt = this.db.prepare(`
            INSERT INTO users (first_name, last_name, alias, email, password, key)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(userData.firstName, userData.lastName, userData.alias, userData.email, hashedPassword, userData.key);
        return { id: result.lastInsertRowid, ...userData };
    }
    
    checkCredentials(alias, password) {
        const user = this.findByAlias(alias);
        if (!user) {
           throw new Error('USER_NOT_FOUND');
        }
        const passwordCorrect = bcrypt.compareSync(password, user.password);
        if (passwordCorrect === false) {
            throw new Error('PASSWORD_INCORRECT');
        }
        return user;
    }

    update2FASecret(userId, secret) {
        const stmt = this.db.prepare(`UPDATE users SET secret2fa = ? WHERE id = ?`);
        return stmt.run(secret, userId);
    }

    get2FA(userId) {
        const stmt = this.db.prepare(`SELECT secret2fa FROM users WHERE id = ?`);
        return stmt.get(userId);
    }
}

export default UserModel;