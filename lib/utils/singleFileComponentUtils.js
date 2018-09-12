import { replaceAll } from './utils';

var compiler = require('vue-template-compiler');
var stripComments = require('strip-comments');

var startsWith = function startsWith(str, searchString) {
	return str.indexOf(searchString, 0) === 0;
};

var buildStyles = function buildStyles(styles) {
	var _styles = '';
	if (styles) {
		styles.forEach(function(it) {
			if (it.content) {
				_styles += it.content;
			}
		});
	}
	if (_styles !== '') {
		return '<style scoped>' + _styles.trim() + '</style>';
	}
	return undefined;
};

var getSingleFileComponentParts = function getSingleFileComponentParts(code) {
	var parts = compiler.parseComponent(code, { pad: 'line' });
	parts.script.content = stripComments(parts.script.content, { preserveNewLines: true });
	return parts;
};

var injectTemplateAndParseExport = function injectTemplateAndParseExport(parts) {
	var code = parts.script.content;
	var index = -1;
	if (code.indexOf('module.exports') !== -1) {
		var startIndex = code.indexOf('module.exports');
		index = code.indexOf('{', startIndex) + 1;
	} else if (code.indexOf('exports.default') !== -1) {
		var _startIndex = code.indexOf('exports.default');
		index = code.indexOf('{', _startIndex) + 1;
	} else if (code.indexOf('export ') !== -1) {
		var _startIndex2 = code.indexOf('export ');
		index = code.indexOf('{', _startIndex2) + 1;
	}
	if (index === -1) {
		throw new Error('Failed to parse single file component: ' + code);
	}
	var right = code.substr(index).trim();
	if (right[right.length - 1] === ';') {
		right = right.slice(0, -1);
	}
	var templateString = replaceAll('' + parts.template.content, '`', '\\`');
	return '{\ntemplate: `' + templateString + '`,\n' + right;
};

var extractImports = function extractImports(code) {
	var imports = '';
	var lines = code.split('\n');
	lines.forEach(function(it) {
		if (startsWith(it, 'import') || it.indexOf('require(') !== -1) {
			imports += it + '\n';
		}
	});
	return imports + '\n';
};

export function isSingleFileComponent(code) {
	try {
		var parts = compiler.parseComponent(code, { pad: 'line' });
		return parts.template !== null;
	} catch (err) {
		return false;
	}
}

export function transformSingleFileComponent(code) {
	var parts = getSingleFileComponentParts(code);
	var templateAdded = injectTemplateAndParseExport(parts);
	return {
		component:
			'\n\t\t\t' +
			extractImports(parts.script.content) +
			'\n\t\t\tnew Vue(' +
			templateAdded +
			');\n\t\t',
		style: buildStyles(parts.styles),
	};
}
