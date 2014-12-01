/**
 *
 * Don't feel like implementing the google.settings stuff yet, so just faking it out. 
 */
(function(global){
	var _map = {};

	function cloneObject(obj) { 
		return JSON.parse(JSON.stringify(obj));
	}

	/* Because this is how Google DevTools Settings work */
	global.AuraInspectorOptions = {
		getAll: function(defaults, callback) {
			defaults = defaults || {};
			for(var key in defaults) {
				if(!_map.hasOwnProperty(key)){
					_map[key] = defaults[key];
				}
			}
			if(typeof callback === "function") {
				callback(cloneObject(_map));				
			}
		},

		set: function(key, value, callback) {
			_map[key] = value;
			if(typeof callback == "function") {
				callback(cloneObject(_map));
			}
		}
	};

})(this);