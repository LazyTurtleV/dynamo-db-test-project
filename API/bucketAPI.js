const s3Client = require('../serviceModules/S3bucketClient')
const getAllComments = require('./comments').getAllComments;
const uuid = require('uuid');

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

module.exports.getUploadUrl = async req => {
    let body = JSON.parse(req.body);

    let response = {
        statusCode: 200,
        body: null
    }

    try{
        let allComments = await getAllComments({
            body: JSON.stringify({
                TableName: process.env.TABLE_NAME
            })
        });
        allComments.body = JSON.parse(allComments.body)
        
        //if there is at least one element with specified ID
        if(allComments.statusCode != 200)
            throw new Error(`Some error occured on server: ${allComments.body.errorMessage}`);
        else if(!allComments.body.some(item => item.comment_id === body.commentID))
            throw new Error("Item doesn't exist")


        response.body = JSON.stringify(await s3Client.getSignedUrlPromise('putObject', {
            Bucket: process.env.BUCKET_NAME,
            Key: `comment-images/${body.commentID}/${uuid.v1()}`,
            Expires: 120, //[s],
            ContentType: 'image/jpeg'
        }));
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message
        })

        response.statusCode = 500;
    }

    return response
}