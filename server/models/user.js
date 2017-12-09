const mongoose = require('mongoose')
const Schema = mongoose.Schema.bind(mongoose)
const model = mongoose.model.bind(mongoose)
const _ = require('lodash')
const bcrypt = require('bcryptjs')

const { isEmail } = require('validator')
const jwt = require('jsonwebtoken')

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      isAsync: false,
      validator: isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const access = 'auth'
  const data = {
    _id: user._id.toHexString(),
    access
  }
  const token = jwt.sign(data, 'abc123').toString()

  user.tokens.push({ access, token })

  await user.save()

  return token
}

UserSchema.methods.removeToken = function (token) {
  const user = this

  return user.update({
    $pull: {
      tokens: { token }
    }
  })
}

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded

  try {
    decoded = jwt.verify(token, 'abc123')
  } catch (e) {
    return Promise.reject()
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.findByCredentials = async function (email, password) {
  const User = this

  const user = await User.findOne({ email })

  if (!user) {
    return Promise.reject()
  }

  const isPasswordOk = await bcrypt.compare(password, user.password)

  if (!isPasswordOk) {
    return Promise.reject()
  } else {
    return user
  }
}

UserSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)

    user.password = hash
    next()
  } else {
    next()
  }

})

const User = model('User', UserSchema)

module.exports = { User }