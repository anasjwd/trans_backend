import Database from "better-sqlite3";

class UserModel {
  constructor() {
    this.db = new Database("users.db");
    this.init();
  }

  init() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alias TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
  }

  findAll() {
    const stmt = this.db.prepare("SELECT * FROM users");
    return stmt.all();
  }

  findByAlias(alias) {
    const stmt = this.db.prepare("SELECT * FROM users WHERE alias = ?");
    return stmt.get(alias);
  }

  findById(id) {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");
    return stmt.get(id);
  }

  findByEmail(email) {
    const stmt = this.db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email);
  }

  create(userData) {
    const stmt = this.db.prepare(`
            INSERT INTO users (alias, email, password)
            VALUES (?, ?, ?)
        `);
    const result = stmt.run(userData.alias, userData.email, userData.password);
    return { id: result.lastInsertRowid, ...userData };
  }

  checkCredentials(alias, password) {
    const stmt = this.db.prepare(
      "SELECT id, alias, email FROM users WHERE alias = ? AND password = ?"
    );
    return stmt.get(alias, password);
  }

  isUniqueCredentials(alias, email) {
    const aliasExists = this.findByAlias(alias);
    const emailExists = this.findByEmail(email);

    if (aliasExists) return { isValid: false, field: "alias" };
    if (emailExists) return { isValid: false, field: "email" };
    return { isValid: true };
  }
}

export default UserModel;
