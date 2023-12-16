const addToCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.params.id;
        console.log(userId, productId);
        const product = await Product.findById(productId);

        let userCart = await Cart.findOne({ user: userId }).populate('products.product');
        console.log(userCart);

        if (!userCart) {
            userCart = await new Cart({ user: userId, products: [], total: 0 });
            console.log("new cart created ", userCart);
        }

        const existingItem = userCart.products.find(item => item.product.equals(productId));
        if (existingItem) {
            existingItem.quantity += 1;

            // Update subTotal for existing item
            existingItem.subTotal = existingItem.quantity * product.sales_price;
            if (existingItem.quantity > product.quantity) {
                existingItem.quantity = product.quantity;
                console.log("success");
            }
        } else {
            userCart.products.push({
                product: productId,
                quantity: 1,
                subTotal: product.sales_price,
            });
            console.log("success");
        }

        // Update total in userCart
        userCart.total = userCart.products.reduce((acc, item) => {
            return acc + (item.subTotal || 0);
        }, 0);

        await userCart.save();
        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
    }
};



const updateCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { productId, newQuantity } = req.body;

        const userCart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!userCart) {
            return res.status(404).json({ success: false, message: 'Cart not found for the user.' });
        }

        const productIndex = userCart.products.findIndex(item => item.product._id.toString() === productId);

        if (productIndex !== -1) {
            userCart.products[productIndex].quantity = parseInt(newQuantity, 10);//working
            userCart.products[productIndex].subTotal = userCart.products[productIndex].quantity * userCart.products[productIndex].product.sales_price;
            const productTotal = userCart.products[productIndex].subTotal;
            console.log(productTotal);


            const newTotal = userCart.products.reduce((acc, item) => {
                const itemSubTotal = item.subTotal || 0; // Handle the case where item.subTotal is undefined or NaN
                return acc + itemSubTotal;
            }, 0);
            userCart.total = newTotal
            console.log("//////////////", productTotal);
            console.log("?????????????", newTotal);

            await userCart.save();
            res.status(200).json({ success: true, total: newTotal, userCart, productTotal });
        } else {
            res.status(404).json({ success: false, message: 'Product not found in the cart.' });
        }
    } catch (error) {
        console.log(error.message);
    }
};