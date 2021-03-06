/* eslint-env node, es2021 */

class WeakValueMap {
	constructor() {
		this.map = new Map();
		this.finalizationRegistry = new FinalizationRegistry((key) => {
			const ref = this.map.get(key);
			if(ref && !ref.deref()) {
				this.map.delete(key);
			}
		});
	}

	set(key, val) {
		const ref = new WeakRef(val);
		this.map.set(key, ref);
		this.finalizationRegistry.register(ref, key);
		return this;
	}

	get(key) {
		const ref = this.map.get(key);
		if(ref) {
			return ref.deref();
		}
	}

	has(key) {
		return this.get(key) !== undefined;
	}

	delete(key) {
		if(this.has(key)) {
			this.map.delete(key);
			return true;
		}
		return false;
	}

	get size() {
		return this.map.size;
	}
}

module.exports = WeakValueMap;
