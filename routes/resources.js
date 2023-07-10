const express = require('express');
const router = express.Router();
const resources = require('../controllers/resources');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateResource } = require('../middleware');
const multer = require('multer');
// const { storage } = require('../aws');
const storage = require('../aws');
const upload = multer(storage);

router.route('/')
    .get(catchAsync(resources.catalogue))
    .post(upload.fields([
            { name: 'image' },
            { name: 'material', maxCount: 1 }
            ]), catchAsync(resources.createResouce));

router.get('/new-resource', isLoggedIn, resources.renderNewForm);

router.route('/:id')
    .get(catchAsync(resources.showResource))
    // .put(isLoggedIn, validateResource, catchAsync(resources.editResource))
    .put(isLoggedIn, upload.none(), validateResource, catchAsync(resources.editResource))
    // .delete(isLoggedIn, catchAsync(resources.deleteResource));
    .delete(isLoggedIn, catchAsync(resources.deleteResource));

// router.get('/:id/edit', isLoggedIn, catchAsync(resources.renderEditForm));
router.get('/:id/edit', isLoggedIn, catchAsync(resources.renderEditForm));

module.exports = router;