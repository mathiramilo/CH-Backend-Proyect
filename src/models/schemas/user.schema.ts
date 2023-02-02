import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import envConfig from '../../config/env.config'
import { createCart } from '../../services/carts.services'

const UserSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: new Date()
  },
  fullName: {
    type: String,
    required: [true, 'Please enter your full name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: [true, 'Email already exists'],
    match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Please enter a phone number']
  },
  cartId: { type: String }
})

// Encrypt password before saving a new user
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Create a new cart for the user after saving the user
UserSchema.post('save', async function () {
  const cart = await createCart()
  this.cartId = cart._id
})

// Check if passwords matches
UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// Sign JWT and return the token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRE
  })
}

export default UserSchema