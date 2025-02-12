import productService from "./ProductApi.js";
import articleService from "./ArticleAPI.js";
 
class Product {
  constructor(name, description, price, tags, images, favoriteCount = 0) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.tags = tags;
    this.images = images;
    this._favoriteCount = favoriteCount;
  }

  set favoriteCount(count) {
    throw new Error("call favorite()"); 
  }

  get favoriteCount() {
    return this._favoriteCount;
  }

  favorite() {
    this._favoriteCount += 1;  
  }
}
 
class ElectronicProduct extends Product {
  constructor(name, description, price, tags, images, favoriteCount = 0, manufacturer = null) {
    super(name, description, price, tags, images, favoriteCount);
    this.manufacturer = manufacturer;
  }
}
 
class Article {
  constructor(title, content, writer = "", likeCount = 0) {
    this.title = title;
    this.content = content;
    this.writer = writer;
    this._likeCount = likeCount;
    this.createdAt = new Date();  
  }

  set likeCount(count) {
    throw new Error("call like()");  
  }

  get likeCount() {
    return this._likeCount;
  }

  like() {
    this._likeCount += 1; 
  }
}
 
async function main() {
  console.log("=== 게시글 목록 가져오기 ===");
  const articleList = await articleService.getArticleList(1, 5);
  console.log(articleList);

  console.log("=== 게시글 생성 ===");
  const newArticle = await articleService.createArticle(
    "새로운 게시글",
    "이것은 내용입니다.",
    "https://example.com/image.jpg"
  );
  console.log(newArticle);

  console.log("=== 상품 목록 가져오기 ===");
  const productList = await productService.getProductList(1, 5, "전자제품");
  console.log(productList);

  console.log("=== 상품 생성 ===");
  const newProduct = await productService.createProduct(
    "MacBook",
    "맥북 설명",
    2000000,
    ["전자제품"],
    ["https://example.com/image.jpg"]
  );
  console.log(newProduct);
}

main();
