import express from 'express';

const app = express();

const products = {
  1: {
    name: 'MacBook Pro',
    price: 2500000,
    reviews: [
      { id: 1, user: '민준', rating: 5 },
      { id: 2, user: '서연', rating: 4 },
    ],
  },
  2: {
    name: 'Logitech MX Keys',
    price: 120000,
    reviews: [
      { id: 3, user: '지후', rating: 5 },
      { id: 4, user: '하윤', rating: 3 },
    ],
  },
};

function getProduct(req, res, next) {
  req.product = products[req.params.id];
  if(req.product){
    next();
  }
  else{
    res.satuts(404).json({message : '존재하지 않는 상품입니다다'})
  }
}

app.get('/products/:id', getProduct, (req, res, next) => {
  res.json(req.product);
});

app.get('/products/:id/reviews', getProduct, (req, res, next) => {
  res.json(req.product.reviews);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});