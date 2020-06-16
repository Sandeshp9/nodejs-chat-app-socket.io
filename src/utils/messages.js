const generateMessage = (name,text) => {
    return {
        name,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username,loc) => {
    return {
        username,
        loc,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}