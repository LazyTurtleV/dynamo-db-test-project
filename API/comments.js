const uuid = require("uuid");
const docClient = require('../serviceModules/dynamoDBClient')
const s3Client = require('../serviceModules/S3bucketClient')

async function getDownloadUrlsToAttachedImages(commentsList){
    let objectsList = await s3Client.listObjectsV2({Bucket: process.env.BUCKET_NAME}).promise();

    for(let comment of commentsList){
        comment.imageUrls = new Array()
        let pattern = new RegExp(`comment-images\/${comment.comment_id}\/.+`);

        for(obj of Array.from(objectsList)){
            if(pattern.test(obj.Key))
                getDownloadUrlsOfComment(obj.Key)
                .then(data => comment.imageUrls.push(data))
        }
    }
}

async function getDownloadUrlsOfComment(key){
    return await s3Client.getSignedUrlPromise('getObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: key
    })
}

module.exports.addComment = async req =>{
    let body = JSON.parse(req.body);
    
    let response = {
        statusCode: 200,
        body: null
    }

    let params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            comment_id: uuid.v1(),
            comment_target: body.target,
            comment_author: body.author,
            comment_text: body.text,
            comment_date: new Date().toISOString()
        }
    }
    
    try{
        let body = await docClient.put(params).promise();

        response.body = JSON.stringify({
            commentID: params.Item.comment_id,
            ...body
        })
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }


    return response
}

module.exports.getComment = async req =>{
    let body = JSON.parse(req.body);
    
    let response = {
        statusCode: 200,
        body: null
    }

    let params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            comment_id: body.ID,
            comment_target: body.target
        }
    }

    try{
        let comment = await docClient.get(params).promise();
        await getDownloadUrlsToAttachedImages([comment]);

        response.body = JSON.stringify(comment)
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }
    
    return response
}

module.exports.getComments = async req =>{
    let body = JSON.parse(req.body);
    
    let response = {
        statusCode: 200,
        body: null
    }

    let params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "comment_target = :hkey",
        ExpressionAttributeValues: {
            ":hkey": body.target
        }
    }

    try{
        let comments = await docClient.query(params).promise();
        await getDownloadUrlsToAttachedImages(comments.Items);

        response.body = JSON.stringify(comments.Items)
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }
    
    return response
}

module.exports.getAllComments = async req => {
    let body = JSON.parse(req.body);

    let response = {
        statusCode: 200,
        body: null
    };

    try{
        let comments = await docClient.scan({TableName: process.env.TABLE_NAME}).promise();
        await getDownloadUrlsToAttachedImages(comments.Items);
        
        response.body = JSON.stringify(comments.Items);
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message
        })

        response.statusCode = 500;
    }

    return response
}