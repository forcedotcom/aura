/* Listens for events and shows them in the event log */
function AuraInspectorEventLog(devtoolsPanel) {
    var ol;
    this.init = function() {
        ol = document.getElementById("event-log");

        // Start listening for events to draw
        devtoolsPanel.attach("onevent", DevToolsPanel_OnEvent.bind(this));
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

    function DevToolsPanel_OnEvent(event) {
        var message = event.data && event.data.message || event.data;
        if(message) {
            this.addLogItem(message);
        }
    }
}