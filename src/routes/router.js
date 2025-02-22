const express = require('express')
const userController = require('../controllers/userController')
const jwtMiddleWare = require('../middleware/jwtMiddleware')
const multerConfig = require('../middleware/multterMiddleware')

const router = express.Router()

//register 
router.post('/users/register', userController.register)

//login
router.post('/users/login', userController.login)

//add Product
router.post('/product/addnew', jwtMiddleWare, multerConfig.single(`productImage`), userController.addProduct)

// update stock level
router.put('/product/update/:productId', jwtMiddleWare, userController.updateStock)

//get all users
router.get('/project/all-users', userController.getAllUsers)

//add product to cart 
router.post("/cart/add", jwtMiddleWare, userController.addToCart)

// get product from cart
router.get("/getcart/items", userController.getCartItems)

//get all product
router.get('/project/all-project', userController.getAllProduct)

//get all orders
router.get("/orders/all", userController.getAllOrders)

//update the quantity
router.put('/cart/update/:cartItemId', userController.updateQuantity)



module.exports = router