function AuraInspectorPerformanceView(devtoolsPanel) {

	var perfPanel = null;
	var initialLoad = false;

	var labels = {
		"record": chrome.i18n.getMessage("menu_record"),
		"clear": chrome.i18n.getMessage("menu_clear"),
		"showcollected": chrome.i18n.getMessage("performance_menu_showcollected")
	};

	var markup = `
		<div class="aura-panel panel-status-bar">
			<button class="record-profile-status-bar-item status-bar-item" title="${labels.record}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>
			<button class="clear-status-bar-item status-bar-item" title="${labels.clear}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>
			<button class="timeline-frames-status-bar-item status-bar-item" title="${labels.showcollected}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>
			<div class="status-bar-item"></div>
		</div>
		<div class="flamechart" id="flamechart"></div>`;

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
