const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACC_KEY
    },
    region: "ap-southeast-1"
});

const s3client = s3;
module.exports.s3client = s3client;

const storage = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'mercatus-test',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        const fileName = Date.now() + "-" + file.originalname;
        cb(null, fileName)
      }
    })
  })


module.exports.storage = storage;
