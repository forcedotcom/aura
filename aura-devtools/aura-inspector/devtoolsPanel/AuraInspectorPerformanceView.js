function AuraInspectorPerformanceView(devtoolsPanel) {

	var perfPanel = null;
	var initialLoad = false;

	var markup = [
		'<div class="aura-panel panel-status-bar">',
		'	<button class="record-profile-status-bar-item status-bar-item" title="Record">',
		'		<div class="glyph"></div><div class="glyph shadow"></div>',
		'	</button>',
		'	<button class="clear-status-bar-item status-bar-item" title="Clear">',
		'		<div class="glyph"></div><div class="glyph shadow"></div>',
		'	</button>',
		'	<button class="timeline-frames-status-bar-item status-bar-item" title="Show current collected">',
		'		<div class="glyph"></div><div class="glyph shadow"></div>',
		'	</button>',
		'	<div class="status-bar-item"></div>',
		'</div>',
		'<div class="flamechart" id="flamechart"></div>'
	].join("");

	this.init = function(tabBody) {
		tabBody.innerHTML = markup;
		tabBody.classList.add("perf-tab");
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
