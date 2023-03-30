require('../models/db');
const session = require('express-session');
const Cart = require('../models/Cart');
const Phone = require('../models/Phone');

const iterate = (obj) => {
    Object.keys(obj).forEach(key => {
        console.log(`key: ${key}, value: ${obj[key]}`)
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            iterate(obj[key])
        }
    })
}

const add_success_message = (name) => {
    return {
        type: 'success',
        intro: 'Hurray!',
        message: 'You added ' + name + ' to your cart.'
    }
}

const add_low_qty_msg = (name, quantity) => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, there is only ' + quantity + ' units of ' + name + ' available.'
    }
}

const add_out_of_stock_msg = (name) => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, you cannot add ' + name + ' to your cart because it is out of stock.'
    }
}

const remove_success_message = (name) => {
    return {
        type: 'success',
        intro: 'Hurray!',
        message: 'You removed ' + name + ' from your cart.'
    }
}

const remove_fail_message = (name) => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, you cannot remove ' + name + ' from your cart because it is not in your cart.'
    }
}

const successful_purchase_msg = (qty, sum) => {
    let plural = qty > 1 ? 's' : '';
    return {
        type: 'success',
        intro: 'Hurray!',
        message: `You bought ${qty} phone${plural} for a total of ${sum} zł.`
    }
}

const empty_cart_msg = () => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, you cannot buy anything because your cart is empty.'
    }
}

const out_of_stock_msg = (products) => {
    if (products.length === 1) {
        return {
            type: 'danger',
            intro: 'Oops!',
            message: 'Sorry, you cannot buy ' + products[0] + ' because it is out of stock.'
        }
    } else {
        let message = 'Sorry, you cannot buy ';
        for (let i = 0; i < products.length; i++) {
            if (i === products.length - 1) {
                message = message.slice(0, -2);
                message += ' and ' + products[i] + ' because they are out of stock.';
            } else {
                message += products[i] + ', ';
            }
        }
        return {
            type: 'danger',
            intro: 'Oops!',
            message: message
        }
    }
}


// GET
// Homepage
exports.homePage = async(req, res) => {
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        let additional_message = '';
        for(const item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (product[0].quantity === 0) {
                cart.remove(product[0].id);
                additional_message = out_of_stock_msg;
            }
        }
        req.session.cart = cart;
        const phones = await Phone.find({ quantity: { $gt: 0 } });
        res.render('index', { title: 'Phone Shop - Home', phones, cart, additional_message: additional_message });
        return;
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
        return;
    }
}

// GET
// Checkout
exports.checkoutPage = async(req, res) => {
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        let additional_message = '';
        for(let item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (product[0].quantity < cart.items[item].qty) {
                cart.remove(product[0].id);
                additional_message = out_of_stock_msg;
            }
        }
        req.session.cart = cart;
        res.render('cart', { title: 'Phone Shop - Cart', cart: req.session.cart, additional_message: additional_message });
        return;
    } catch(error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
        return;
    }
}

// POST
// Add to cart
exports.addToCart = async(req, res) => {
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        const addedProduct = await Phone.find({ _id: req.body.id});
        if (addedProduct[0].quantity !== 0) {
            if (addedProduct[0].id in cart.items) {
                if (cart.items[addedProduct[0].id].qty < addedProduct[0].quantity) {
                    cart.add(addedProduct[0], addedProduct[0].id);
                    req.session.message = add_success_message(addedProduct[0].name);
                }
                else {
                    req.session.message = add_low_qty_msg(addedProduct[0].name, addedProduct[0].quantity);
                }
            }
            else {
                cart.add(addedProduct[0], addedProduct[0].id);
                req.session.message = add_success_message(addedProduct[0].name);
            }
            
        } else {
            req.session.message = add_out_of_stock_msg(addedProduct[0].name);
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
        return;
    }
    req.session.cart = cart;
    res.redirect('/');
    return;
}

// POST
// Remove from cart
exports.remove = async(req, res) => {
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        const removedProduct = await Phone.find({ _id: req.body.id });
        if (removedProduct[0].id in cart.items){
            req.session.message = remove_success_message(removedProduct[0].name);
            cart.remove(removedProduct[0].id);
        } else {
            req.session.message = remove_fail_message(removedProduct[0].name);
        }
    }
    catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
        return;
    }
    req.session.cart = cart;
    res.redirect('/checkout');
    return;
}

// POST
// Remove all items from cart
exports.removeAll = async(req, res) => {
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        for(let item in cart.items) {
            const removedProduct = await Phone.find({ _id: item});
            cart.remove(removedProduct[0].id);
        }
        req.session.message = {
            type: 'info',
            intro: '',
            message: 'You removed all items from your cart.'
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
        return;
    }
    req.session.cart = cart;
    res.redirect('/checkout');
    return;
}

// POST
// Buy
exports.buy = async(req, res) => {
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        let sum = 0;
        const qty = cart.totalQty;
        const out_of_stock_products = [];
        // Check if there are enough products in stock
        for(const item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (product[0].quantity < cart.items[item].qty) {
                out_of_stock_products.push(product[0].name);
                cart.remove(product[0].id);
            }
        }
        if (out_of_stock_products.length > 0) {
            req.session.message = out_of_stock_msg(out_of_stock_products);
            req.session.cart = cart;
            res.redirect('/checkout');
            return;
        }
        if(qty === 0) {
            req.session.message = empty_cart_msg;
            res.redirect('/checkout');
            return;
        } else {
            for(let item in cart.items) {
                const boughtProduct = await Phone.find({ _id: item });
                sum += boughtProduct[0].price;
                cart.remove(boughtProduct[0].id);
                boughtProduct[0].quantity -= cart.items[item].qty;
                await boughtProduct[0].save();
            }
            req.session.message = successful_purchase_msg(qty, sum);
            req.session.cart = cart;
            res.redirect('/');
            return;
        }           
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
        return;
    }
}

async function makePhoneDataAvailable(){
    try {
        await Phone.updateMany({}, {
            quantity: 1,
            in_stock: true
        });
        console.log('Phone data available');
    } catch (error) {
        console.log(error);
        console.log('Phone data not available');
    }
}

async function insertPhoneData(){
    try {
        await Phone.insertMany([
            {
                "name": "iPhone 13 Pro 256GB Grey",
                "price": 4999,
                "image": "ip13pro.jpg",
                "in_stock": true,
                "quantity": 1,
            },
            {
                "name": "iPhone 12 128GB Black",
                "price": 3699,
                "image": "ip12.jpg",
                "in_stock": true,
                "quantity": 1,
            },
            {
                "name": "iPhone 13 256GB Green",
                "price": 4449,
                "image": "ip13.jpg",
                "in_stock": true,
                "quantity": 1,
            },
            {
                "name": "iPhone 11 64GB Black",
                "price": 2499,
                "image": "ip11.jpg",
                "in_stock": true,
                "quantity": 1,
            },
            {
                "name": "iPhone 13 mini 256GB Blue",
                "price": 3899,
                "image": "ip13mini.jpg",
                "in_stock": true,
                "quantity": 1,
            },
            {
                "name": "iPhone 13 256GB Red",
                "price": 4449,
                "image": "ip13red.jpg",
                "in_stock": true,
                "quantity": 1,
            },
            {
                "name": "Xiaomi 12 Pro 12/256GB 120Hz Blue",
                "price": 5199,
                "image": "xiaomi12problue.jpg",
                "quantity": 1,
                "in_stock": true,
            },
        ]);
        console.log("Inserted phone data");
        const phones = await Phone.find({ quantity: { $gt: 0 } });
        console.log(phones);
    } catch (error) {
        console.log(error);
        console.log("Error occured while inserting phone data");
    }
}

async function deletePhoneData(){
    try {
        await Phone.deleteMany({});
        console.log("Deleted all phone data");
    } catch (error) {
        console.log(error);
        console.log("Error occured while deleting phone data");
    }
}

deletePhoneData();
setTimeout(insertPhoneData, 1000);
// makePhoneDataAvailable();