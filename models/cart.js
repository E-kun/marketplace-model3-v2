module.exports = function Cart(oldCart){
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id){
        let storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id] = { name: item.name, item: item, qty: 0, price: item.price, subtotal: 0 };
            console.log(storedItem.name);
        }
        storedItem.qty++;
        storedItem.subtotal = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

    this.generateArray = function() {
        const arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};