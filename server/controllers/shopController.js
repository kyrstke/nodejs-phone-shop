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

// GET
// Homepage
exports.homePage = async(req, res) => {
    try {
        let message2 = '';
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        for(let item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (!product[0].in_stock) {
                cart.remove(product[0].id);
                message2 = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'It looks like one or more of the items in your cart are no longer in stock.'
                }
            }
        }
        req.session.cart = cart;
        const phones = await Phone.find({ in_stock: true });
        res.render('index', { title: 'Phone Shop - Home', phones, cart, message2 });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
}

// GET
// Checkout
exports.checkoutPage = async(req, res) => {
    try {
        let message2 = '';
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        for(let item in cart.items) {
            const product = await Phone.find({ _id: item });
            if (!product[0].in_stock) {
                cart.remove(product[0].id);
                message2 = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'It looks like one or more of the items in your cart are no longer in stock.'
                }
            }
        }
        req.session.cart = cart;
        res.render('checkout', { title: 'Phone Shop - Checkout', cart: req.session.cart, message2: message2 });
    } catch(error) {
        res.status(500).send({ message: error.message || "Error Occured" });
        console.log(error);
    }
}

// POST
// Add to cart
exports.addToCart = async(req, res) => {
    try {
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        const addedProduct = await Phone.find({ _id: req.body.id});
        if (addedProduct[0].id in cart.items){
            req.session.message = {
                type: 'danger',
                intro: 'Oops!',
                message: addedProduct[0].name + ' is already in your cart.'
            }
        } else if (addedProduct[0].in_stock){
            cart.add(addedProduct[0], addedProduct[0].id);
            req.session.message = {
                type: 'success',
                intro: 'Hurray!',
                message: 'You added ' + addedProduct[0].name + ' to your cart.'
            }
        } else {
            req.session.message = {
                type: 'danger',
                intro: 'Oops!',
                message: 'Sorry, ' + addedProduct[0].name + ' is no longer in stock.'
            }
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
        var cart = new Cart(req.session.cart ? req.session.cart : {});
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
        var cart = new Cart(req.session.cart ? req.session.cart : {});
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
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        const qty = cart.totalQty;
        let success = true;
        for(let item in cart.items) {
            const boughtProduct = await Phone.find({ _id: item });
            if (!boughtProduct[0].in_stock) {
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
                    boughtProduct[0].in_stock = false;
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
        await Phone.updateMany({}, {in_stock: true});
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
                "in_stock": true
            },
            {
                "name": "iPhone 12 128GB Black",
                "price": 3699,
                "image": "ip12.jpg",
                "in_stock": true
            },
            {
                "name": "iPhone 13 256GB Green",
                "price": 4449,
                "image": "ip13.jpg",
                "in_stock": true
            },
            {
                "name": "iPhone 11 64GB Black",
                "price": 2499,
                "image": "ip11.jpg",
                "in_stock": true
            },
            {
                "name": "iPhone 13 mini 256GB Blue",
                "price": 3899,
                "image": "ip13mini.jpg",
                "in_stock": true
            },
            {
                "name": "iPhone 13 256GB Red",
                "price": 4449,
                "image": "ip13red.jpg",
                "in_stock": true
            },
            {
                "name": "Xiaomi 12 Pro 12/256GB 120Hz Blue",
                "price": 5199,
                "image": "xiaomi12problue.jpg",
                "in_stock": true
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

// deletePhoneData();
insertPhoneData();
// makePhoneDataAvailable();