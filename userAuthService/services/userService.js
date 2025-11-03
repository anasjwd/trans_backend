import UserModel from "../models/user.js"

// TODO: name it as User
class UserService {
    constructor() {
        this.userModel = new UserModel();
    }

    register(userData) {
        const uniquenessCheck = this.userModel.isUniqueCredentials(userData.alias, userData.email);
        if (!uniquenessCheck.isValid) {
            throw new Error(`${uniquenessCheck.field} already exists`);
        }

        return this.userModel.create(userData);
    }

    login(alias, password) {
        const user = this.userModel.checkCredentials(alias, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return user;
    }

    getAllUsers() {
        return this.userModel.findAll();
    }

    getUserByAlias(alias) {
        return this.userModel.findByAlias(alias);
    }
}

export default UserService;