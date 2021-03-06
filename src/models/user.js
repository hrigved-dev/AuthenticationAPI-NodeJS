const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Invalid Email')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        minlength: 7,
        required: true,
        validate(value) {
            if(value.includes('password')) {
                throw new Error('Password cannot contain the word "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value<0) {
                throw new Error('Age cannot be less than zero')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//Middleware to hash password
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Login with credentials
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Token Generation
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'signString')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//Hiding password and tokens from the client
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


const User = mongoose.model('User', userSchema)

module.exports = User