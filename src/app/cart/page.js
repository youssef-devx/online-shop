"use client"
import { CartContext } from "@/CartContext"
import { UserContext } from "@/UserContext"
import Product from "@/components/Product"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { useCallback, useContext } from "react"

export default function Cart() {
  const [cart, setCart] = useContext(CartContext)
  const [user] = useContext(UserContext)

  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  }

  const removeFromCart = useCallback(
    (idx) => setCart((currCart) => currCart.filter((_, pIdx) => pIdx !== idx)),
    [setCart]
  )

  return (
    <main className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cart items:</h2>
        <p className="bg-[#eee] p-4 rounded-lg">
          Total Price: <span className="font-bold">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
        </p>
      </div>
      <div className="products">
        {cart.map((productInfo, idx) => (
          <Product
            key={idx}
            productInfo={productInfo}
            btnLabel="Remove from Cart"
            onClick={() => removeFromCart(idx)}
          />
        ))}
      </div>
      {cart.length < 1 ? <div className="bg-[#f75347] text-white p-4 rounded-lg w-fit">No product was added, try add some.</div> : null}
      <div className="flex justify-center items-center p-6 bg-[#eee] rounded-lg">
        {user && cart.length > 0 ? (
            <PayPalScriptProvider options={initialOptions}>
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: cart.reduce((a, b) => a + b.price, 0).toFixed(2),
                        },
                      },
                    ],
                  })
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then((details) => {
                    const name = details.payer.name.given_name
                    alert(`Transaction completed by ${name}`)
                    setCart([])
                  })
                }}
              />
            </PayPalScriptProvider>
        ) : <p>Login in order to proceed.</p>}
      </div>
    </main>
  )
}
