const db = require('../../config/db');
const Joi = require('joi');


// 문의 생성
exports.createInquiry = () => {

};

// 문의 목록 조회
exports.getInquiriesList = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = `select id, title, inquiry_type, is_answered, created_at
                    from user_inquiry
                    where user_id = ?
                    `;
        db.query(sql, [user_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);      
        });
    });
};

// 문의 내용 조회
exports.getInquiryById = async (id) => {
    // 1. 문의 조회
    const inquiry = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM user_inquiry WHERE id = ?`;
        db.query(sql, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0] || null);
        });
    });
    if (!inquiry) return null;

    // 2. 답변이 있을 때만 답변 조회
    if (inquiry.is_answered) {
        inquiry.answer = await new Promise((resolve, reject) => {
            const answerSql = `SELECT * FROM inquiry_answer WHERE inquiry_id = ?`;
            db.query(answerSql, [id], (err, answerResults) => {
                if (err) return reject(err);
                resolve(answerResults[0] || null);
            });
        });
    } else {
        inquiry.answer = null;
    }
    return inquiry;
};