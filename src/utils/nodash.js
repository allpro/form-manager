/**
 * Helpers to avoid importing Lodash methods.
 * Some ideas here taken from Lodash.
 */
import isDate from 'date-fns/isDate'
export { isDate }

const UNDEFINED = void 0
const MAX_SAFE_INTEGER = 9007199254740991

const protoToString = Object.prototype.toString

export const isUndefined = v => v === UNDEFINED
export const isNil = v => v === UNDEFINED || v === null

function isType(v, type) {
	if (isNil(v)) return false

	const t = typeof v
	if (t === type.toLowerCase()) return true

	return t === 'object' && protoToString.call(v) === `[object ${type}]`
}

export const isArray = v => Array.isArray(v)
export const isBoolean = v => v === true || v === false
export const isString = v => isType(v, 'String')
export const isRegExp = v => isType(v, 'RexExp')
export const isObject = v => v != null && typeof v === 'object'
export const isFunction = v => isType(v, 'Function')
export const isNumber = v => isType(v, 'Number')
export const isInteger = v => isNumber(v) && v % 1 === 0
export const isSafeInteger = v => isInteger(v) && v < MAX_SAFE_INTEGER

export const toString = v => isNil(v) ? '' : typeof v === 'string' ? v : `${v}`
export const toNumber = v => isNumber(v) ? v : v ? +v : 0
export const toInteger = v => isInteger(v) ? v : Math.floor(toNumber(v))

export const trim = v => isString(v) ? v.trim() : v

export const inRange = (v, v1, v2) => (
	(v >= v1 && v <= v2) || (v <= v1 && v >= v2)
)

export const omit = (o, a) => {
	const keys = isArray(a) ? a : [a]
	const obj = Object.assign({}, o)
	for (const key of keys) if (key) delete obj[key]
	return obj
}

export const uniq = arr => Array.from(new Set(arr))

export const isPlainObject = v => {
	if (!isObject(v) || protoToString.call(v) !== '[object Object]') {
		return false
	}

	if (Object.getPrototypeOf(v) === null) {
		return true
	}

	let proto = v
	while (Object.getPrototypeOf(proto) !== null) {
		proto = Object.getPrototypeOf(proto)
	}
	return Object.getPrototypeOf(v) === proto
}

export const forOwn = (o, fn) => (
	Object.keys(o).forEach((key) => fn(o[key], key, o))
)

export const isEmpty = v => {
	if (isNil(v)) return true
	if (isArray(v) || isString(v)) return !v.length()
	if (isPlainObject(v)) return !Object.keys(v).length
	if (isType(v,'Map') || isType(v, 'Set')) return !v.size
	return false
}


// export const defaults = (o, d) => o
// export const defaultsDeep = (o, d) => o


export const clone = v => (
	!v // Exit early for performance
		? v
		: isPlainObject(v)
			? Object.assign({}, v)
			: isArray(v)
				? v.slice(v)
				: v
)

function recursiveClone(branch) {
	// Exit early for performance
	if (!branch) return branch

	if (isPlainObject(branch)) {
		const obj = {}
		for (const key in branch) {
			obj[key] = recursiveClone(branch[key])
		}
		return obj
	}

	if (isArray(branch)) {
		const len = branch.length
		const arr = new Array(len);
		for (let i = 0; i < len; i++) {
			arr[i] = recursiveClone(branch[i])
		}
		return arr
	}

	// Return any other object or simple value unchanged
	return branch
}

export const cloneDeep = obj => recursiveClone(obj)


function mergeBranch(target, source) {
	for (const key in source) {
		const targetVal = target[key]
		const sourceVal = source[key]

		if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
			mergeBranch(targetVal, sourceVal)
		}
		else if (!isUndefined(sourceVal)) {
			target[key] = sourceVal
		}
	}
}

export const merge = (target, ...sources) => {
	if (isPlainObject(target)) {
		for (const source of sources) {
			if (isPlainObject(source)) {
				mergeBranch(target, source)
			}
		}
	}

	return target
}


function setDefaults(source, defaults, deep) {
	if (!isPlainObject(source) || !isPlainObject(defaults)) return

	forOwn(defaults, (val, key) => {
		const srcVal = source[key]
		const defVal = defaults[key]

		if (isUndefined(srcVal)) {
			source[key] = isPlainObject(defVal) || isArray(defVal)
				? cloneDeep(defVal)
				: defVal
		}
		else if (deep && isPlainObject(srcVal) && isPlainObject(defVal)) {
			setDefaults(srcVal, defVal, true)
		}
	})
}

export const defaults = (srcObj, ...defObjs) => {
	defObjs.forEach(defs => setDefaults(srcObj, defs))
}

export const defaultsDeep = (srcObj, ...defObjs) => {
	defObjs.forEach(defs => setDefaults(srcObj, defs, true))
}


export const isEqual = (v1, v2) => {
	const simpleValue = val => {
		// Undefined and Null are equal to "" for data comparison.
		if (isNil( val )) return ''

		// Stringify Array and Hash values for simple comparison; rarely needed.
		if (isPlainObject(val) || isArray(val)) return JSON.stringify(val)

		// Convert data objects to number for comparison
		if (isDate(val)) return val.getTime()

		return val
	}
	return simpleValue(v1) === simpleValue(v2)
}
