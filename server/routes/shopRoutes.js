const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// app routes
router.get('/', shopController.homePage);
router.get('/checkout', shopController.checkoutPage);
router.post('/add-to-cart', shopController.addToCart);
router.post('/remove', shopController.remove);
router.post('/remove-all', shopController.removeAll);
router.post('/buy', shopController.buy);

module.exports = router;