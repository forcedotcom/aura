/* Listens for events and shows them in the event log */
function AuraInspectorEventLog(devtoolsPanel) {
    var ol;

    this.init = function(tabBody) {
        ol = document.createElement("ol");
        ol.className = "event-log";
        ol.id = "event-log";
        tabBody.appendChild(ol);

        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:ConsoleLog", AuraInspectorEventLog_OnConsoleLog.bind(this))
    };

    this.addLogItem = function(message) {
        if(!message) { return; }
        var date = new Date();

        // <span class="event-log-timestamp">{hour}:{minute}</span> {message}
        var span = document.createElement("span");
            span.className = "event-log-timestamp";
            //span.innerHTML = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            span.innerHTML = date.toLocaleTimeString({}, { hour12: false});

        var li = document.createElement("li");
            li.appendChild(span);
            li.appendChild(document.createTextNode(message));
        ol.insertBefore(li, ol.firstChild);
    };

    this.render = function() {
        devtoolsPanel.hideSidebar();
    };

    function AuraInspectorEventLog_OnConsoleLog(message) {
        this.addLogItem(message+"");
    }
}