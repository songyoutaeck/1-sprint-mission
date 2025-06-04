import request from 'supertest';
import app from '../app';
import { clearDatabase } from '../lib/testUtils';
import { prismaClient } from '../lib/prismaClient';

describe('articlesRouter 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
  });
  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('인증 필요없는는 Router', () => {
    describe('GET/articlees', () => {
      beforeEach(async () => {
        const user = await prismaClient.user.create({
          data: {
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
            nickname: '유택킹',
          },
        });

        for (let i = 0; i < 20; i++) {
          await prismaClient.article.create({
            data: {
              title: `Test articles ${i}`,
              content: '테스트 내용용',
              userId: user.id,
              createdAt: new Date(Date.now() + i * 1000),
            },
          });
        }
      });

      test('모든 게시글 조회', async () => {
        const response = await request(app).get('/articles');
        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(10);
        expect(response.body.totalCount).toBe(20);
        expect(response.body.list[0].title).toBe('Test articles 0');
      });

      test('페이지네이션 테스트', async () => {
        const response = await request(app).get('/articles?page=2&pageSize=5');
        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(5);
        expect(response.body.totalCount).toBe(20);
        expect(response.body.list[0].title).toBe('Test articles 5');
      });

      test('키워드 검색 테스트트', async () => {
        const response = await request(app).get('/articles?keyword=2');
        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(2);
        expect(response.body.totalCount).toBe(2);
        expect(response.body.list[0].title).toBe('Test articles 2');
        console.log(response.body.list);
        expect(response.body.list[1].title).toBe('Test articles 12');
        console.log(response.body.list);
      });

      test('최신순으로 정렬할 수 있다', async () => {
        const response = await request(app).get('/articles?orderBy=recent');
        expect(response.status).toBe(200);
        expect(response.body.list[0].title).toBe('Test articles 19');
        expect(response.body.list[9].title).toBe('Test articles 10');
      });
    });

    describe('GET /articles/:id', () => {
      test('id상세조회', async () => {
        const user = await prismaClient.user.create({
          data: {
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
            nickname: '유택킹',
          },
        });

        const article = await prismaClient.article.create({
          data: {
            title: 'Test Article',
            content: 'Test Content',
            userId: user.id,
          },
        });
        const response = await request(app).get(`/articles/${article.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: article.id,
          title: 'Test Article',
          content: 'Test Content',
          userId: user.id,
          likeCount: 0,
        });
      });
    });

    describe('인증이 필요한', () => {
      describe('POST/articles', () => {
        test('인증된 사용자가 게시글을 생성 -> 200', async () => {
          const agent = request.agent(app);

          const user = {
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
            nickname: '유택킹',
            image: 'test.jpg',
          };

          await agent.post('/auth/register').send(user);
          await agent.post('/auth/login').send({
            email: user.email,
            password: user.password,
          });

          const newArticle = {
            title: '테스트 글 제목',
            content: '테스트 글 내용',
            image: 'article.jpg',
          };

          const response = await agent.post('/articles').send(newArticle);

          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({
            id: expect.any(Number),
            title: newArticle.title,
            content: newArticle.content,
            image: newArticle.image,
          });
        });
      });

      describe('PATCH /articles/:id', () => {
        test('로그인한 사용자가 본인 게시글 수정 성공 → 200', async () => {
          const agent = request.agent(app);

          const user = {
            email: 'test@example.com',
            password: 'password123',
            nickname: '유저',
            image: 'user.jpg',
          };

          await agent.post('/auth/register').send(user);
          await agent.post('/auth/login').send({
            email: user.email,
            password: user.password,
          });

          const newArticle = {
            title: '원래 제목',
            content: '원래 내용',
            image: 'test.jpg',
          };

          const created = await agent.post('/articles').send(newArticle);
          const article = created.body;

          const res = await agent.patch(`/articles/${article.id}`).send({
            title: '수정된 제목',
            content: '수정된 내용',
          });

          expect(res.status).toBe(200);
          expect(res.body.title).toBe('수정된 제목');
          expect(res.body.content).toBe('수정된 내용');
        });

        test('존재하지 않는 게시글 수정 시 404 → 실패', async () => {
          const agent = request.agent(app);

          const user = {
            email: 'ghost@test.com',
            password: 'ghostpw',
            nickname: '고스트',
            image: 'ghost.jpg',
          };

          await agent.post('/auth/register').send(user);
          await agent.post('/auth/login').send({
            email: user.email,
            password: user.password,
          });

          const res = await agent.patch('/articles/99999').send({
            title: '수정 시도',
          });

          expect(res.status).toBe(404);
        });

        test('비로그인 사용자는 수정 시도 시 401', async () => {
          const res = await request(app).patch('/articles/1').send({
            title: '비로그인 수정 시도',
          });

          expect(res.status).toBe(401);
        });
      });
    });

    describe('DELETE /articles/:id', () => {
      test('로그인한 사용자가 본인 게시글 삭제 성공 → 204', async () => {
        const agent = request.agent(app);

        const user = {
          email: 'deleteme@test.com',
          password: 'delete123',
          nickname: '삭제왕',
          image: 'delete.jpg',
        };

        await agent.post('/auth/register').send(user);
        await agent.post('/auth/login').send({
          email: user.email,
          password: user.password,
        });

        const newArticle = {
          title: '삭제될 글',
          content: '삭제할 내용',
          image: 'bye.jpg',
        };

        const created = await agent.post('/articles').send(newArticle);
        const article = created.body;

        const res = await agent.delete(`/articles/${article.id}`);

        expect(res.status).toBe(204);
      });

      test('존재하지 않는 게시글 삭제 시 404 → 실패', async () => {
        const agent = request.agent(app);

        const user = {
          email: 'ghostdelete@test.com',
          password: 'ghostpw',
          nickname: '삭제유령',
          image: 'ghost.jpg',
        };

        await agent.post('/auth/register').send(user);
        await agent.post('/auth/login').send({
          email: user.email,
          password: user.password,
        });

        const res = await agent.delete('/articles/99999');

        expect(res.status).toBe(404);
      });

      test('비로그인 사용자가 삭제 시도 시 401 → 실패', async () => {
        const res = await request(app).delete('/articles/1');
        expect(res.status).toBe(401);
      });
    });
  });
});
