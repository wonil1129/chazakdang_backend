const express = require('express');
const boardService = require('../services/boardService');


exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const user_id = req.user.id;

    const { error } = boardService.validatePost(req.body);
    if (error) {
    // 에러가 있으면 입력값이 잘못된 것
    return res.status(400).json({ msg: '입력값이 올바르지 않습니다.' });
}

    try {
        const result = await boardService.createPost(user_id, title, content);
        res.status(201).json({ msg: '게시글이 등록되었습니다.'});
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ msg: 'Failed to create post', error: error.message });
    }
};

exports.createComment = async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.id;
    const { error } = boardService.validateComment(req.body);
    if(error) {
        return res.status(400).json({ msg: '값을 입력해주세요. ' });
    }
    try {
        const result = await boardService.createComment(postId, userId, content);
        res.status(201).json({ msg: 'Comment created successfully', commentId: result.insertId });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ msg: 'Failed to create comment', error: error.message });
    }
};


exports.getPostList = async (req, res) => {
        const page = req.query.page || 1;
    try {
        const posts = await boardService.getPostList(page);
        res.json({ msg: 'Board list retrieved successfully', posts });
    } catch (error) {
        console.error('Error retrieving board list:', error);
        res.status(500).json({ msg: 'Failed to retrieve board list', error: error.message });
    }   
}

exports.getPostDetail = async (req, res) => {
    const postId = Number(req.params.id);
    if (!postId) {
        return res.status(400).json({ msg: 'Post ID is required' });
    }

    try {
        const post = await boardService.getPost(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        const comments = await boardService.getComments(postId);
        res.json({
            msg: 'Post retrieved successfully',
            post,
            comments
        });
    } catch (error) {
        console.error('Error retrieving post detail:', error);
        res.status(500).json({ msg: 'Failed to retrieve post detail', error: error.message });
    }
};


exports.updatePost = async (req, res) => {
    const postId = Number(req.params.id);
    const { title, content } = req.body;
    const userId = req.user.id;
    const { error } = boardService.validateUpdate(req.body);

    if (error){
        return res.status(400).json({ msg: '입력값이 올바르지 않습니다.' });
    }
    try {
        const hasPermission = await boardService.checkOwner(postId, userId);
        if (!hasPermission) {
            return res.status(403).json({ msg: '권한이 없습니다.' });
        }

        const result = await boardService.updatePost(postId, title, content);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Post not found or no changes made' });
        }
        res.json({ msg: '게시글이 수정되었습니다.' });
    } catch (error) {
        console.error('Error updating post:', error );
        res.status(500).json({ msg: 'Failed to update post', error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.user.id;
    
    if (!postId) {
        return res.status(400).json({ msg: 'Post ID is required' });
    }
    try {
        const hasPermission = await boardService.checkOwner(postId, userId);
        if (!hasPermission) {
        return res.status(403).json({ msg: '권한이 없습니다.' });
        }
        const result = await boardService.deletePost(postId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json({ msg: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ msg: 'Failed to delete post', error: error.message });
    }
};
