import dbInstance from './database.js';
import bcrypt from 'bcrypt';

class UserModel {
    constructor() {
        this.db = dbInstance.getConnection();
    }

    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    findAll() {
        const stmt = this.db.prepare('SELECT id, alias, email, created_at FROM users');
        return stmt.all();
    }

    findByAlias(alias) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE alias = ?');
        return stmt.get(alias);
    }

    findByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
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
            INSERT INTO users (first_name, last_name, alias, email, password)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(userData.firstName, userData.lastName, userData.alias, userData.email, hashedPassword);
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
}

export default UserModel;