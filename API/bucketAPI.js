const s3Client = require('../serviceModules/S3bucketClient')

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