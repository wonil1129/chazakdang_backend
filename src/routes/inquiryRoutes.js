const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { verifyToken } = require('../middleware/auth');





router.get('/getInquiriesList', verifyToken, inquiryController.getInquiriesList); //o
router.get('/:id', verifyToken, inquiryController.getInquiryById); //o

module.exports = router;