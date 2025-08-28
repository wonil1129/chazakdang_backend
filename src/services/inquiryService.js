const db = require('../../config/db');
const Joi = require('joi');



// 문의 생성
exports.createInquiry = (inquiry_type, title, content, user_id) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO user_inquiry (inquiry_type, title, content, user_id, created_at) VALUES (?, ?, ?, ?, NOW())`;
        db.query(sql, [inquiry_type, title, content, user_id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    })
};

// 문의 삭제
exports.deleteInquiry = (inquiryId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM user_inquiry WHERE id = ? AND user_id = ?`;
        db.query(sql, [inquiryId, userId], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

// 문의 수정
exports.updateInquiry = (inquiryId, userId, updateFields) => {
    return new Promise((resolve, reject) => {
        // 허용할 컬럼 목록
        const allowedFields = ['inquiry_type', 'title', 'content'];
        const setClauses = [];
        const params = [];

        allowedFields.forEach(field => {
            if (updateFields[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                params.push(updateFields[field]);
            }
        });

        if (setClauses.length === 0) {
            return resolve({ message: '수정할 값이 없습니다.', changedRows: 0 });
        }

        params.push(inquiryId, userId);

        const sql = `
            UPDATE user_inquiry
            SET ${setClauses.join(', ')}
            WHERE id = ? AND user_id = ?
        `;

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// 문의 목록 조회
exports.getInquiriesList = (user_id, page, limit, inquiry_type) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        let sql = `SELECT id, title, inquiry_type, is_answered, created_at
                   FROM user_inquiry
                   WHERE user_id = ?`;
        const params = [user_id];

        if (inquiry_type) {
            sql += ` AND inquiry_type = ?`;
            params.push(inquiry_type);
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, (err, results) => {
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
    return inquiry;
};

// 문의 생성 검증 스키마
exports.inquiryCreateSchema = Joi.object({
    inquiry_type: Joi.string().required(),
    title: Joi.string().required(),
    content: Joi.string().required()
});

// 문의 수정 검증 스키마
exports.inquiryUpdateSchema = Joi.object({
    inquiry_type: Joi.string(),
    title: Joi.string(),
    content: Joi.string()
}).min(1); // 최소 1개 필드는 있어야 함

