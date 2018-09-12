var _createClass = (function() {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ('value' in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}
	return function(Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
})();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError('Cannot call a class as a function');
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}
	return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== 'function' && superClass !== null) {
		throw new TypeError(
			'Super expression must either be null or a function, not ' + typeof superClass
		);
	}
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: { value: subClass, enumerable: false, writable: true, configurable: true },
	});
	if (superClass)
		Object.setPrototypeOf
			? Object.setPrototypeOf(subClass, superClass)
			: (subClass.__proto__ = superClass);
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { transform } from 'buble';
import PlaygroundError from 'rsg-components/PlaygroundError';
import { parse } from 'esprima';
import Vue from 'vue';
import {
	isSingleFileComponent,
	transformSingleFileComponent,
} from '../../utils/singleFileComponentUtils';
import styleScoper from '../../utils/styleScoper';

/* eslint-disable react/no-multi-comp */
var nameVarComponent = '__component__';

/*
 * Reads the code in string and separates the javascript part and the html part
 * @param {string} code
 */
var separateScript = function separateScript(code, style) {
	var index = void 0;
	var lines = code.split('\n');
	if (code.indexOf('new Vue') > -1) {
		var indexVueBegin = code.indexOf('new Vue');
		var setVue =
			'\n\n\n\n\n\t\t// Ignore: Extract the configuration of the example component\n\t\tfunction Vue(params){ ' +
			nameVarComponent +
			' = params }';
		return {
			js: code.slice(0, indexVueBegin),
			vueComponent: code.slice(indexVueBegin) + setVue,
			style: style,
		};
	} else if (isSingleFileComponent(code)) {
		var transformed = transformSingleFileComponent(code);
		return separateScript(transformed.component, transformed.style);
	}
	for (var id = 0; id < lines.length; id++) {
		if (lines[id].trim().charAt(0) === '<') {
			index = id;
			break;
		}
	}
	return {
		js: lines.slice(0, index).join('\n'),
		html: lines.slice(index).join('\n'),
	};
};

var getVars = function getVars(syntaxTree) {
	var arr = [];
	arr = syntaxTree.body.filter(function(syntax) {
		return syntax.type === 'VariableDeclaration' || syntax.type === 'FunctionDeclaration';
	});
	arr.unshift([]);
	return arr.reduce(function(total, next) {
		function getId(syntax) {
			if (syntax.declarations) {
				return Array.prototype.concat.apply(
					[],
					syntax.declarations.map(function(declaration) {
						return declaration.id.name;
					})
				);
			}
			return [syntax.id.name];
		}
		total = total.concat(getId(next));
		return total;
	});
};
var _compileCode = function _compileCode(code, config) {
	return transform(code, config).code;
};

/* eslint-disable no-invalid-this */

var Fragment = React.Fragment ? React.Fragment : 'div';

var Preview = (function(_Component) {
	_inherits(Preview, _Component);

	function Preview() {
		var _ref;

		var _temp, _this, _ret;

		_classCallCheck(this, Preview);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return (
			(_ret = ((_temp = ((_this = _possibleConstructorReturn(
				this,
				(_ref = Preview.__proto__ || Object.getPrototypeOf(Preview)).call.apply(
					_ref,
					[this].concat(args)
				)
			)),
			_this)),
			(_this.state = {
				error: null,
			}),
			(_this.handleError = function(err) {
				_this.unmountPreview();

				_this.setState({
					error: err.toString(),
				});

				console.error(err); // eslint-disable-line no-console
			}),
			_temp)),
			_possibleConstructorReturn(_this, _ret)
		);
	}

	_createClass(Preview, [
		{
			key: 'componentDidMount',
			value: function componentDidMount() {
				// Clear console after hot reload, do not clear on the first load
				// to keep any warnings
				if (this.context.codeRevision > 0) {
					// eslint-disable-next-line no-console
					console.clear();
				}

				this.executeCode();
			},
		},
		{
			key: 'shouldComponentUpdate',
			value: function shouldComponentUpdate(nextProps, nextState) {
				return this.state.error !== nextState.error || this.props.code !== nextProps.code;
			},
		},
		{
			key: 'componentDidUpdate',
			value: function componentDidUpdate(prevProps) {
				if (this.props.code !== prevProps.code) {
					this.executeCode();
				}
			},
		},
		{
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				this.unmountPreview();
			},
		},
		{
			key: 'unmountPreview',
			value: function unmountPreview() {
				if (this.mountNode) {
					var el = this.mountNode.children[0];
					if (!el) {
						this.mountNode.innerHTML = ' ';
						this.mountNode.appendChild(document.createElement('div'));
						el = this.mountNode.children[0];
					}
					el = new Vue({
						el: el,
						data: {},
						template: '<div></div> ',
					});
				}
			},
		},
		{
			key: 'executeCode',
			value: function executeCode() {
				this.setState({
					error: null,
				});

				var _props = this.props,
					code = _props.code,
					vuex = _props.vuex;
				var renderRootJsx = this.context.renderRootJsx;

				var compuse = {};
				var compiledCode = void 0;
				var configComponent = void 0;
				var syntaxTree = void 0;
				var listVars = [];
				var exampleComponent = void 0;
				if (!code) {
					return;
				}

				try {
					compuse = separateScript(code);
					compiledCode = this.compileCode(compuse.js);

					if (compuse.vueComponent) {
						configComponent = this.compileCode(compuse.vueComponent);
					}
					syntaxTree = parse(compuse.js);
					listVars = getVars(syntaxTree);
					exampleComponent = this.evalInContext(compiledCode, listVars, configComponent);
				} catch (err) {
					this.handleError(err);
					compuse.html = '';
				}

				var el = this.mountNode.children[0];
				if (!el) {
					this.mountNode.innerHTML = ' ';
					this.mountNode.appendChild(document.createElement('div'));
					el = this.mountNode.children[0];
				}
				if (exampleComponent) {
					var extendsComponent = {};
					var previewComponent = {};
					if (configComponent) {
						previewComponent = exampleComponent();

						Object.keys(previewComponent).forEach(function(key) {
							if (key === 'el') {
								delete previewComponent.el;
							}
						});
					} else {
						var data = exampleComponent();
						var template = compuse.html;
						previewComponent = {
							data: data,
							template: template,
						};
					}

					if (vuex) {
						extendsComponent = { store: vuex.default };
					}
					var moduleId = 'data-v-' + Math.floor(Math.random() * 1000) + 1;
					previewComponent._scopeId = moduleId;

					var rootComponent = renderRootJsx
						? renderRootJsx.default(previewComponent)
						: {
								render: function render(createElement) {
									return createElement(previewComponent);
								},
						  };
					var vueInstance = new Vue(
						Object.assign(extendsComponent, rootComponent, {
							el: el,
						})
					);

					if (compuse.style) {
						var styleContainer = document.createElement('div');
						styleContainer.innerHTML = compuse.style;
						styleContainer.firstChild.id = moduleId;
						vueInstance.$el.appendChild(styleContainer.firstChild);
					}
				}
				styleScoper();
			},
		},
		{
			key: 'compileCode',
			value: function compileCode(code) {
				try {
					return _compileCode(code, this.context.config.compilerConfig);
				} catch (err) {
					this.handleError(err);
				}
				return false;
			},
		},
		{
			key: 'evalInContext',
			value: function evalInContext(compiledCode, listVars, configComponent) {
				var exampleComponentCode = '';
				if (configComponent) {
					exampleComponentCode =
						'\n\t\t\t\tfunction getConfig() {\n\t\t\t\t\teval(\n\t\t\t\t\t\t' +
						JSON.stringify(compiledCode) +
						'\n\t\t\t\t\t\t + ";" +\n\t\t\t\t\t\t' +
						JSON.stringify(configComponent) +
						'\n\t\t\t\t\t);\n\t\t\t\t\treturn ' +
						nameVarComponent +
						';\n\t\t\t\t}\n\t\t\t\treturn getConfig();\n\t\t\t';
				} else {
					listVars = listVars.map(function(value) {
						return value + ' : ' + value;
					});
					exampleComponentCode =
						'\n\t\t\t\tfunction getData() {\n\t\t\t\t\teval(' +
						JSON.stringify(compiledCode) +
						')\n\t\t\t\t\treturn function() {\n\t\t\t\t\t\treturn {\n\t\t\t\t\t\t\t' +
						listVars.join(',') +
						'\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\treturn getData();\n\t\t\t';
				}

				return this.props.evalInContext(exampleComponentCode);
			},
		},
		{
			key: 'render',
			value: function render() {
				var _this2 = this;

				var error = this.state.error;

				return React.createElement(
					Fragment,
					null,
					React.createElement(
						'div',
						{
							ref: function ref(_ref2) {
								return (_this2.mountNode = _ref2);
							},
						},
						React.createElement('div', null)
					),
					error && React.createElement(PlaygroundError, { message: error })
				);
			},
		},
	]);

	return Preview;
})(Component);

Preview.propTypes = {
	code: PropTypes.string.isRequired,
	evalInContext: PropTypes.func.isRequired,
	vuex: PropTypes.object,
};
Preview.contextTypes = {
	config: PropTypes.object.isRequired,
	codeRevision: PropTypes.number.isRequired,
	renderRootJsx: PropTypes.object,
};
export default Preview;
