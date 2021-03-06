var _extends =
	Object.assign ||
	function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};

/**
 * Remove quotes around given string.
 *
 * @param {string} string
 * @returns {string}
 */
export function unquote(string) {
	return string && string.replace(/^['"]|['"]$/g, '');
}

/**
 * Return prop type object.
 *
 * @param {object} prop
 * @returns {object}
 */
export function getType(prop) {
	if (prop.flowType) {
		if (
			prop.flowType.name === 'union' &&
			prop.flowType.elements.every(function(elem) {
				return elem.name === 'literal';
			})
		) {
			return _extends({}, prop.flowType, {
				name: 'enum',
				value: prop.flowType.elements,
			});
		}
		return prop.flowType;
	}
	return prop.type;
}

/**
 * Show starting and ending whitespace around given string.
 *
 * @param {string} string
 * @returns {string}
 */
export function showSpaces(string) {
	return string && string.replace(/^\s|\s$/g, '␣');
}
