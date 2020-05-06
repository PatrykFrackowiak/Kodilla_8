import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;
    thisProduct.accordionTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      for (let activeProduct of activeProducts) {
        if (activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;
    const categories = thisProduct.data.params;
    thisProduct.params = {};
    if (categories) {
      for (let category in categories) {
        const ingredients = categories[category].options;
        for (let ingredient in ingredients) {
          price += thisProduct.getPriceOfIngredient(ingredients[ingredient], ingredient, formData[category]);

          if (formData[category].includes(ingredient)) {
            thisProduct.changeIngredientVisibility(category, ingredient, (classList, classname) => classList.add(classname));

            if (!thisProduct.params[category]) {
              thisProduct.params[category] = {
                label: categories[category].label,
                options: {},
              };
            }
            thisProduct.params[category].options[ingredient] = ingredients[ingredient].label;
          } else {
            thisProduct.changeIngredientVisibility(category, ingredient, (classList, classname) => classList.remove(classname));
          }
        }
      }
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = thisProduct.price;
    }
  }

  getPriceOfIngredient(ingredientData, ingredientName, selectedIngredients) {
    if (!ingredientData.default && selectedIngredients.includes(ingredientName)) {
      return ingredientData.price;
    }
    if (ingredientData.default && !selectedIngredients.includes(ingredientName)) {
      return -ingredientData.price;
    }
    return 0;
  }

  changeIngredientVisibility(category, ingredient, toggleClass) {
    const thisProduct = this;
    for (let ingredientImage of thisProduct.imageWrapper.querySelectorAll(`.${category}-${ingredient}`)) {
      toggleClass(ingredientImage.classList, classNames.menuProduct.imageVisible);
    }
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', () => {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
