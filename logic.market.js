//////////////////////////////////////////////////////////////////////////////
// This file contains the logic to handle the basic selling of resources in
// the market.
//
// Currently it is experimental and pretty simple, it will improve over time.
//////////////////////////////////////////////////////////////////////////////

let logicMarket = {

    minMineralAmountToStartSelling : 2000,
    minResourcesToStartSelling     : 2000,
    resourcesToSell                : [RESOURCE_HYDROGEN, RESOURCE_OXYGEN], // TODO: Flexibilize this
    minimumProfit                  : 0.3,

    /**
     * This should get the best deal in the market for the resources in the array resourcesToSell.
     *
     * @param {Room} room
     */
    run: function (room)
    {
        if (Game.time % 10 !== 0)
            return;

        if (room.terminal === undefined)
            return;

        // Only start selling after we're over the energy threshold
        if (room.terminal.store[RESOURCE_ENERGY] < this.minResourcesToStartSelling)
            return;

        // Only sell items that we have above the minimum stock (It can go below that minimum after the sale!)
        let actualResourcesToSell = _.cloneDeep(this.resourcesToSell);
        for (let res of this.resourcesToSell)
        {
            if (room.terminal.store[res] >= this.minMineralAmountToStartSelling)
                continue;

            // Remove element from array
            const index = actualResourcesToSell.indexOf(res);
            if (index > -1)
                actualResourcesToSell.splice(index, 1);
        }

        if (actualResourcesToSell.length === 0)
            return;

        const bestOrders = this.getBestThreeBuyOrders(room, actualResourcesToSell);
        console.log('Best orders:\n' + ex(bestOrders));

        // Only sell if we would get more than 0.3 credits profit per unit. Otherwise, let them starve.
        if (bestOrders[0]["estimatedProfitPerUnitSold"] < this.minimumProfit)
        {
            console.log('Profit would be too low. Holding to stock.')
            return;
        }

        // SELL!
        const amountToSell = Math.min(room.terminal.store[bestOrders[0].resourceType], bestOrders[0].remainingAmount,  bestOrders[0].amount);
        let result = Game.market.deal(bestOrders[0].id, amountToSell, room.name);
        if (result === 0)
        {
            let buffer = 'Order completed successfully:\n' +
                'Resource: ' + bestOrders[0].resourceType + '\n' +
                'Amount: ' + amountToSell + '\n' +
                'Credits ' + amountToSell * bestOrders[0].price + '\n' +
                'Order details:\n' + ex(bestOrders[0]);

            console.log(buffer);
            Game.notify(buffer, 1440);
        }
    },

    /**
     * This function returns the best 3 buying orders from the market, using the mean of the energy cost of the week
     * as the main comparison unit.
     *
     * This function has a very specialized algorithm to handle sorting without using an off the shelf sorting code.
     * It is more efficient, albeit slightly more confusing.
     *
     * @param {Room} room - Room with the terminal.
     * @param {Array} resourcesToSell - Array with the resources to sell.
     */
    getBestThreeBuyOrders: function (room, resourcesToSell)
    {
        // Find the past week average energy price
        // TODO: Cache this
        const energyPriceHistory = Game.market.getHistory(RESOURCE_ENERGY);
        const energyPrice = _.sum(energyPriceHistory, 'avgPrice') / energyPriceHistory.length;
        console.log("Energy average price (14 days): " + energyPrice);

        // Get the current buy orders for the supplied resources
        const orders = Game.market.getAllOrders(order => order.type === ORDER_BUY && resourcesToSell.includes(order.resourceType));
        console.log('buy orders found: ' + orders.length);

        let bestOrders = [];

        // Initialize our top 3 sorted array with the first 3 available orders.
        const initAmount = Math.min(3, orders.length)
        let dealEnergyCostNormalized = this.estimateEnergyCostPerItemSold(orders[0]["remainingAmount"], room.name, orders[0]["roomName"] );
        orders[0]["dealCostNormalized"] = dealEnergyCostNormalized;
        orders[0]["estimatedProfitPerUnitSold"] = this.estimateProfitPerUnitSold(orders[0]["price"], dealEnergyCostNormalized, energyPrice);
        bestOrders.push(orders[0]);

        dealEnergyCostNormalized = this.estimateEnergyCostPerItemSold(orders[1]["remainingAmount"], room.name, orders[1]["roomName"] );
        orders[1]["dealCostNormalized"] = dealEnergyCostNormalized;
        orders[1]["estimatedProfitPerUnitSold"] = this.estimateProfitPerUnitSold(orders[1]["price"], dealEnergyCostNormalized, energyPrice);
        if (bestOrders[0]["estimatedProfitPerUnitSold"] < orders[1]["estimatedProfitPerUnitSold"])
            bestOrders.unshift(orders[1]);
        else
            bestOrders.push(orders[1]);

        dealEnergyCostNormalized = this.estimateEnergyCostPerItemSold(orders[2]["remainingAmount"], room.name, orders[2]["roomName"] );
        orders[2]["dealCostNormalized"] = dealEnergyCostNormalized;
        orders[2]["estimatedProfitPerUnitSold"] = this.estimateProfitPerUnitSold(orders[2]["price"], dealEnergyCostNormalized, energyPrice);
        if (bestOrders[0]["estimatedProfitPerUnitSold"] < orders[2]["estimatedProfitPerUnitSold"])
            bestOrders.unshift(orders[1]);
        else if(bestOrders[1]["estimatedProfitPerUnitSold"] < orders[2]["estimatedProfitPerUnitSold"])
            bestOrders.splice(1, 0, orders[2]);
        else
            bestOrders.push(orders[1]);

        if (orders.length > initAmount)
        {
            for (let i = initAmount; i < orders.length; ++i)
            {
                dealEnergyCostNormalized = this.estimateEnergyCostPerItemSold(orders[i]["remainingAmount"], room.name, orders[i]["roomName"] );
                orders[i]["dealCostNormalized"] = dealEnergyCostNormalized;
                orders[i]["estimatedProfitPerUnitSold"] = this.estimateProfitPerUnitSold(orders[i]["price"], dealEnergyCostNormalized, energyPrice);

                if (bestOrders[0]["estimatedProfitPerUnitSold"] < orders[i]["estimatedProfitPerUnitSold"])
                {
                    bestOrders.unshift(orders[i]);
                    bestOrders.pop();
                }
                else if(bestOrders[1]["estimatedProfitPerUnitSold"] < orders[i]["estimatedProfitPerUnitSold"])
                {
                    bestOrders.splice(1, 0, orders[i]);
                    bestOrders.pop();
                }
                else if(bestOrders[2]["estimatedProfitPerUnitSold"] < orders[i]["estimatedProfitPerUnitSold"])
                {
                    bestOrders[2] = orders[i];
                }
            }
        }
        return bestOrders;
    },

    /**
     * This function has the formula used to get the resource cost to sell each unit of goods to a destination room.
     *
     * @param {number} amountToSell
     * @param {Room} roomOrigin
     * @param {Room} roomDestination
     * @return {number} Energy cost per item sold
     */
    estimateEnergyCostPerItemSold: function(amountToSell, roomOrigin, roomDestination)
    {
        return Game.market.calcTransactionCost(amountToSell, roomOrigin, roomDestination) / amountToSell;
    },

    /**
     * This function has the formula to estimate the profit for each unit of goods sold
     *
     * @param {number} price - Selling price
     * @param {number} energyCostPerItem - Amount of Energy cost per item sold
     * @param {number} energyPrice - Current price of the energy
     * @return {number} Profit per unit sold
     */
    estimateProfitPerUnitSold: function(price, energyCostPerItem, energyPrice)
    {
        return price - (energyCostPerItem * energyPrice);
    }
}

module.exports = logicMarket;