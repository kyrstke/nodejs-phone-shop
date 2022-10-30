module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalPrice = oldCart.totalPrice || 0;
    this.totalQty = oldCart.totalQty || 0;

    this.add = function(item, id) {
        var storedItem = this.items[id];
        if(!storedItem) {
            storedItem = this.items[id] = item;
        }
        // storedItem.price = storedItem.item.price;
        this.totalPrice += storedItem.price;
        this.totalQty += 1;
    };

    this.remove = function(id) {
        var removedItem = this.items[id];
        this.totalPrice -= removedItem.price;
        this.totalQty -= 1;
        delete this.items[id];        
    }

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};