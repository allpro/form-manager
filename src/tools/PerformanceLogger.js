/* eslint-disable no-undef */

/**
 * Helper for logging performance in multiple steps
 */
function PerformanceLogger(prefix) {
	if (!(this instanceof PerformanceLogger)) {
		return new PerformanceLogger(prefix)
	}

	let start = 0
	let step = 0

	function startStep() {
		step = performance.now()
	}

	function reset() {
		step = start = performance.now()
	}

	function log(desc, fn) {
		if (fn) fn()

		const now = performance.now()
		const stepTime = Math.round((now - step) * 100) / 100
		const totalTime = Math.round((now - start) * 100) / 100

		let name = desc || (fn && fn.name) || 'STEP'
		if (prefix) name = `${prefix}: ${name}`

		console.log(name, `step = ${stepTime} ms / total = ${totalTime} ms`)

		startStep()
	}

	reset()

	return { log, startStep, reset }
}

export default PerformanceLogger
