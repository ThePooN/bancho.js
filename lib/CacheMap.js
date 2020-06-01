let CacheMap;
try {
	CacheMap = require("weak-value-map");
} catch(err) {
	CacheMap = Map;
}

module.exports = CacheMap;
