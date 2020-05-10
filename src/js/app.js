import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    const thisApp = this;
    for (let product of thisApp.data.products) {
      new Product(product.id, product);
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then((rawResponse) => {
        return rawResponse.json();
      }).then((parsedResponse) => {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', (event) =>{
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    const thisApp = this;
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
