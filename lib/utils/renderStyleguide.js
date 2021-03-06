import React from 'react';
import slots from 'rsg-components/slots';
import StyleGuide from 'rsg-components/StyleGuide';
import getRouteData from 'react-styleguidist/lib/utils/getRouteData';
import getPageTitle from 'react-styleguidist/lib/utils/getPageTitle';
import globalizeComponents from './globalizeComponents';
import processSections from './processSections';

/**
 * @param {object} styleguide An object returned by styleguide-loader
 * @param {number} codeRevision
 * @param {Location} [loc]
 * @param {Document} [doc]
 * @param {History} [hist]
 * @return {React.ReactElement}
 */
export default function renderStyleguide(styleguide, codeRevision) {
	var loc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window.location;
	var doc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : document;
	var hist = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : window.history;

	var allSections = processSections(styleguide.sections);

	// Globalize all components, not just ones we see on the screen, to make
	// all components accessible to all examples
	globalizeComponents(allSections);

	var _styleguide$config = styleguide.config,
		title = _styleguide$config.title,
		pagePerSection = _styleguide$config.pagePerSection;

	var _getRouteData = getRouteData(allSections, loc.hash, pagePerSection),
		sections = _getRouteData.sections,
		displayMode = _getRouteData.displayMode;

	// Update page title

	doc.title = getPageTitle(sections, title, displayMode);

	// If the current hash location was set to just `/` (e.g. when navigating back from isolated view to overview)
	// replace the URL with one without hash, to present the user with a single address of the overview screen
	if (loc.hash === '#/') {
		var url = loc.pathname + loc.search;
		hist.replaceState('', doc.title, url);
	}

	return React.createElement(StyleGuide, {
		codeRevision: codeRevision,
		config: styleguide.config,
		renderRootJsx: styleguide.renderRootJsx,
		slots: slots(styleguide.config),
		welcomeScreen: styleguide.welcomeScreen,
		patterns: styleguide.patterns,
		sections: sections,
		allSections: allSections,
		displayMode: displayMode,
		pagePerSection: pagePerSection,
	});
}
