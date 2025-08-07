const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {hashPassword, verifyPassword};