import request from 'supertest';
import app from '../app';
import { prismaClient } from '../lib/prismaClient';
import { clearDatabase } from '../lib/testUtils';

describe('상품 API 테스트', () => {
  beforeEach(async () => {
    await clearDatabase(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('인증이 필요없는 API', () => {
    describe('GET /products', () => {
      beforeEach(async () => {
        const user = await prismaClient.user.create({
          data: {
            email: 'thddbxor02@example.com',
            password: 'dbxor140',
            nickname: '테스트 유저저',
          },
        });

        for (let i = 0; i < 10; i++) {
          await prismaClient.product.create({
            data: {
              name: `Test Product ${i}`,
              description: 'Test',
              price: 10000,
              userId: user.id,
              tags: ['test', 'product'],
              images: ['test.jpg', 'test2.jpg'],
              createdAt: new Date(Date.now() + i * 1000),
            },
          });
        }
      });

      test('모든 상품 조회', async () => {
        const response = await request(app).get('/products');
        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(10);
        expect(response.body.totalCount).toBe(10);
        expect(response.body.list[0].name).toBe('Test Product 0');
      });

      test('페이지네이션 테스트트', async () => {
        const response = await request(app).get('/products?page=2&pageSize=5');
        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(5);
        expect(response.body.totalCount).toBe(10);
        expect(response.body.list[0].name).toBe('Test Product 5');
      });

      test('키워드 검색 테스트트', async () => {
        const response = await request(app).get('/products?keyword=2');
        expect(response.status).toBe(200);
        expect(response.body.totalCount).toBe(1);
        expect(response.body.list[0].name).toBe('Test Product 2');
      });

      test('정렬 테스트', async () => {
        const response = await request(app).get('/products?orderBy=recent');
        expect(response.status).toBe(200);
        expect(response.body.list[0].name).toBe('Test Product 9');
        expect(response.body.list[9].name).toBe('Test Product 0');
      });
    });

    describe('GET /products/:id', () => {
      test('id상세조회', async () => {
        const user = await prismaClient.user.create({
          data: {
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
            nickname: '유택킹',
          },
        });
        const product = await prismaClient.product.create({
          data: {
            name: '테스트 Product',
            description: '테스트',
            price: 10000,
            userId: user.id,
            tags: ['test', 'product'],
            images: ['test.jpg', 'test2.jpg'],
          },
        });

        const response = await request(app).get(`/products/${product.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          id: product.id,
          name: '테스트 Product',
          description: '테스트',
          price: 10000,
          tags: ['test', 'product'],
          images: ['test.jpg', 'test2.jpg'],
          userId: user.id,
          favoriteCount: 0,
        });
      });
    });

    describe('인증이 필요한 API', () => {
      describe('POST /products', () => {
        test('인증된 사용자가 상품품 생성 -> 200', async () => {
          const agent = request.agent(app);

          await agent.post('/auth/register').send({
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
            nickname: '유택킹',
            image: 'test.jpg',
          });
          await agent.post('/auth/login').send({
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
          });

          const newProduct = {
            name: '원래 상품명',
            description: '원래 설명',
            price: 3000,
            tags: ['old'],
            images: ['old.jpg'],
          };

          const created = await agent.post('/products').send(newProduct);
          const product = created.body;

          const updated = await agent.patch(`/products/${product.id}`).send({
            name: '수정된 상품명',
            price: 4500,
          });

          expect(updated.status).toBe(200);
          expect(updated.body.name).toBe('수정된 상품명');
          expect(updated.body.price).toBe(4500);
        });

        test('비로그인 사용자가 상품 수정 시도 → 401', async () => {
          const res = await request(app).patch('/products/1').send({
            name: '누구냐 넌',
          });

          expect(res.status).toBe(401);
        });

        test('존재하지 않는 상품 수정 시 → 404', async () => {
          const agent = request.agent(app);

          await agent.post('/auth/register').send({
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
            nickname: '유택킹',
            image: 'test.jpg',
          });

          await agent.post('/auth/login').send({
            email: 'thddbxor02@naver.com',
            password: 'dbdntl',
          });

          const res = await agent.patch('/products/99999').send({
            name: '없는 상품 수정',
          });

          expect(res.status).toBe(404);
        });
      });
    });
    describe('DELETE /products/:id', () => {
      test('로그인한 사용자가 상품 삭제 성공 → 204', async () => {
        const agent = request.agent(app);

        const user = {
          email: 'deleter@test.com',
          password: 'deletepw',
          nickname: '삭제왕',
          image: 'delete.jpg',
        };

        await agent.post('/auth/register').send(user);
        await agent.post('/auth/login').send({
          email: user.email,
          password: user.password,
        });

        const productRes = await agent.post('/products').send({
          name: '삭제용 상품',
          description: '지워질 예정',
          price: 8000,
          tags: [],
          images: [],
        });

        const product = productRes.body;

        const res = await agent.delete(`/products/${product.id}`);
        expect(res.status).toBe(204);
      });

      test('비로그인 사용자가 상품 삭제 시도 → 401', async () => {
        const res = await request(app).delete('/products/1');
        expect(res.status).toBe(401);
      });

      test('없는 상품 삭제 시 → 404', async () => {
        const agent = request.agent(app);

        await agent.post('/auth/register').send({
          email: 'ghost2@test.com',
          password: 'ghostpw',
          nickname: '삭제고스트',
          image: 'ghost2.jpg',
        });

        await agent.post('/auth/login').send({
          email: 'ghost2@test.com',
          password: 'ghostpw',
        });

        const res = await agent.delete('/products/99999');
        expect(res.status).toBe(404);
      });
    });
  });
});
