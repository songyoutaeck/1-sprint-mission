import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';

describe('인증 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });
  describe('POST /auth/register', () => {
    test('새로운 사용자를 등록할 수 있다', async () => {
      const userData = {
        email: 'thddbxor02@example.com',
        password: 'dbxor1401',
        nickname: '테스트용 유저저',
        image: 'test.jpg',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: userData.email,
        nickname: userData.nickname,
        image: userData.image,
      });
    });

    test('회원가입할때 이미 존재하는 이메일 일시 실패(400)', async () => {
      const userData = {
        email: 'thddbxor01@example.com',
        password: 'dbxor1401',
        nickname: '테스트용 유저저',
        image: 'test.jpg',
      };

      await request(app).post('/auth/register').send(userData);

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('로그인 & 로그아웃 기능', () => {
    describe('POST /auth/login', () => {
      beforeEach(async () => {
        await request(app).post('/auth/register').send({
          email: 'login@test.com',
          password: 'pass1234',
          nickname: '로그인용',
          image: 'img.jpg',
        });
      });

      test('정상 로그인 시 200 상태와 토큰 쿠키가 설정된다', async () => {
        const res = await request(app).post('/auth/login').send({
          email: 'login@test.com',
          password: 'pass1234',
        });

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toEqual(
          expect.arrayContaining([
            expect.stringContaining('access-token='),
            expect.stringContaining('refresh-token='),
          ]),
        );
      });

      test('비밀번호가 틀리면 400 상태와 에러 메시지를 반환한다', async () => {
        const res = await request(app).post('/auth/login').send({
          email: 'login@test.com',
          password: 'wrongpass',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
      });

      test('등록되지 않은 이메일로 로그인 시도하면 400 반환', async () => {
        const res = await request(app).post('/auth/login').send({
          email: 'nobody@test.com',
          password: 'pass1234',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
      });
    });

    describe('POST /auth/logout', () => {
      test('로그인 후 로그아웃 시 토큰 쿠키가 제거된다', async () => {
        const agent = request.agent(app);

        await agent.post('/auth/register').send({
          email: 'logout@test.com',
          password: 'bye1234',
          nickname: '로그아웃용',
          image: 'bye.jpg',
        });

        await agent.post('/auth/login').send({
          email: 'logout@test.com',
          password: 'bye1234',
        });

        const res = await agent.post('/auth/logout');

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toEqual(
          expect.arrayContaining([
            expect.stringContaining('access-token=;'),
            expect.stringContaining('refresh-token=;'),
          ]),
        );
      });
    });
  });
});
