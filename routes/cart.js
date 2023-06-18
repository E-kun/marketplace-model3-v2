const express = require('express');
const router = express.Router();
const carts = require('../controllers/carts');
const catchAsync = require('../utils/catchAsync');

router.route('/')
    .get(carts.showCart);

    // .get(catchAsync(carts.showCart));

router.route('/:id')
     .get(carts.addItemToCart);

module.exports = router;