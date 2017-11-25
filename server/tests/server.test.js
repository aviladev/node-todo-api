const expect = require('expect')
const request = require('supertest')

const { app } = require('../server')
const { Todo } = require('../models/todo')

beforeEach(() =>
  Todo.remove({})
)

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
        Todo.find()
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
          expect(todos.length).toBe(0)
        })
      )
  )
})
