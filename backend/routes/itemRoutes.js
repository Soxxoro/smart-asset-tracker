const express = require('express');
const router = express.Router();
const {
    getItems,
    createOrUpdateItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');

router.route('/')
    .get(getItems)
    .post(createOrUpdateItem);

router.route('/:id')
    .put(updateItem)
    .delete(deleteItem);

module.exports = router;
