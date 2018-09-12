import React from 'react';
import { WelcomeRenderer } from './WelcomeRenderer';

it('renderer should render welcome screen', function() {
	var actual = shallow(
		React.createElement(WelcomeRenderer, { classes: {}, patterns: ['foo/*.js', 'bar/*.js'] })
	);

	expect(actual).toMatchSnapshot();
});
