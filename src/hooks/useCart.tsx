import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart != null) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data } = await api.get('/products');
      const product = data.find((productInArray: Product) => productInArray.id === productId);

      if (!product) {
        throw('Erro na alteração de quantidade do produto');
      }

      const stockApi = await api.get('/stock');
      const stockProduct = await stockApi.data.find((stockInAttay: Stock) => stockInAttay.id === productId);

      let verifyProductInCart = false;

      await cart.map((productInCart) => {
        if (productInCart.id === productId) {
          productInCart.amount = productInCart.amount + 1;
          verifyProductInCart = true;
          if (stockProduct.amount < productInCart.amount) {
            productInCart.amount = productInCart.amount - 1;
            throw('Quantidade solicitada fora de estoque');
          }
        }
      });

      if (!verifyProductInCart) {
        const dataCart = {
          id: productId,
          title: product.title,
          price: product.price,
          image: product.image,
          amount: 1,
        }

        await setCart([...cart, dataCart]);
        const cartStorage = [...cart, dataCart];
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartStorage));
      } else {
        setCart([...cart]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      }


    } catch(e) {
      toast(e);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
          cart.splice(i, 1);
        }
      }
      setCart([...cart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      cart.map(async product => {
        if (product.id === productId && amount === -1) {
          product.amount = product.amount - 1;
          setCart([...cart]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
        } else if (product.id === productId && amount === 1) {
          product.amount = product.amount + 1;
          const stockApi = await api.get('/stock');
          const stockProduct = await stockApi.data.find((stockInAttay: Stock) => stockInAttay.id === productId);
          if (stockProduct.amount < product.amount) {
            product.amount = product.amount - 1;
            toast.error('Quantidade solicitada fora de estoque');
          }
          setCart([...cart]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
        }
      });
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
