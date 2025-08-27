const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/recent', verifyToken, userController.getRecentEatingHistory);
router.patch('/:id', verifyToken, userController.editEatingHistory)
router.post('/product-image', verifyToken, upload.single('image'), userController.uploadNutrientsImage);
router.get('/:id', verifyToken, userController.getEatingHistoryById);
router.delete('/:id', verifyToken, userController.deleteEatingHistory);

module.exports = router;