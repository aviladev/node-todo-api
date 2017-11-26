const expect = require('expect')
const request = require('supertest')

const { app } = require('../server')
const { Todo } = require('../models/todo')

const todos = [
  { text: 'First test todo' },
  { text: 'Second test todo' }
]

beforeEach(async () => {
  await Todo.remove({})
  await Todo.insertMany(todos)
})

describe('POST /todos', () => {
  it('should create a new todo', () => {
    const text = 'Test todo text'

    return request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .then(({ body }) =>
        expect(body.text).toBe(text)
      )
      .then(() =>
        Todo.find({text})
          .then(todos => {
            expect(todos.length).toBe(1)
            expect(todos[0].text).toBe(text)
          })
      )
    }
  )

  it('should not create todo with invalid body data', () =>
    request(app)
      .post('/todos')
      .send()
      .expect(400)
      .then(() => Todo.find()
        .then(todos => {
          expect(todos.length).toBe(2)
        })
      )
  )
})

describe('GET /todos', () => {
  
  it('should get all todos', async () => {
    const res = await request(app)
      .get('/todos')
      .expect(200)
    
    const { todos } = res.body
    expect(todos.length).toBe(2)
  })

})
