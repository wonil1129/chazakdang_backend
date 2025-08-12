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
        const sql = `SELECT b.post_id, b.title, b.created_at, 
                    CASE 
                        WHEN CHAR_LENGTH(u.user_name) <= 2 THEN u.user_name
                        ELSE CONCAT(
                        SUBSTRING(u.user_name, 1, 1),
                        REPEAT('*', CHAR_LENGTH(u.user_name) - 2),
                        SUBSTRING(u.user_name, -1, 1))
                    END AS masked_name
                    FROM board b
                    JOIN user u ON b.user_id = u.user_id
                    ORDER BY b.created_at DESC
                    LIMIT ? OFFSET ?`;

        pool.query(sql, [pageSize, offset], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// 3. 게시글 상세 조회
exports.getPost = (postId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT b.title, b.content, u.user_name 
        FROM board b
        JOIN user u ON b.user_id = u.user_id
        WHERE b.post_id = ?`;

        pool.query(sql, [postId], (err, result) => {
            if (err) return reject(err);
            resolve(result[0] || null);
            
        });
    });
};

// 댓글 조회 
exports.getComments = (postId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT content FROM comment WHERE post_id = ? ORDER BY created_at ASC`;

        pool.query(sql, [postId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// 게시판 등록자 확인
exports.getPostOwner = (postId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT user_id FROM board WHERE post_id = ?';
        pool.query(sql, [postId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0]?.user_id || null);
        });
    });
};


exports.updatePost = (postId , title, content) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE board SET title = ?, content = ? WHERE post_id = ?`;

        pool.query(sql, [title, content, postId], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return reject(new Error('게시글이 존재하지 않습니다.'));
            resolve(result);
        });
    });
};

exports.deletePost = (postId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM board WHERE post_id = ?';

        pool.query(sql, [postId], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return reject(new Error('게시글이 존재하지 않습니다.'));
            resolve(result);
        });
    });
};

// 게시글 작성 유효성 검사
exports.validatePost = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required(),
        content: Joi.string().min(1).required()
    });

    return schema.validate(data);
};

// 댓글 작성 유효성 검사
exports.validateComment = (data) => {
    const schema = Joi.object({
        postId: Joi.number().integer().required(),
        content: Joi.string().min(1).required()
    });

    return schema.validate(data);
};

// 게시글 수정 유효성 검사
exports.validateUpdate = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required(),
        content: Joi.string().min(1).required()
    });

    return schema.validate(data);
};          