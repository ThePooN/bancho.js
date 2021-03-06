let CacheMap;
try {
	CacheMap = require("weak-value-map");
} catch(err) {
	CacheMap = global.WeakRef !== undefined ? require("./WeakValueMap") : Map;
}

module.exports = CacheMap;
