import * as productsRepository from '../repositories/productsRepository';
import * as favoritesRepository from '../repositories/favoritesRepository';
import * as notificationsService from './notificationsService';
import * as productsService from './productsService';
import { NotificationType } from '../types/Notification';
import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';

jest.mock('../repositories/productsRepository');
jest.mock('../repositories/favoritesRepository');
jest.mock('./notificationsService');

describe('상품 서비스 테스트', () => {
  const createSampleProduct = () => ({
    id: 1,
    name: '테스트 상품',
    description: '상세 설명',
    price: 1000,
    tags: ['sample'],
    images: ['img1.jpg'],
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    favoriteCount: 0,
    isFavorited: false,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('상품 등록', () => {
    test('상품을 등록할 수 있다', async () => {
      const sample = createSampleProduct();
      jest.mocked(productsRepository.createProduct).mockResolvedValue(sample);

      const result = await productsService.createProduct({
        name: sample.name,
        description: sample.description,
        price: sample.price,
        tags: sample.tags,
        images: sample.images,
        userId: sample.userId,
      });

      expect(productsRepository.createProduct).toHaveBeenCalled();
      expect(result).toMatchObject(sample);
    });
  });

  describe('상품 단건 조회', () => {
    test('존재하는 상품을 반환한다', async () => {
      const sample = createSampleProduct();
      jest
        .mocked(productsRepository.getProductWithFavorites)
        .mockResolvedValue({ ...sample, favorites: undefined });

      const result = await productsService.getProduct(sample.id);

      expect(productsRepository.getProductWithFavorites).toHaveBeenCalledWith(sample.id);
      expect(result).toMatchObject(sample);
    });

    test('없는 상품은 NotFoundError 발생', async () => {
      jest.mocked(productsRepository.getProductWithFavorites).mockResolvedValue(null);

      await expect(productsService.getProduct(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('상품 목록 조회', () => {
    test('상품 리스트와 개수를 반환한다', async () => {
      const product = createSampleProduct();
      jest.mocked(productsRepository.getProductListWithFavorites).mockResolvedValue({
        list: [{ ...product, favorites: undefined }],
        totalCount: 1,
      });

      const result = await productsService.getProductList({ page: 1, pageSize: 10 }, { userId: 1 });

      expect(result.totalCount).toBe(1);
      expect(result.list[0].name).toBe(product.name);
    });
  });

  describe('상품 수정', () => {
    test('상품 가격이 바뀌면 알림을 전송한다', async () => {
      const original = createSampleProduct();
      const modified = { ...original, price: 5000, favorites: [{ userId: 2 }] };

      jest.mocked(productsRepository.getProduct).mockResolvedValue(original);
      jest.mocked(productsRepository.updateProductWithFavorites).mockResolvedValue({
        ...modified,
        favorites: undefined,
        favoriteCount: 1,
        isFavorited: false,
      });
      jest
        .mocked(favoritesRepository.getFavoritesByProductId)
        .mockResolvedValue([
          { id: 1, productId: 1, userId: 2, createdAt: new Date(), updatedAt: new Date() },
        ]);

      const result = await productsService.updateProduct(1, { userId: 1, price: 5000 });

      expect(notificationsService.createNotifications).toHaveBeenCalledWith([
        {
          userId: 2,
          type: NotificationType.PRICE_CHANGED,
          payload: { productId: 1, price: 5000 },
        },
      ]);
      expect(result.price).toBe(5000);
    });

    test('상품이 없으면 NotFoundError 발생', async () => {
      jest.mocked(productsRepository.getProduct).mockResolvedValue(null);

      await expect(productsService.updateProduct(1, { userId: 1 })).rejects.toThrow(NotFoundError);
    });

    test('본인 상품이 아니면 ForbiddenError 발생', async () => {
      const product = createSampleProduct();
      jest.mocked(productsRepository.getProduct).mockResolvedValue({ ...product, userId: 99 });

      await expect(productsService.updateProduct(1, { userId: 1 })).rejects.toThrow(ForbiddenError);
    });
  });

  describe('상품 삭제', () => {
    test('작성자가 삭제할 수 있다', async () => {
      const product = createSampleProduct();
      jest.mocked(productsRepository.getProduct).mockResolvedValue(product);
      jest.mocked(productsRepository.deleteProduct).mockResolvedValue(product);

      await productsService.deleteProduct(product.id, product.userId);

      expect(productsRepository.deleteProduct).toHaveBeenCalledWith(product.id);
    });

    test('없는 상품이면 NotFoundError 발생', async () => {
      jest.mocked(productsRepository.getProduct).mockResolvedValue(null);

      await expect(productsService.deleteProduct(1, 1)).rejects.toThrow(NotFoundError);
    });

    test('본인 소유가 아니면 ForbiddenError 발생', async () => {
      const product = createSampleProduct();
      jest.mocked(productsRepository.getProduct).mockResolvedValue({ ...product, userId: 99 });

      await expect(productsService.deleteProduct(product.id, 1)).rejects.toThrow(ForbiddenError);
    });
  });
});
