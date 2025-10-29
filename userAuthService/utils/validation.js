export const userValidation = {
    validateAlias(alias) {
        if (!alias) {
            return {isValid: false, errorMsg: 'Alias is required'};
        } else if (typeof alias !== 'string') {
            return {isValid: false, errorMsg: 'Alias should be a string'};
        } else if (alias.length < 3) {
            return {isValid: false, errorMsg: 'Alias must be at least 3 characters'};
        } else if (alias.length > 20) {
            return {isValid: false, errorMsg: 'Alias must be less than 20 character'};
        } else if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
            return {isValid: false, errorMsg: 'Alias can only contain letters, numbers, underscores, and hyphens'};
        }

        return {isValid: true};
    },

    validateEmail(email) {
        if (!email) {
            return {isValid: false, errorMsg: 'Email is required'};
        } else if (typeof email !== 'string') {
            return {isValid: false, errorMsg: 'Email must be a string'};
        } else if (email.length > 254) {
            return {isValid: false, errorMsg: 'Email is too long'};
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  {
            return {isValid: false, errorMsg: 'Email format is invalid'};
        }

        return {isValid: true};
    },

    validatePassword(password) {
        if (!password) {
            return {isValid: false, errorMsg: 'Password is required'};
        } else if (typeof password !== 'string') {
            return {isValid: false, errorMsg: 'Password must be a string'};
        } else if (password.length < 8) {
            return {isValid: false, errorMsg: 'Password must be at least 8 characters'};
        }
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasLower || !hasUpper || !hasNumber) {
            return { isValid: false, errorMsg: 'Password must contain: lowercase letters, uppercase letters, and numbers' };
        }

        return {isValid: true};
    }
};