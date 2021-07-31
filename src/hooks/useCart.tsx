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
     const storagedCart = localStorage.getItem('@RocketShoes:cart')

     if (storagedCart) {
       return JSON.parse(storagedCart);
      }

    return [];
  });

 
  const addProduct = async (productId: number) => {
    try {
      // check if product exist in cart
      const res = await api.get(`/stock/${productId}`)
      const stock:Stock=res.data
      let cartList:Product[]= [...cart]

      const product=cartList.find((item)=>(item.id===productId ))


// if product exist get me it amount else the amount is zero
const currentAmount= product? product.amount:0
   const newAmount=   currentAmount+1
  if(newAmount>stock.amount){
    toast.info("max of the stock")
    return
  }

  if(product){

   // change value directly cause it "let"
    product.amount=newAmount
  }
  else{
    const res=await api.get(`/products/${productId}`)
const products:Product =res.data

     const newProduct={
       ...products,
       amount:newAmount
     }

     cartList.push(newProduct)
  }
setCart(cartList)

      // check product amount in stock api

     //setproduct with new amount to cart
     localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
     toast.error('something bad happened')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      
      let cartList:Product[]= [...cart]

      const index= cartList.map(product=>product.id ).indexOf(productId)
cartList.splice(index,1)
      setCart(cartList)
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const res = await api.get(`/stock/${productId}`)
      const stock:Stock=res.data

      if(amount > stock.amount){
        toast.info("max of the stock")
       
        return
      }

      let cartList:Product[]= [...cart]

      const product=cartList.find((item)=>(item.id===productId ))
if(product) {product.amount= amount}

setCart(cartList)
    } catch {
      toast.error('something bad happened')
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
