import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

// Define the CartItem type
type CartItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string | number;
  quantity: number;
  [key: string]: any; // For any additional properties
};

const CartPage: NextPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load cart items from localStorage
    const loadCart = () => {
      setIsLoading(true);
      try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  const handleGoBack = () => {
    router.back();
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(current => current.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, action: 'increment' | 'decrement') => {
    setCartItems(current => 
      current.map(item => {
        if (item.id === id) {
          const newQuantity = action === 'increment' 
            ? item.quantity + 1 
            : Math.max(1, item.quantity - 1);
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle different price formats
      let itemPrice = 0;
      if (typeof item.price === 'number') {
        itemPrice = item.price;
      } else if (typeof item.price === 'string') {
        // Remove currency symbol and parse
        const priceString = item.price.replace(/[^0-9.]/g, '');
        itemPrice = parseFloat(priceString) || 0;
      }
      
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Your Cart - Whimsical</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-center flex-1">Your Shopping Cart</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-[#F8B64C] border-b-[#F8B64C] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
            <button 
              onClick={handleGoBack}
              className="bg-[#F8B64C] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#E7A43C] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              {/* Cart items */}
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row">
                    {/* Product image */}
                    <div className="flex-shrink-0 rounded-lg overflow-hidden w-full sm:w-32 h-32 mb-4 sm:mb-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    
                    {/* Product details */}
                    <div className="flex-1 sm:ml-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-gray-600 mt-1 text-sm line-clamp-2">{item.description}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                          <p className="text-lg font-semibold text-gray-800">{typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}</p>
                        </div>
                      </div>
                      
                      {/* Quantity controls and remove button */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center border rounded-full overflow-hidden">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 'decrement')}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 'increment')}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove item"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span className="ml-2">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Order summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(calculateTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${(calculateTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button 
                className="w-full mt-6 bg-[#F8B64C] text-white py-3 rounded-full font-semibold hover:bg-[#E7A43C] transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CartPage; 