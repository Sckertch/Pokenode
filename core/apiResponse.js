function reponse(code, message, data){
    console.log(message);
    return {
        code: code,
        message: message,
        data: data
    }
}

module.exports = reponse;