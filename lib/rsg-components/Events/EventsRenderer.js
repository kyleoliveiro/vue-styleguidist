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
import Arguments from 'rsg-components/Arguments';
import Code from 'rsg-components/Code';
import JsDoc from 'rsg-components/JsDoc';
import Markdown from 'rsg-components/Markdown';
import Name from 'rsg-components/Name';
import Type from 'rsg-components/Type';
import Para from 'rsg-components/Para';
import Table from 'rsg-components/Table';
import map from 'lodash/map';
import { unquote, getType, showSpaces } from '../../utils/utils';

function renderType(type) {
	if (!type) {
		return 'unknown';
	}
	var name = type.name;
	var names = type.names;

	if (names) {
		name = names.join('|');
	}
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
		var description = prop.description;
		rows.push(
			React.createElement(
				'div',
				{ key: name },
				React.createElement(Name, null, name),
				': ',
				React.createElement(Type, null, renderType(prop)),
				description && ' — ',
				description && React.createElement(Markdown, { text: description, inline: true })
			)
		);
	}
	return rows;
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
	return React.createElement(
		'div',
		null,
		description && React.createElement(Markdown, { text: description }),
		extra && React.createElement(Para, null, extra),
		React.createElement(JsDoc, tags),
		args.length > 0 && React.createElement(Arguments, { args: args, heading: true })
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
	if (!Array.isArray(getType(prop).value)) {
		return React.createElement('span', null, getType(prop).value);
	}

	var values = getType(prop).value.map(function(value, index) {
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
	return React.createElement(Type, null, renderType(getType(prop)));
}

export function getRowKey(row) {
	return row.name;
}

export function propsToArray(props) {
	return map(props, function(prop, name) {
		return _extends({}, prop, { name: name });
	});
}

export var columns = [
	{
		caption: 'Event name',
		render: renderName,
	},
	{
		caption: 'Type',
		render: renderTypeColumn,
	},
	{
		caption: 'Description',
		render: renderDescription,
	},
];

export default function EventsRenderer(_ref2) {
	var props = _ref2.props;

	return React.createElement(Table, {
		columns: columns,
		rows: propsToArray(props),
		getRowKey: getRowKey,
	});
}

EventsRenderer.propTypes = {
	props: PropTypes.object.isRequired,
};
