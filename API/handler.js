module.exports.addComment = async (req, res) =>{
    return {
        statusCode: 200,
        body: "Create comment!"
    }
}

module.exports.getComment = async (req, res) =>{
    return {
        statusCode: 200,
        body: "Get a comment!"
    }
}

module.exports.getComments = async (req, res) =>{
    return {
        statusCode: 200,
        body: "Get comments!"
    }
}