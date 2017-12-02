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

app.post('/todos', ({ body: {text} }, res) => {
  const todo = new Todo({ text })

  todo.save()
    .then(doc => res.send(doc))
    .catch(err => res.status(400).send(err))
})

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.send({ todos }))
    .catch(e => 
      res.status(400).send(e)
    )
})

app.get('/todos/:id', ({ params: {id} }, res) => {
  if ( !ObjectID.isValid(id) )
    return res.status(404).send()

  Todo.findById(id)
    .then(todo => {
      if (!todo)
        return res.status(404).send()

      res.send({ todo })
    })
    .catch( e => res.status(400).send() )
})

app.delete('/todos/:id', async ({ params: {id} }, res) => {
  if ( !ObjectID.isValid(id) ){
    return res.status(404).send()
  }

  try {
    const removedTodo = await Todo.findByIdAndRemove(id)
    if (!removedTodo)
      return res.status(404).send()

    res.status(200).send({ removedTodo })
  } catch (e) {
    res.status(400).send()
  }
})

app.patch('/todos/:id', async ({ body, params: {id} }, res) => {
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
      Todo.findByIdAndUpdate(id,
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
    console.log(user)
    res.header('x-auth', token).send(user)
  } catch (e) {
    console.log(e.toJSON())
    res.status(400).send()
  }
})

app.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user)
})

app.listen(PORT, () =>
  console.log(`Started on port ${PORT}`)
)

module.exports = { app }
