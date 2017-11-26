const { ObjectID } = require('mongodb')

const { mongoose }  = require('../server/db/mongoose')
const { Todo } = require('../server/models/todo')
const { User } = require('../server/models/user')

// Todo.remove({})
//   .then(result => console.log(result))

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()

Todo.findByIdAndRemove('6a1b32bc88920216f2ef90c8')
  .then(console.log)