const User = require('../models/User.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { SECRET } = require('../config.js')


async function register(email, password) {
    //console.log(email, password)
    const existing = await User.findOne({email})
    
    if (existing) {
        const err = new Error('There is an user with the same email.')
        err.status = 409
        throw err
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
        email,
        hashedPassword
    })
    //console.log(user.email, user.hashedPassword)
    await user.save()
    return {
        _id: user._id,
        email: user.email,
        accessToken:createToken(user)
    }
}
function createToken(user) {
    const token = jwt.sign({
        _id: user.id,
        email: user.email
    }, SECRET)
    return token
}
async function login(email, password) {
    
    const user = await User.findOne({email})
    
    if (!user) {
        const err = new Error('Incorrect email or password.')
        err.status = 401
        throw err
    }
    
    const match = await bcrypt.compare(password, user.hashedPassword)
    if(!match){
        const err = new Error('Incorrect email or password.')
        err.status = 401
        throw err
    }
    
    return {
        _id: user._id,
        email: user.email,
        accessToken:createToken(user)
    }
}
module.exports = {
    register,
    login
}