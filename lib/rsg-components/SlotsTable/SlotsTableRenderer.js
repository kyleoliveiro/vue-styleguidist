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

import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'rsg-components/Markdown';
import Name from 'rsg-components/Name';
import Table from 'rsg-components/Table';
import map from 'lodash/map';

function renderDescription(prop) {
	var description = prop.description;

	return React.createElement(
		'div',
		null,
		description && React.createElement(Markdown, { text: description })
	);
}

function renderName(prop) {
	var name = prop.name,
		_prop$tags = prop.tags,
		tags = _prop$tags === undefined ? {} : _prop$tags;

	return React.createElement(Name, { deprecated: !!tags.deprecated }, name);
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
		caption: 'Slot',
		render: renderName,
	},
	{
		caption: 'Description',
		render: renderDescription,
	},
];

export default function SlotsTableRenderer(_ref) {
	var props = _ref.props;

	return React.createElement(Table, {
		columns: columns,
		rows: propsToArray(props),
		getRowKey: getRowKey,
	});
}

SlotsTableRenderer.propTypes = {
	props: PropTypes.object.isRequired,
};
