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
    // .post(isLoggedIn, catchAsync(resources.createResouce));
    .post(upload.fields([
        { name: 'image' },
        { name: 'material', maxCount: 1 }
        ]), catchAsync(resources.createResouce));
    // .post(isLoggedIn, upload.fields([
    //         { name: 'image' },
    //         { name: 'material', maxCount: 1 }
    //         ]), catchAsync(resources.createResouce));
    // .post(upload.fields([
    //         { name: 'image' },
    //         { name: 'material', maxCount: 1 }
    //         ]), catchAsync(resources.createResouce));

    // validateResource,

router.get('/new-resource', resources.renderNewForm);

router.route('/:id')
    .get(catchAsync(resources.showResource))
    // .put(isLoggedIn, validateResource, catchAsync(resources.editResource))
    .put(upload.none(), catchAsync(resources.editResource))
    // .delete(isLoggedIn, catchAsync(resources.deleteResource));
    .delete(catchAsync(resources.deleteResource));

// router.get('/:id/edit', isLoggedIn, catchAsync(resources.renderEditForm));
router.get('/:id/edit', catchAsync(resources.renderEditForm));

module.exports = router;