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

module.exports.upload = async req => {
    let body = JSON.parse(req.body);
    
    let response = {
        statusCode: 200,
        body: null
    }

    let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: body.key,
        Body: JSON.stringify(body.data)
    }

    try{
        response.body = JSON.stringify(await s3Client.upload(params).promise());
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }

    return response;
}

module.exports.download = async req => {
    let body = JSON.parse(req.body);
    
    let response = {
        statusCode: 200,
        body: null
    }

    let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: body.key,
    }

    try{
        let bytes = await s3Client.getObject(params).promise();
        response.body = JSON.stringify(bytes.Body.toString('utf-8'));
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }

    return response;
}