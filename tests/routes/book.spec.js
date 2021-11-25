const { factory } = require('factory-girl');
const request = require('supertest');
require('../config/config');
const app = require('../../app');
const sinon = require('sinon');
const User = require('../../models/user');
const Book = require('../../models/book');
const Author = require('../../models/author');
const Genre = require('../../models/genre');

beforeEach(async () => {
  await Book.deleteMany({});
  await User.deleteMany({});
  await Author.deleteMany({});
  await Genre.deleteMany({});
  await Book.createCollection();
})

afterEach(() => {
  sinon.restore();
})

describe('POST /books', () => {
  describe('when not login', () => {
    test('returns unauthenticate', async () => {
      await request(app).post('/api/v1/books')
                        .send({})
                        .expect(401);
    })
  })

  describe('when login', () => {
    let token;

    describe('when login with normal user role', () => {
      beforeEach(async () => {
        let user = await factory.create('user');
        let params = { email: user.email, password: 'Aa@123456' }
        let res = await request(app).post('/api/v1/sign_in')
                                    .send(params);
        token = res.body['accessToken']
      })

      test('cannot access with user role', async () => {
        let res = await request(app).post('/api/v1/books')
                                    .set('Authorization', `Bearer ${token}`)
                                    .send({})
                                    .expect(403);
        expect(res.body['message']).toBe('only admin role');
      })
    })

    describe('when login with admin role', () => {
      beforeEach(async () => {
        let admin = await factory.create('admin');
        let params = { email: admin.email, password: 'Aa@123456' }
        let res = await request(app).post('/api/v1/sign_in')
                                    .send(params);
        token = res.body['accessToken']
      })

      describe('when valid data', () => {
        test('create book success when pass param id author and genere', async () => {
          let bookParams = await factory.attrs('book', { authors: [], genres: [], images: [] });
          let factory1 = factory.create('author');
          let factory2 = factory.create('genre');
          let author = await factory1;
          let genre = await factory2;
          let params = {
            book: bookParams,
            authors: [{ id: author._id }],
            genres: [{ id: genre._id }]
          }
          let res = await request(app).post('/api/v1/books')
                                      .set('Authorization', `Bearer ${token}`)
                                      .send(params)
                                      .expect(200);
          expect(res.body['data'].length).toBe(1);
        })

        test('create book, genre and author success', async () => {
          let bookParams = await factory.attrs('book', { authors: [], genres: [], images: [] });
          let authorParams = await factory.attrs('author');
          let genreParams = await factory.attrs('genre');
          let factory1 = factory.create('author');
          let factory2 = factory.create('genre');
          let author = await factory1;
          let genre = await factory2;
          let params = {
            book: bookParams,
            authors: [{ id: author._id }, authorParams],
            genres: [{ id: genre._id }, genreParams]
          }

          let res = await request(app).post('/api/v1/books')
                                      .set('Authorization', `Bearer ${token}`)
                                      .send(params)
                                      .expect(200);
          expect(res.body['data'].length).toBe(1);
          expect(await Book.estimatedDocumentCount({})).toBe(1);
          expect(await Author.estimatedDocumentCount({})).toBe(2);
          expect(await Genre.estimatedDocumentCount({})).toBe(2);
        })
      })

      describe('when invalid data', () => {
        test('create book failed when send invalid book data', async () => {
          let bookParams = await factory.attrs('book', { authors: [], genres: [], images: [] });
          bookParams['title'] = '';
          bookParams['description'] = '';
          let factory1 = factory.create('author');
          let genreParams = await factory.attrs('genre');
          let author = await factory1;
          let params = {
            book: bookParams,
            authors: [{ id: author._id }],
            genres: [genreParams]
          }
          let res = await request(app).post('/api/v1/books')
                                      .set('Authorization', `Bearer ${token}`)
                                      .send(params)
                                      .expect(422);
          expect(res.body['message']).toHaveProperty('title');
          expect(res.body['message']).toHaveProperty('description');
          expect(await Book.estimatedDocumentCount({})).toBe(0);
          expect(await Author.estimatedDocumentCount({})).toBe(1);
          expect(await Genre.estimatedDocumentCount({})).toBe(0);
        })

        test('create book failed when send array author or genre is empty', async () => {
          let bookParams = await factory.attrs('book', { authors: [], genres: [], images: [] });
          let factory2 = factory.create('genre');
          let genre = await factory2;
          let params = {
            book: bookParams,
            authors: [],
            genres: [{ id: genre._id }]
          }
          let res = await request(app).post('/api/v1/books')
                                      .set('Authorization', `Bearer ${token}`)
                                      .send(params)
                                      .expect(422);
          expect(res.body['message']).toHaveProperty('authors');
        })

        test('create book failed when create genre or author failed', async () => {
          let bookParams = await factory.attrs('book', { authors: [], genres: [], images: [] });
          let authorParams = await factory.attrs('author');
          let genreParams = await factory.attrs('genre');
          let factory1 = factory.create('author');
          let factory2 = factory.create('genre');
          let author = await factory1;
          let genre = await factory2;
          let createAuthor = sinon.stub(Author, 'create');
          createAuthor.throws({name: 'ValidationError'});
          let params = {
            book: bookParams,
            authors: [{ id: author._id }, authorParams],
            genres: [{ id: genre._id }, genreParams]
          }

          await request(app).post('/api/v1/books')
                            .set('Authorization', `Bearer ${token}`)
                            .send(params)
                            .expect(422);
          expect(await Book.estimatedDocumentCount({})).toBe(0);
        })
      })
    })
  })
})
