const uuid = require("uuid");
const AWS = require('aws-sdk');
let docClient;

//While development db is set to local.
//On release env var PROJECT_CONF value has to be changed to 'RES' 
if(process.env.PROJECT_CONFIGURATION === 'DEV'){
    docClient = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    });
}else{
    docClient = new AWS.DynamoDB.DocumentClient();
}

module.exports.addComment = async (req, res) =>{
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

module.exports.getComment = async (req, res) =>{
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
        response.body = JSON.stringify(await docClient.get(params).promise());
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }
    
    return response
}

module.exports.getComments = async (req, res) =>{
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
        response.body = JSON.stringify(await docClient.query(params).promise());
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
        let res = await docClient.scan({TableName: process.env.TABLE_NAME}).promise();
        response.body = JSON.stringify(res.Items);
    }catch(e){
        response.body = JSON.stringify({
            errorMessage: e.message,
            ...params
        })

        response.statusCode = 500;
    }

    return response
}