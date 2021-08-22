const AWS = require('aws-sdk');
let s3Client;

if(process.env.PROJECT_CONFIGURATION === 'DEV'){
    s3Client = new AWS.S3({
        s3ForcePathStyle: true,
        accessKeyId: 'S3RVER', // This specific key is required when working offline
        secretAccessKey: 'S3RVER',
        endpoint: new AWS.Endpoint('http://localhost:4569'),
    });
}else{
    s3Client = new AWS.S3();
}

module.exports = s3Client;