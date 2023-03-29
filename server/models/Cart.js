module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalPrice = oldCart.totalPrice || 0;
    this.totalQty = oldCart.totalQty || 0;

    this.add = function(item, id) {
        let storedItem = this.items[id];
        if(!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalPrice += storedItem.item.price;
        this.totalQty++;
    };

    this.remove = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    this.remove_one = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;
    };

    this.generateArray = function() {
        let arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};