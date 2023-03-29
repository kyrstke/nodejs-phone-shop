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

const add_danger_message_qty = (name, quantity) => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, you cannot add more than ' + quantity + ' units of ' + name + ' to your cart.'
    }
}

const add_danger_message_oos = (name) => {
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

const remove_danger_message = (name) => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, you cannot remove ' + name + ' from your cart because it is not in your cart.'
    }
}

const buy_success_message = (qty, sum) => {
    return {
        type: 'success',
        intro: 'Hurray!',
        message: 'You bought ' + qty + ' items for a total of ' + sum + 'zł.'
    }
}

const buy_danger_message = () => {
    return {
        type: 'danger',
        intro: 'Oops!',
        message: 'Sorry, you cannot buy anything because your cart is empty.'
    }
}

const out_of_stock_message = {
    type: 'danger',
    intro: 'Oops!',
    message: 'It looks like one or more of the items in your cart is no longer in stock.'
}


// GET
// Homepage
exports.homePage = async(req, res) => {
    try {
        let additional_message = '';
        const cart = new Cart(req.session.cart ? req.session.cart : {});
        for(const item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (product[0].quantity === 0) {
                cart.remove(product[0].id);
                additional_message = out_of_stock_message;
            }
        }
        req.session.cart = cart;
        const phones = await Phone.find({ quantity: { $gt: 0 } });
        res.render('index', { title: 'Phone Shop - Home', phones, cart, additional_message: additional_message });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
}

// GET
// Checkout
exports.checkoutPage = async(req, res) => {
    try {
        let additional_message = '';
        const cart = new Cart(req.session.cart ? req.session.cart : {});
        for(let item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (product[0].quantity < cart.items[item].qty) {
                cart.remove(product[0].id);
                additional_message = out_of_stock_message;
            }
        }
        req.session.cart = cart;
        res.render('checkout', { title: 'Phone Shop - Checkout', cart: req.session.cart, additional_message: additional_message });
    } catch(error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
}

// POST
// Add to cart
exports.addToCart = async(req, res) => {
    try {
        const cart = new Cart(req.session.cart ? req.session.cart : {});
        const addedProduct = await Phone.find({ _id: req.body.id});
        if (addedProduct[0].quantity !== 0) {
            if (addedProduct[0].id in cart.items) {
                if (cart.items[addedProduct[0].id].qty < addedProduct[0].quantity) {
                    cart.add(addedProduct[0], addedProduct[0].id);
                    req.session.message = add_success_message(addedProduct[0].name);
                }
                else {
                    req.session.message = add_danger_message_qty(addedProduct[0].name, addedProduct[0].quantity);
                }
            }
            else {
                cart.add(addedProduct[0], addedProduct[0].id);
                req.session.message = add_success_message(addedProduct[0].name);
            }
            
        } else {
            req.session.message = add_danger_message_oos(addedProduct[0].name);
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
    req.session.cart = cart;
    res.redirect('/');
}

// POST
// Remove from cart
exports.remove = async(req, res) => {
    try {
        const cart = new Cart(req.session.cart ? req.session.cart : {});
        const removedProduct = await Phone.find({ _id: req.body.id });
        if (removedProduct[0].id in cart.items){
            req.session.message = {
                type: 'info',
                intro: '',
                message: 'You removed ' + removedProduct[0].name + ' from your cart.'
            }
            cart.remove(removedProduct[0].id);
        } else {
            req.session.message = {
                type: 'danger',
                intro: 'Oops!',
                message: removedProduct[0].name + ' is not in your cart.'
            }
        }
    }
    catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
    req.session.cart = cart;
    res.redirect('/checkout');
}

// POST
// Remove all items from cart
exports.removeAll = async(req, res) => {
    try {
        const cart = new Cart(req.session.cart ? req.session.cart : {});
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
    }
    req.session.cart = cart;
    res.redirect('/checkout');
}

// POST
// Buy
exports.buy = async(req, res) => {
    try {
        let sum = 0;
        const cart = new Cart(req.session.cart ? req.session.cart : {});
        const qty = cart.totalQty;
        let success = true;
        for(let item in cart.items) {
            const boughtProduct = await Phone.find({ _id: item });
            if (boughtProduct[0].quantity === 0) {
                success = false;
                cart.remove(boughtProduct[0].id);
            }
        }
        if(success) {
            if(qty !== 0) {
                for(let item in cart.items) {
                    const boughtProduct = await Phone.find({ _id: item });
                    sum += boughtProduct[0].price;
                    cart.remove(boughtProduct[0].id);
                    boughtProduct[0].quantity--;
                    await boughtProduct[0].save();
                }
                req.session.message = {
                    type: 'success',
                    intro: 'Success!',
                    message: 'You bought ' + qty + ' phone(s) for ' + sum + ' zł.'
                }
                req.session.cart = cart;
                res.redirect('/');
            } else {
                req.session.message = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'You did not buy anything.'
                }
                res.redirect('/checkout');
            }
            
        } else {
            req.session.message = {
                type: 'danger',
                intro: 'Oops!',
                message: 'One or more of the products you selected are no longer in stock.'
            }
            req.session.cart = cart;
            res.redirect('/checkout');
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
}

async function makePhoneDataAvailable(){
    try {
        await Phone.updateMany({}, {quantity: 10});
    } catch (error) {
        console.log(error)
    }
}

async function insertPhoneData(){
    try {
        await Phone.insertMany([
            {
                "name": "iPhone 13 Pro 256GB Grey",
                "price": 4999,
                "image": "ip13pro.jpg",
                "quantity": 10
            },
            {
                "name": "iPhone 12 128GB Black",
                "price": 3699,
                "image": "ip12.jpg",
                "quantity": 50
            },
            {
                "name": "iPhone 13 256GB Green",
                "price": 4449,
                "image": "ip13.jpg",
                "quantity": 50
            },
            {
                "name": "iPhone 11 64GB Black",
                "price": 2499,
                "image": "ip11.jpg",
                "quantity": 2
            },
            {
                "name": "iPhone 13 mini 256GB Blue",
                "price": 3899,
                "image": "ip13mini.jpg",
                "quantity": 50
            },
            {
                "name": "iPhone 13 256GB Red",
                "price": 4449,
                "image": "ip13red.jpg",
                "quantity": 100
            },
            {
                "name": "Xiaomi 12 Pro 12/256GB 120Hz Blue",
                "price": 5199,
                "image": "xiaomi12problue.jpg",
                "quantity": 24
            }
            ]);
    } catch (error) {
        console.log(error)
    }
}

async function deletePhoneData(){
    try {
        await Phone.deleteMany({});
    } catch (error) {
        console.log(error)
    }
}

deletePhoneData();
insertPhoneData();
// makePhoneDataAvailable();