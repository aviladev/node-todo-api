// const { SHA256 } = require('crypto-js')
// const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const password = '123abc'

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(salt)
    console.log(hash)
  })
})

// const hashedPassword = '$2a$10$2jMNAcamSlYY/gaMAYeD7.nelBrbJQ3UlzBPp/bgUOS1Ik1jvq0fK'

// bcrypt.compare('123abc', hashedPassword, (err, res) => {
  // console.log(res)
// })

// const data = {
//   id: 10
// }

// const token = jwt.sign(data, '123abc')
// console.log(token)

// const decoded = jwt.verify(token, '123abc')
// console.log('decoded', decoded)

// const message = '3'

// const hash = SHA256(message).toString()

// console.log(`Message: ${message}`)
// console.log(`Hash: ${hash}`)

// const data = {
//   id: 4
// }

// const token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// // token.data.id = 5
// // token.hash = SHA256(JSON.stringify(token.data)).toString()

// const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString()

// if (resultHash === token.hash) {
//   console.log('Data was not changed')
// } else {
//   console.log('Data was changed. Do not trust!')
// }