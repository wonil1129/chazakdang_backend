const db = require('../../config/db');

exports.getUserDetailedInfo = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT u.user_id, u.user_name, u.profile_image, u.registration_date,
                   ui.age, ui.height, ui.weight, ui.sex, ui.preg, ui.dis
            FROM user u
            JOIN user_info ui ON u.user_id = ui.user_id
            WHERE u.user_id = ?
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('User not found'));
            resolve(results[0]);
        });
    });
};