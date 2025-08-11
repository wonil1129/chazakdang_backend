const pool = require('../../config/db');
const Joi = require('joi');


// 1. 게시글 작성
exports.createPost = (user_id, title, content) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO board (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())';

        pool.query(sql, [user_id, title, content], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// 댓글 작성
exports.createComment = (postId, userId, content) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO comment (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())';

        pool.query(sql, [postId, userId, content], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// 2. 게시글 목록 조회 
exports.getBoardList = (page) => {
    return new Promise((resolve, reject) => {
        const pageSize = 10; // 페이지당 게시글 수
        const offset = (page - 1) * pageSize;
        const sql = 'SELECT * FROM board ORDER BY created_at DESC LIMIT ? OFFSET ?';

        pool.query(sql, [pageSize, offset], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// 3. 게시글 상세 조회
exports.getBoardDetail = (postId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT  FROM board WHERE post_id = ?';

        pool.query(sql, [postId], (err, result) => {
            if (err) return reject(err);
            resolve(result[0] || null);
        });
    });
};

