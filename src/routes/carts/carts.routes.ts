import express from 'express'
import cartsController from '../../controllers/carts.controller'

const router = express.Router()

router.post('/', cartsController.createCart)
router.delete('/:id', cartsController.deleteCart)
router.get('/:id/products', cartsController.getProducts)
router.post('/:cartId/products/:prodId', cartsController.saveProduct)
router.delete('/:cartId/products/:prodId', cartsController.deleteProduct)
router.delete(
  '/:cartId/products/decrease/:prodId',
  cartsController.decreaseProduct
)
router.post('/:cartId/checkout', cartsController.checkout)

export default router
