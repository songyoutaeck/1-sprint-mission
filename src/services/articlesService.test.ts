import * as articlesRepository from '../repositories/articlesRepository';
import * as articlesService from './articlesService';
import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';

jest.mock('../repositories/articlesRepository');

describe('게시글 관련 서비스 테스트', () => {
  const sampleArticle = () => ({
    id: 1,
    title: '샘플 제목',
    content: '샘플 본문',
    image: 'sample.jpg',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    likeCount: 0,
    isLiked: false,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('게시글 등록', () => {
    test('정상적으로 게시글을 등록한다', async () => {
      const article = sampleArticle();
      jest.mocked(articlesRepository.createArticle).mockResolvedValue(article);

      const result = await articlesService.createArticle({
        title: article.title,
        content: article.content,
        image: article.image,
        userId: article.userId,
      });

      expect(articlesRepository.createArticle).toHaveBeenCalled();
      expect(result).toMatchObject({ ...article });
    });
  });

  describe('게시글 단건 조회', () => {
    test('존재하는 게시글을 반환한다', async () => {
      const article = sampleArticle();
      jest.mocked(articlesRepository.getArticleWithLkes).mockResolvedValue({
        ...article,
        likes: undefined,
      });

      const result = await articlesService.getArticle(article.id);

      expect(articlesRepository.getArticleWithLkes).toHaveBeenCalledWith(article.id);
      expect(result).toMatchObject(article);
    });

    test('없는 게시글이면 NotFoundError 발생', async () => {
      jest.mocked(articlesRepository.getArticleWithLkes).mockResolvedValue(null);

      await expect(articlesService.getArticle(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('게시글 목록 조회', () => {
    test('게시글 리스트와 개수를 반환한다', async () => {
      const article = sampleArticle();
      const fakeList = [article];
      jest.mocked(articlesRepository.getArticleListWithLikes).mockResolvedValue({
        list: fakeList.map((a, i) => ({
          ...a,
          likes: undefined,
          likeCount: i,
          isLiked: false,
        })),
        totalCount: fakeList.length,
      });

      const result = await articlesService.getArticleList({ page: 1, pageSize: 10 });

      expect(result.totalCount).toBe(1);
      expect(result.list[0].title).toBe(article.title);
    });
  });

  describe('게시글 수정', () => {
    test('작성자가 자신의 글을 수정할 수 있다', async () => {
      const original = sampleArticle();
      const edited = { ...original, title: '수정됨' };
      jest.mocked(articlesRepository.getArticle).mockResolvedValue(original);
      jest.mocked(articlesRepository.updateArticleWithLikes).mockResolvedValue({
        ...edited,
        likes: [],
      });

      const result = await articlesService.updateArticle(original.id, {
        userId: original.userId,
        title: '수정됨',
      });

      expect(result.title).toBe('수정됨');
    });

    test('없는 게시글 수정 시 NotFoundError', async () => {
      jest.mocked(articlesRepository.getArticle).mockResolvedValue(null);

      await expect(articlesService.updateArticle(1, { userId: 1 })).rejects.toThrow(NotFoundError);
    });

    test('다른 사용자의 글을 수정 시도하면 ForbiddenError', async () => {
      const article = sampleArticle();
      jest.mocked(articlesRepository.getArticle).mockResolvedValue({ ...article, userId: 999 });

      await expect(
        articlesService.updateArticle(article.id, { userId: article.userId }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('게시글 삭제', () => {
    test('작성자는 자신의 글을 삭제할 수 있다', async () => {
      const article = sampleArticle();
      jest.mocked(articlesRepository.getArticle).mockResolvedValue(article);
      jest.mocked(articlesRepository.deleteArticle).mockResolvedValue(article);

      await articlesService.deleteArticle(article.id, article.userId);

      expect(articlesRepository.deleteArticle).toHaveBeenCalledWith(article.id);
    });

    test('삭제 대상 글이 없으면 NotFoundError', async () => {
      jest.mocked(articlesRepository.getArticle).mockResolvedValue(null);

      await expect(articlesService.deleteArticle(999, 1)).rejects.toThrow(NotFoundError);
    });

    test('다른 사람이 삭제 시도 시 ForbiddenError', async () => {
      const article = sampleArticle();
      jest.mocked(articlesRepository.getArticle).mockResolvedValue({ ...article, userId: 2 });

      await expect(articlesService.deleteArticle(article.id, 1)).rejects.toThrow(ForbiddenError);
    });
  });
});
