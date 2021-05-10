import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  let priceTotal = 0;

  cart.forEach(product => {
    priceTotal += product.price * product.amount;
  });

  function handleProductIncrement(product: Product) {
    updateProductAmount({productId: product.id, amount: 1})
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({productId: product.id, amount: -1})
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map(productInCart => {
            return(
              <tr key={productInCart.id}>
                <td>
                  <img src={productInCart.image} alt={productInCart.title} />
                </td>
                <td>
                  <strong>{productInCart.title}</strong>
                  <span>{formatPrice(productInCart.price)}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                        disabled={productInCart.amount <= 1}
                        onClick={() => handleProductDecrement(productInCart)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={productInCart.amount}
                    />
                    <button
                        type="button"
                        data-testid="increment-product"
                        onClick={() => handleProductIncrement(productInCart)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formatPrice(productInCart.amount * productInCart.price)}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                      onClick={() => handleRemoveProduct(productInCart.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{formatPrice(priceTotal)}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
