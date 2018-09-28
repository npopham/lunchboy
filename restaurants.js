const db = require('./db');

async function count() {
    var result = await db.one("SELECT COUNT(*) AS count FROM restaurant");
    return result.count;
}

module.exports = {
    //getAll: getAll,
    count: count,
    //getSelected: getSelected
};