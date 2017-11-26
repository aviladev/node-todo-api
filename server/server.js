const express = require('express')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User }  = require('./models/user')

const app = express()

app.use(express.json())

app.post('/todos', ({ body: {text} }, res) => {
  const todo = new Todo({ text })

  todo.save()
    .then(doc => {
      console.log('Saved:', doc)
      res.send(doc)
    })
    .catch(err => res.status(400).send(err))
})

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.send({ todos }))
    .catch(e => 
      res.status(400).send(e)
    )
})

app.listen(3000, () =>
  console.log('Started on port 3000')
)

module.exports = { app }
