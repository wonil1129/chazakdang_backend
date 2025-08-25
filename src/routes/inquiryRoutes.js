const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { verifyToken } = require('../middleware/auth');


// 문의 작성
router.post('/', verifyToken, inquiryController.createInquiry); //o
// 답변 작성
// router.post('/answer', verifyToken, inquiryController.createInquiry);
// 문의 삭제
router.delete('/:id', verifyToken, inquiryController.deleteInquiry); //o
// 문의 수정
router.patch('/:id', verifyToken, inquiryController.updateInquiry); //o
// 문의내역 조회
router.get('/List', verifyToken, inquiryController.getInquiriesList); //o
// 해당 문의 조회
router.get('/:id', verifyToken, inquiryController.getInquiryById); //o

module.exports = router;