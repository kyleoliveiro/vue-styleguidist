/* eslint-disable import/first */
import 'react-styleguidist/lib/polyfills';
import 'react-styleguidist/lib/styles';
import ReactDOM from 'react-dom';
import { getParameterByName, hasInHash } from 'react-styleguidist/lib/utils/handleHash';
import renderStyleguide from './utils/renderStyleguide';

// Examples code revision to rerender only code examples (not the whole page) when code changes
// eslint-disable-next-line no-unused-vars
var codeRevision = 0;

// Scrolls to origin when current window location hash points to an isolated view.
var scrollToOrigin = function scrollToOrigin() {
	var hash = window.location.hash;
	if (hasInHash(hash, '#/') || hasInHash(hash, '#!/')) {
		// Extracts the id param of hash
		var idHashParam = getParameterByName(hash, 'id');

		// For default scroll scrollTop is the page top
		var scrollTop = 0;

		if (idHashParam) {
			// Searches the node with the same id, takes his offsetTop
			// And with offsetTop, tries to scroll to node
			var idElement = document.getElementById(idHashParam);
			if (idElement && idElement.offsetTop) {
				scrollTop = idElement.offsetTop;
			}
		}
		window.scrollTo(0, scrollTop);
	}
};

var render = function render() {
	// eslint-disable-next-line import/no-unresolved
	var styleguide = require('!!../loaders/styleguide-loader!./index.js');
	ReactDOM.render(
		renderStyleguide(styleguide, codeRevision),
		document.getElementById(styleguide.config.mountPointId)
	);
};

window.addEventListener('hashchange', render);
window.addEventListener('hashchange', scrollToOrigin);

/* istanbul ignore if */
if (module.hot) {
	module.hot.accept('!!../loaders/styleguide-loader!./index.js', function() {
		codeRevision += 1;
		render();
	});
}

render();
