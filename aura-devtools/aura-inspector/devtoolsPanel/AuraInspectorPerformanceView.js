function AuraInspectorPerformanceView(devtoolsPanel) {

	var perfPanel = null;
	var initialLoad = false;

	this.init = function() {
		
	};

	this.render = function() {
		if(!initialLoad) {
			var command = '$A.PerfDevTools.getComponentCreationProfile()';
	        chrome.devtools.inspectedWindow.eval(command, function (payload, exception) {
	            perfPanel = new AuraPerfPanel(payload, "flamechart");
	        });
	        initialLoad = true;
		}
		devtoolsPanel.hideSidebar();
	};
}