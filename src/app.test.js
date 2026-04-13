'use strict';

const request = require('supertest');
const app = require('./app');

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /add', () => {
  it('adds two numbers', async () => {
    const res = await request(app).post('/add').send({ a: 3, b: 4 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(7);
  });

  it('returns 400 for non-numeric input', async () => {
    const res = await request(app).post('/add').send({ a: 'x', b: 4 });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /subtract', () => {
  it('subtracts two numbers', async () => {
    const res = await request(app).post('/subtract').send({ a: 10, b: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(7);
  });
});

describe('POST /multiply', () => {
  it('multiplies two numbers', async () => {
    const res = await request(app).post('/multiply').send({ a: 3, b: 4 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(12);
  });
});

describe('POST /divide', () => {
  it('divides two numbers', async () => {
    const res = await request(app).post('/divide').send({ a: 12, b: 4 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(3);
  });

  it('returns 400 when dividing by zero', async () => {
    const res = await request(app).post('/divide').send({ a: 5, b: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/zero/i);
  });
});
