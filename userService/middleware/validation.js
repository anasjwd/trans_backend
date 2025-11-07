
function areFieldsPresent(fields) {
    return Object.values(fields).every(field => field && field.trim() !== '');
}

function areAllStrings(fields) {
    return Object.values(fields).every(field => typeof field === 'string');
}

function isStrongPassword(password) {
    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters'};
    }
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLower || !hasUpper || !hasNumber) {
        return { isValid: false, error: 'Password must contain: lowercase letters, uppercase letters, and numbers' };
    }
    return { isValid: true };
}

function isValidEmail(email) {
    if (email.length > 254) {
        return { isValid: false, error: 'Email is too long' };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  {
        return { isValid: false, error: 'Email format is invalid' };
    }
    return { isValid: true };
}

function isValidAlias(alias) {
    if (alias.length < 3) {
        return { isValid: false, error: 'Alias must be at least 3 characters' };
    } else if (alias.length > 20) {
        return { isValid: false, error: 'Alias must be less that 20 characters' };
    }else if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        return { isValid: false, error: 'Alias can only container letters, numbers, underscors, and hyphens' };
    }
    return { isValid: true };
}

async function signupValidation(request, reply) {
    const {firstName, lastName, alias, email, password} = request.body;
    if (!areAllStrings({firstName, lastName, alias, email, password})) {
        return reply.code(400).send({
            success: false,
            error: 'Invalid data types'
        });
    } else if (!areFieldsPresent({firstName, lastName, alias, email, password})) {
        return reply.code(400).send({
            success: false,
            error: 'All fields are required'
        });
    }
    const aliasCheck = isValidAlias(alias);
    if (aliasCheck.isValid === false) {
        return reply.code(400).send({
            success: false,
            error: aliasCheck.error
        });
    }
    const emailCheck = isValidEmail(email);
    if (emailCheck.isValid === false) {
        return reply.code(400).send({
            success: false,
            error: emailCheck.error
        });
    }
    const passwordCheck = isStrongPassword(password);
    if (passwordCheck.isValid === false) {
        return reply.code(400).send({
            success: false,
            error: passwordCheck.error
        });
    }
    console.log("sigup successfully >>>>>>>>>>>>>>>>")
}

async function signinValidation(request, reply) {
    const {alias, password} = request.body;
    if (!areAllStrings({alias, password})) {
        return reply.code(400).send({
            success: false,
            error: 'Invalid data types'
        });
    } else if (!areFieldsPresent({alias, password})) {
        return reply.code(400).send({
            success: false,
            error: 'All fields are required'
        });
    }
} 

export {signupValidation, signinValidation};