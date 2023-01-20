import { HTTP_STATUS } from '../constants/api.constants'
import { HttpError } from '../utils/api.utils'
import sendEmail from '../utils/email.utils'
import sendSMS from '../utils/sms.utils'
import sendWhatsapp from '../utils/whatsapp.utils'
import CartsDAO from '../database/daos/carts.dao'

const cartsDAO = new CartsDAO()

export const createCart = async () => await cartsDAO.save()

export const deleteCart = async id => await cartsDAO.delete(id)

export const getProductsFromCart = async id => await cartsDAO.getProducts(id)

export const saveProductToCart = async (cartId, prodId) => await cartsDAO.saveProduct(cartId, prodId)

export const deleteProductFromCart = async (cartId, prodId) => await cartsDAO.deleteProduct(cartId, prodId)

export const decreaseProductFromCart = async (cartId, prodId) => await cartsDAO.decreaseProduct(cartId, prodId)

export const checkout = async (cartId, buyer) => {
  const products = await cartsDAO.getProducts(cartId)

  if (products.length < 1) {
    const message = 'The cart must have at least one product to checkout'
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, message)
  }

  await cartsDAO.emptyCart(cartId)

  // Email, Whatsapp and SMS sending
  const totalCost = products.reduce((acc, item) => acc + item.product.price * item.qty, 0)

  const emailStyles = {
    productsContainer: 'margin: 10px 0px;',
    card: 'border: 1px solid #ccc; padding: 12px; margin: 10px 0px; border-radius: 8px;',
    title: 'font-size: 18px; font-weight: bold;'
  }

  const productsCardsHtml = products
    .map(item => {
      return `
          <div style="${emailStyles.card}">
            <h3>${item.product.name}</h3>
            <p>${item.product.description}</p>
            <p>Total: US$ ${item.product.price} x ${item.qty} = US$ ${(item.product.price * item.qty).toFixed(2)}</p>
          </div>
        `
    })
    .join('')

  const bodyHtml = `
        <h2 style="${emailStyles.title}">Products Ordered</h2>
        <div style=${emailStyles.productsContainer}>
          ${productsCardsHtml}
        </div>
        <h2 style="${emailStyles.title}">Total: US$ ${totalCost.toFixed(2)}</h2>
      `

  sendEmail({
    subject: `New Order of ${buyer.name} - (${buyer.email})`,
    html: bodyHtml
  })

  const productsListText = products
    .map(item => {
      return `${item.qty}x ${item.product.name} (${item.product.description}) - US$ ${(
        item.product.price * item.qty
      ).toFixed(2)}`
    })
    .join('\n')

  const text = `New Order of ${buyer.name} - (${buyer.email})
  
  ${productsListText}`

  sendWhatsapp({
    message: text
  })

  sendSMS({
    to: buyer.phone,
    message: `Your order has been received and its being processed. Thanks for your purchase! CHBP Team`
  })

  return products
}
