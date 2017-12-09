const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todo } = require('../../models/todo')
const { User } = require('../../models/user')

const userOneID = ObjectID()
const userTwoID = ObjectID()
const users = [
  {
    _id: userOneID,
    email: 'emailOne@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userOneID, access: 'auth'}, 'abc123').toString()
    }]
  }, {
    _id: userTwoID,
    email: 'emailTwo@example.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userTwoID, access: 'auth' }, 'abc123').toString()
    }]
  }
]

const todos = [
  {
    _id: ObjectID(),
    text: 'First test todo',
    _creator: userOneID
  }, {
    _id: ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoID
  }
]

const populateTodos = async () => {
  await Todo.remove({})
  await Todo.insertMany(todos)
}

const populateUsers = async () => {
  await User.remove({})
  users.forEach(async user =>
    await new User(user).save()
  )
}

module.exports = { todos, populateTodos, users, populateUsers }