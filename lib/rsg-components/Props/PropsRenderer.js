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

function _toConsumableArray(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
			arr2[i] = arr[i];
		}
		return arr2;
	} else {
		return Array.from(arr);
	}
}

import React from 'react';
import PropTypes from 'prop-types';
import Group from 'react-group';
import objectToString from 'javascript-stringify';
import Arguments from 'rsg-components/Arguments';
import Argument from 'rsg-components/Argument';
import Code from 'rsg-components/Code';
import JsDoc from 'rsg-components/JsDoc';
import Markdown from 'rsg-components/Markdown';
import Name from 'rsg-components/Name';
import Type from 'rsg-components/Type';
import Text from 'rsg-components/Text';
import Para from 'rsg-components/Para';
import Table from 'rsg-components/Table';
import { unquote, getType, showSpaces } from './util';

function renderType(type) {
	if (!type) {
		return 'unknown';
	}

	var name = type.name;

	switch (name) {
		case 'arrayOf':
			return type.value.name + '[]';
		case 'objectOf':
			return '{' + renderType(type.value) + '}';
		case 'instanceOf':
			return type.value;
		default:
			return name;
	}
}

function renderFlowType(type) {
	if (!type) {
		return 'unknown';
	}

	var name = type.name,
		raw = type.raw,
		value = type.value;

	switch (name) {
		case 'enum':
			return name;
		case 'literal':
			return value;
		case 'signature':
			return renderComplexType(type.type, raw);
		case 'union':
		case 'tuple':
			return renderComplexType(name, raw);
		default:
			return raw || name;
	}
}

function renderComplexType(name, title) {
	return React.createElement(
		Text,
		{ size: 'small', underlined: true, title: title },
		React.createElement(Type, null, name)
	);
}

function renderEnum(prop) {
	if (!Array.isArray(getType(prop).value)) {
		return React.createElement('span', null, getType(prop).value);
	}

	var values = getType(prop).value.map(function(_ref) {
		var value = _ref.value;
		return React.createElement(Code, { key: value }, showSpaces(unquote(value)));
	});
	return React.createElement(
		'span',
		null,
		'One of:',
		' ',
		React.createElement(Group, { separator: ', ', inline: true }, values)
	);
}

function renderShape(props) {
	var rows = [];
	for (var name in props) {
		var prop = props[name];
		var defaultValue = renderDefault(prop);
		var description = prop.description;
		rows.push(
			React.createElement(
				'div',
				{ key: name },
				React.createElement(Name, null, name),
				': ',
				React.createElement(Type, null, renderType(prop)),
				defaultValue && ' — ',
				defaultValue,
				description && ' — ',
				description && React.createElement(Markdown, { text: description, inline: true })
			)
		);
	}
	return rows;
}

var defaultValueBlacklist = ['null', 'undefined'];

function renderDefault(prop) {
	// Workaround for issue https://github.com/reactjs/react-docgen/issues/221
	// If prop has defaultValue it can not be required
	if (prop.defaultValue) {
		if (prop.type || prop.flowType) {
			var propName = prop.type ? prop.type.name : prop.flowType.type;

			if (defaultValueBlacklist.indexOf(prop.defaultValue.value) > -1) {
				return React.createElement(Code, null, showSpaces(unquote(prop.defaultValue.value)));
			} else if (propName === 'func' || propName === 'function') {
				return React.createElement(
					Text,
					{
						size: 'small',
						color: 'light',
						underlined: true,
						title: showSpaces(unquote(prop.defaultValue.value)),
					},
					'Function'
				);
			} else if (propName === 'shape' || propName === 'object') {
				try {
					// We eval source code to be able to format the defaultProp here. This
					// can be considered safe, as it is the source code that is evaled,
					// which is from a known source and safe by default
					// eslint-disable-next-line no-eval
					var object = eval('(' + prop.defaultValue.value + ')');
					return React.createElement(
						Text,
						{
							size: 'small',
							color: 'light',
							underlined: true,
							title: objectToString(object, null, 2),
						},
						'Shape'
					);
				} catch (e) {
					// eval will throw if it contains a reference to a property not in the
					// local scope. To avoid any breakage we fall back to rendering the
					// prop without any formatting
					return React.createElement(
						Text,
						{ size: 'small', color: 'light', underlined: true, title: prop.defaultValue.value },
						'Shape'
					);
				}
			}
		}

		return React.createElement(Code, null, showSpaces(unquote(prop.defaultValue.value)));
	} else if (prop.required) {
		return React.createElement(Text, { size: 'small', color: 'light' }, 'Required');
	}
	return '';
}

function renderDescription(prop) {
	var description = prop.description,
		_prop$tags = prop.tags,
		tags = _prop$tags === undefined ? {} : _prop$tags;

	var extra = renderExtra(prop);
	var args = [].concat(
		_toConsumableArray(tags.arg || []),
		_toConsumableArray(tags.argument || []),
		_toConsumableArray(tags.param || [])
	);
	var returnDocumentation = (tags.return && tags.return[0]) || (tags.returns && tags.returns[0]);

	return React.createElement(
		'div',
		null,
		description && React.createElement(Markdown, { text: description }),
		extra && React.createElement(Para, null, extra),
		React.createElement(JsDoc, tags),
		args.length > 0 && React.createElement(Arguments, { args: args, heading: true }),
		returnDocumentation &&
			React.createElement(Argument, _extends({}, returnDocumentation, { returns: true }))
	);
}

function renderExtra(prop) {
	var type = getType(prop);
	if (!type) {
		return null;
	}
	switch (type.name) {
		case 'enum':
			return renderEnum(prop);
		case 'union':
			return renderUnion(prop);
		case 'shape':
			return renderShape(prop.type.value);
		case 'arrayOf':
			if (type.value.name === 'shape') {
				return renderShape(prop.type.value.value);
			}
			return null;
		case 'objectOf':
			if (type.value.name === 'shape') {
				return renderShape(prop.type.value.value);
			}
			return null;
		default:
			return null;
	}
}

function renderUnion(prop) {
	var type = getType(prop);
	if (!Array.isArray(type.value)) {
		return React.createElement('span', null, type.value);
	}

	var values = type.value.map(function(value, index) {
		return React.createElement(Type, { key: value.name + '-' + index }, renderType(value));
	});
	return React.createElement(
		'span',
		null,
		'One of type:',
		' ',
		React.createElement(Group, { separator: ', ', inline: true }, values)
	);
}

function renderName(prop) {
	var name = prop.name,
		_prop$tags2 = prop.tags,
		tags = _prop$tags2 === undefined ? {} : _prop$tags2;

	return React.createElement(Name, { deprecated: !!tags.deprecated }, name);
}

function renderTypeColumn(prop) {
	if (prop.flowType) {
		return React.createElement(Type, null, renderFlowType(getType(prop)));
	}
	return React.createElement(Type, null, renderType(getType(prop)));
}

export function getRowKey(row) {
	return row.name;
}

export var columns = [
	{
		caption: 'Prop name',
		render: renderName,
	},
	{
		caption: 'Type',
		render: renderTypeColumn,
	},
	{
		caption: 'Default',
		render: renderDefault,
	},
	{
		caption: 'Description',
		render: renderDescription,
	},
];

export default function PropsRenderer(_ref2) {
	var props = _ref2.props;

	return React.createElement(Table, { columns: columns, rows: props, getRowKey: getRowKey });
}

PropsRenderer.propTypes = {
	props: PropTypes.array.isRequired,
};
