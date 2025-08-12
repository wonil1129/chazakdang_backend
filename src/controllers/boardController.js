const express = require('express');
const boardService = require('../services/boardService');


exports.createBoard = async (req, res) => {
    const { title, content } = req.body;
    const user_id = req.user.id;

    if (!title || !content) {
        return res.status(400).json({ msg: 'Title and content are required' });
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

    if (!postId || !content) {
        return res.status(400).json({ msg: 'Post ID and content are required' });
    }

    try {
        const result = await boardService.createComment(postId, userId, content);
        res.status(201).json({ msg: 'Comment created successfully', commentId: result.insertId });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ msg: 'Failed to create comment', error: error.message });
    }
};


exports.getBoardList = async (req, res) => {
        const page = req.query.page || 1;
    try {
        const posts = await boardService.getBoardList(page);
        res.json({ msg: 'Board list retrieved successfully', posts });
    } catch (error) {
        console.error('Error retrieving board list:', error);
        res.status(500).json({ msg: 'Failed to retrieve board list', error: error.message });
    }   
}

exports.getBoardDetail = async (req, res) => {
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


exports.updateBoard = async (req, res) => {
    const postId = Number(req.params.id);
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!postId || !title || !content) {
        return res.status(400).json({ msg: 'Post ID, title, and content are required' });
    }

    try {
        const ownerId = await boardService.getPostOwner(postId);
        if (ownerId !== userId) {
            return res.status(403).json({ msg: '수정 권한이 없습니다.' });
        }

        const result = await boardService.updatePost(postId, title, content);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Post not found or no changes made' });
        }
        res.json({ msg: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error );
        res.status(500).json({ msg: 'Failed to update post', error: error.message });
    }
};

exports.deleteBoard = async (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.user.id;
    
    if (!postId) {
        return res.status(400).json({ msg: 'Post ID is required' });
    }
    try {
        const ownerId = await boardService.getPostOwner(postId);
        if (ownerId !== userId) {
            return res.status(403).json({ msg: '삭제 권한이 없습니다.' });
        }

        const result = await boardService.deletePost(postId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json({ msg: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ msg: 'Failed to delete post', error: error.message });
    }
};
