const db = require('./db');

async function count() {
    var result = await db.one("SELECT COUNT(*) AS count FROM restaurant");
    return result.count;
}

async function getSelected(restaurantIds) {
    return db.any("SELECT * FROM restaurant WHERE restaurantId = ANY(ARRAY($1))", restaurantIds);    
}

module.exports = {
    //getAll: getAll,
    count: count,
    getSelected: getSelected
};