/**
 * \file cache_reload.js
 * Plugin that forces a cache reload of boomerang (assuming you have server side support)
 * Copyright (c) 2013, SOASTA, Inc. All rights reserved.
 */


(function() {

BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

/**
 * @private
 * @const
 */
var impl = {
	url: ""
};

/**
 * @struct
 * @const
 * @type {!IPlugin}
 */
BOOMR.plugins.CACHE_RELOAD =  /** @lends {ipv6} */ {
	/**
     * @param {?Object.<string, ?>=} config
     * @return {!IPlugin}
     */
	init: function(config) {
		BOOMR.utils.pluginConfig(impl, config, "CACHE_RELOAD", ["url"]);

		if(!impl.url)
			return this;

		// we use document and not BOOMR.window.document since
		// we can run inside the boomerang iframe if any
		var i=document.createElement('iframe');
		i.style.display="none";
		i.src=impl.url;
		document.body.appendChild(i);

		return this;
	},

	/**
     * @return {boolean}
     */
	is_complete: function() {
		// we always return true since this plugin never adds anything to the beacon
		return true;
	}
};
}());