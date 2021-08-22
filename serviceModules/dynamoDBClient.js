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

module.exports = docClient;