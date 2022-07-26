process.env.NODE_ENV = "test"

const request = require("supertest");

let sampleQuery = `
INSERT INTO
  books (isbn, amazon_url,author,language,pages,publisher,title,year)
  VALUES(
    '123432122',
    'https://amazon.com/taco',
    'Elie',
    'English',
    100,
    'Nothing publishers',
    'my first book', 2008)
  RETURNING isbn`


const app = require("../app");
const db = require("../db");

let bookISBN;

beforeEach(async () => {
    let result = await db.query(sampleQuery)

    bookISBN = result.rows[0].isbn
})

describe("POST a book /books", function() {
    test("sample test", function() {
        expect(1).toEqual((0+1))
    })
    test("New Book Created", async function () {
        const res = await request(app).post('/books').send({
            isbn: '99999999',
            amazon_url: 'https://amazon.com/starwars',
            author: 'George Lucas',
            language: 'english',
            pages: 500,
            publisher: 'Penguin',
            title: 'Star Wars',
            year: 2022
        });
    expect(res.statusCode).toBe(201)
    })
    test("missing data", async function () {
        const res = await request(app).post('/books').send({
            isbn: '99999999',
            amazon_url: 'https://amazon.com/starwars',
            author: 'George Lucas',
            language: 'english',
            pages: 500,
            publisher: 'Penguin',
            title: 'Star Wars',
            year: 2022
        });

        const res2 = await request(app).post('/books').send({
            
            amazon_url: 'https://amazon.com/starwars',
            author: 'George Lucas',
            language: 'english',
            pages: 500,
            publisher: 'Penguin',
            title: 'Star Wars',
            year: 2022
            
        });
    expect(res.statusCode).toBe(201)
    expect(res2.body.error.err[0]).toEqual('instance requires property "isbn"')
    })
    test('duplicate data', async () => {
        const res = await request(app).post('/books').send({
            isbn: '99999999',
            amazon_url: 'https://amazon.com/starwars',
            author: 'George Lucas',
            language: 'english',
            pages: 500,
            publisher: 'Penguin',
            title: 'Star Wars',
            year: 2022
        });
        // I'm leaving this in for discussion. but i SHOULD have just used duplicate from the "beforeEach"
        const res2 = await request(app).post('/books').send({
            isbn: '99999999',
            amazon_url: 'https://amazon.com/starwars',
            author: 'George Lucas 2',
            language: 'english or something',
            pages: 500,
            publisher: 'Penguin 2',
            title: 'Star Wars 2',
            year: 2022
        });
        expect(res2.statusCode).toBe(500)
        expect(res2.body.error.detail).toEqual('Key (isbn)=(99999999) already exists.')

    })
    
    
})

describe("GET /books/:isbn", function () {
    test("Gets books from db", async function () {
      const response = await request(app)
          .get(`/books/${bookISBN}`)
      expect(response.body.book).toHaveProperty("author");
      expect(response.body.book.author).toEqual("Elie")
      expect(response.body.book.isbn).toBe(bookISBN);
    });
  
    test("Responds with 404", async function () {
      const response = await request(app)
          .get(`/books/6969`)
      expect(response.statusCode).toBe(404);
    });
  });



afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });
  