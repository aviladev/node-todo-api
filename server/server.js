require('./config/config')

const express = require('express')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User }  = require('./models/user')
const { authenticate } = require('./middleware/authenticate')

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.post('/todos', authenticate, (req, res) => {
  const { body: {text}, user: {_id} } = req

  const todo = new Todo({ text, _creator: _id })

  todo.save()
    .then(doc => res.send(doc))
    .catch(err => res.status(400).send(err))
})

app.get('/todos', authenticate, (req, res) => {
  Todo
    .find({
      _creator: req.user._id
    })
    .then(todos => res.send({ todos }))
    .catch(e => 
      res.status(400).send(e)
    )
})

app.get('/todos/:id', authenticate, (req, res) => {
  const { user, params: {id} } = req

  if ( !ObjectID.isValid(id) )
    return res.status(404).send()

  Todo
    .findOne({
      _id: id,
      _creator: user._id
    })
    .then(todo => {
      if (!todo)
        return res.status(404).send()

      res.send({ todo })
    })
    .catch( e => res.status(400).send() )
})

app.delete('/todos/:id', authenticate, async (req, res) => {
  const { user, params } = req

  if ( !ObjectID.isValid(params.id) ) {
    return res.status(404).send()
  }

  try {
    const removedTodo = await Todo.findOneAndRemove({
      _id: params.id,
      _creator: user._id
    })

    if (!removedTodo)
      return res.status(404).send()

    res.status(200).send({ removedTodo })
  } catch (e) {
    res.status(400).send()
  }
})

app.patch('/todos/:id', authenticate, async (req, res) => {
  const { body, user, params: { id } } = req

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  const toPatch = _.pick(body, ['text', 'completed'])

  if (toPatch.completed === true) {
    toPatch.completedAt = Date.now()
  } else {
    toPatch.completed = false
    toPatch.completedAt = null
  }

  try {
    const patchedTodo = await
      Todo.findOneAndUpdate(
        { _id: id, _creator: user._id },
        { $set: toPatch },
        { new: true }
      )

    if (!patchedTodo)
      return res.status(404).send()

    res.send({ todo: patchedTodo })

  } catch (e) {
    res.status(400).send()
  }
})

app.post('/users', async ({body}, res) => {
  const userData = _.pick(body, ['email', 'password'])

  const user = new User(userData)

  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.header('x-auth', token).send(user)
  } catch (e) {
    res.status(400).send()
  }
})

app.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user)
})

app.post('/users/login', async ({ body }, res) => {
  const { email, password } = body

  try {
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.header('x-auth', token).send(user)
  } catch (e) {
    res.status(400).send()
  }
})

app.delete('/users/me/token', authenticate, async (req, res) => {
  const { user, token } = req

  try {
    await user.removeToken(token)
    res.status(200).send()
  } catch (e) {
    res.status(400).send()
  }
})

app.listen(PORT, () =>
  console.log(`Started on port ${PORT}`)
)

module.exports = { app }
