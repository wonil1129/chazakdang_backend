// const express = require('express');
// const router = express.Router();
// const boardController = require('../controllers/boardController');
// const { verifyToken } = require('../middleware/auth');

router.post('/create', verifyToken, boardController.createBoard);
router.post('/comment', verifyToken, boardController.createComment);
router.get('/list', boardController.getBoardList);
router.get('/detail/:id', boardController.getBoardDetail);
router.put('/update/:id', verifyToken, boardController.updateBoard);
router.delete('/delete/:id', verifyToken, boardController.deleteBoard);


module.exports = router;