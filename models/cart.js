module.exports = function Cart(oldCart){
    this.items = oldCart.items || {};

    this.add = function(item, id){
        let storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id] = 
                { 
                    price_data: {
                        product_data: {
                            name: item.name,
                            description: item.description
                        },
                        currency: 'aud',
                        tax_behavior: "exclusive",
                        unit_amount: item.price*100
                    }, 
                    quantity: 0
                    // subtotal: 0 
                };
            
        }
        storedItem.quantity++;
        // console.log(storedItem);
        // storedItem.subtotal = storedItem.item.price * storedItem.quantity;
    };

    this.generateArray = function() {
        const arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};