const users = require('../models/userSchema')
const Product = require('../models/productSchema')
const Carts = require('../models/cartSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

exports.register = async (req, res) => {
    console.log('inside register controller');

    const { name, email, password } = req.body
    try {
        const existUser = await users.findOne({ email })

        if (existUser) {
            res.status(406).json('User already exist. Please login')
        }
        else {
            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new users({
                name,
                email,
                password: hashedPassword

            })
            await newUser.save()
            res.status(200).json(newUser)
        }
    } catch (error) {
        res.status(401).json(`Registration failed dew to ${error}`)
    }
}

exports.login = async (req, res) => {
    console.log('Inside login controller');

    const { email, password } = req.body;

    try {
        const existUser = await users.findOne({ email })
        if (!existUser) {
            return res.status(406).json('Incorrect email or password')
        }

        const isMatch = await bcrypt.compare(password, existUser.password)
        if (!isMatch) {
            return res.status(406).json('Incorrect email or password')
        }

        const token = jwt.sign({ userId: existUser._id }, "$ecret$uperAppkey12345")
        // console.log('Token is', token);


        return res.status(200).json({ existUser, token })
    } catch (error) {
        return res.status(401).json(`Login failed due to ${error}`)
    }
}

exports.addProduct = async (req, res) => {
    console.log('inside addProject controller');
    const { name, price, stock } = req.body;
    const productImage = req.file.filename
    // console.log(productImage);

    try {
        const existingProduct = await Product.findOne({ name })

        if (existingProduct) {
            res.status(406).json({ message: 'Product name is alredy exist..' })
        }
        else {
            const newProduct = new Product({
                name, price, stock, productImage
            })
            await newProduct.save()
            res.status(200).json(newProduct)
        }
    } catch (error) {
        res.status(401).json({ message: `request failed due to ${error}` })
    }

}

exports.updateStock = async (req, res) => {
    console.log('Inside updateStock controller');
    try {
        const { productId } = req.params
        const { stock } = req.body

        if (!stock || isNaN(stock) || stock < 0) {
            return res.status(400).json({ message: "Invalid stock value" })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        const currentStock = Number(product.stock)
        const newStock = Number(stock)

        product.stock = currentStock + newStock
        await product.save();

        res.status(200).json({ message: "Stock updated successfully", product })
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ message: "Internal server error" })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await users.find()
        res.status(200).json(allUsers)
    } catch (err) {
        res.status(401).json(`Request failed due to ${err}`)
    }
}

exports.addToCart = async (req, res) => {
    console.log('inside addToCart controller');
    try {
        const { productId, name, price, quantity, productImage } = req.body;
        const userId = req.payload; // from middleware

        // product availability
        const product = await Product.findOne({ _id: productId })

        if (!product) {
            res.status(404).json({ message: "Product not found" })
        }

        if (product.stock < 1) {
            res.status(400).json({ message: "Out of stock" })
        }
        else {
            // if item is already in cart
            let cartItem = await Carts.findOne({ productId, userId })

            if (cartItem) {
                res.status(400).json({ message: "Item already in your cart" })
            } else {
                // add to cart
                cartItem = new Carts({ productId, name, price, quantity, productImage, userId })
                await cartItem.save();

                // decrease by 1
                product.stock -= 1;
                await product.save();

                res.status(200).json({ message: "Item added to cart successfully!", cartItem })
            }
        }

    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error })
    }
}

exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cartItems = await Carts.find({ userId });

        // return an empty array 
        return res.status(200).json(cartItems.length ? cartItems : []);

    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Error fetching cart items", error });
    }
}

exports.getAllProduct = async (req, res) => {
    try {
        const allProducts = await Product.find()
        res.status(200).json(allProducts)

        // allProducts.forEach(product => {
        //     console.log(product.userId);
        // });

    } catch (err) {
        res.status(401).json(`Request failed due to ${err}`)
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        const allProducts = await Carts.find()
        // console.log("allProducts is:", allProducts);

        const productDetails = await Promise.all(
            allProducts.map(async (product) => {
                // console.log("product.userId is:", product.userId);

                const user = await users.findById(product.userId)
                return {
                    ...product._doc,
                    username: user ? user.name : "unknown",
                    email: user ? user.email : "no email",
                }
            })
        )

        res.status(200).json(productDetails)
        // console.log("Final product details:", productDetails);

    } catch (err) {
        res.status(500).json({ message: `Request failed due to ${err}` })
    }
}

exports.updateQuantity = async (req, res) => {
    console.log('inside updateQuantity controller');

    try {
        const { cartItemId } = req.params
        const { quantity } = req.body
        const newQuantity = Number(quantity)

        // validate quantity
        if (isNaN(newQuantity) || newQuantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" })
        }

        // find the cart item
        const cartItem = await Carts.findById(cartItemId)
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" })
        }

        // product is existing or not
        const product = await Product.findById(cartItem.productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        // convert to number
        let currentStock = Number(product.stock)
        if (isNaN(currentStock)) {
            return res.status(500).json({ message: "Invalid stock value in product" })
        }

        // calculate the difference 
        const oldQuantity = Number(cartItem.quantity)
        const delta = newQuantity - oldQuantity

        // if increasing 
        if (delta > 0) {
            if (delta > currentStock) {
                return res.status(400).json({ message: `No product stock available more than ${newQuantity - 1}` })
            }
            currentStock -= delta
        }
        else if (delta < 0) {
            currentStock += Math.abs(delta)
        }

        // update cart item quantity and update product stock
        cartItem.quantity = newQuantity
        product.stock = currentStock
        await cartItem.save()
        await product.save()

        let responseMessage = "Cart item updated successfully";
        if (currentStock === 0) {
            responseMessage += " and Product reach the avilable stock limit";
        }

        res.status(200).json({ message: responseMessage, cartItem })
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteCartItem = async (req, res) => {
    console.log('Inside deleteCartItem controller');

    const { cartItemId } = req.params;
    const { quantity } = req.body;

    try {
        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            res.status(400).json("Invalid quantity value");
        }

        // find the cart item by ID
        const cart = await Carts.findById(cartItemId);
        if (!cart) {
            res.status(404).json("Cart item not found");
        }

        const productId = cart.productId;
        // console.log("Product ID:", productId);

        // find the product 
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json("Product not found");
        }

        // update stock
        product.stock = Number(product.stock) + parsedQuantity;
        await product.save();

        // delete cart item
        await Carts.findByIdAndDelete(cartItemId);

        res.status(200).json("Product removed from your cart successfully");
        console.log('Product removed from cart and stock updated successfully');
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json("Internal server error");
    }
}
