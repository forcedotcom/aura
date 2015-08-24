/* Listens for events and shows them in the event log */
function AuraInspectorEventLog(devtoolsPanel) {
    var _filters = {
        all: true,
        eventName: "",
        application: true,
        component: true
    };
    var ol;
    var _events = [];
    var MAX_EVENTS = 100000; // We could store a LOT of events, so lets just set a high max.
    var _contextStack = [];
    var _currentContext = null;
    var _handled = new Map();

    var markup = `
        <menu type="toolbar">
            <li><aurainspector-onOffButton class="circle on" data-filter="all" title="Toggle Recording"><span>Recording</span></aurainspector-onOffButton></li>
            <li><button id="clear-button" class="circle on" title="Clear"><span>X</span></button></li>
            <li><input id="filter-text" type="search" placeholder="Filter"/></li>
            <li><aurainspector-onOffButton class="on" data-filter="application" title="Show Application Events"><span>App Events</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="component" title="Show Component Events"><span>Cmp Events</span></aurainspector-onOffButton></li>
        </menu>
        <ol class="event-log" id="event-log"></ol>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        ol = tabBody.querySelector("ol#event-log");

        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnEventStart", AuraInspectorEventLog_OnEventStart.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnEventEnd", AuraInspectorEventLog_OnEventEnd.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnClientActionStart", AuraInspectorEventLog_OnClientActionStart.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnClientActionEnd", AuraInspectorEventLog_OnClientActionEnd.bind(this));

        var clearButton = tabBody.querySelector("#clear-button");
        clearButton.addEventListener("click", ClearButton_OnClick.bind(this));

        var filterText = tabBody.querySelector("#filter-text");
        filterText.addEventListener("change", FilterText_OnChange.bind(this));
        filterText.addEventListener("keyup", FilterText_OnChange.bind(this));

        var menu = tabBody.querySelector("menu");
        menu.addEventListener("click", Menu_OnClick.bind(this));
    };

    this.refresh = function() {
        // remove all the events
        ol.removeChildren();

        var event;
        for(var c=0,length=_events.length;c<length;c++) {
            event = _events[c];
            if(isAllowed(event)) {
                addCard(event);
            }
        }
    };

    this.render = function() {
        devtoolsPanel.hideSidebar();
    };

    // Returns True if allowed, false if filtered out.
    function isAllowed(eventInfo) {
        if(!eventInfo) { return false; }
        if(!_filters.all) { return false; }
        if(!_filters.application && eventInfo.type === "APPLICATION") { return false; }
        if(!_filters.component && eventInfo.type === "COMPONENT") { return false; }

        var eventName = _filters.eventName;
        if(eventName) {
            if(eventName.startsWith("!")) {
                eventName = eventName.substr(1);
                return !eventInfo.name.includes(eventName);
            }
            return eventInfo.name.includes(eventName);
        }

        return true;
    }

    function addCard(eventInfo) {
        var eventId = "event_" + eventInfo.startTime;
        var handleData = _handled.get(eventId);

        var li = document.createElement("li");

        var expand = document.createElement("button");
        expand.textContent = "+";
        expand.addEventListener("click", ExpandButton_OnClick);

        var card = document.createElement("aurainspector-eventCard");
        card.setAttribute("name", eventInfo.name);
        card.setAttribute("sourceId", eventInfo.sourceId || "");
        card.setAttribute("duration", (eventInfo.endTime - eventInfo.startTime).toFixed(4));
        card.setAttribute("type", eventInfo.type);
        card.setAttribute("caller", eventInfo.caller);
        card.setAttribute("parameters", eventInfo.parameters);
        card.setAttribute("collapsed", "true");
        card.setAttribute("handledBy", JSON.stringify(handleData));
        card.id = eventId;

        li.appendChild(expand);
        li.appendChild(card);
        ol.insertBefore(li, ol.firstChild);

        if(ol.childNodes.length >= MAX_EVENTS) {
            ol.lastChild.remove();
        }

        return card;
    }

    function storeEvent(eventInfo) {
        if(_events.length > MAX_EVENTS) {
            _events.pop();
        }
        _events.push(eventInfo);
    }

    function getParent(element, selector) {
        if(!element) { return null; }
        if(!selector) { return element.parentNode; }
        var current = element;
        while(!current.matches(selector)) {
            current = current.parentNode;
            if(!current || !current.matches) {
                return null;
            }
        }
        return current;
    }

    function AuraInspectorEventLog_OnEventStart(eventInfo) {
        var eventId = eventInfo.eventId;

        _contextStack.push(eventId);
        _currentContext = eventId;
        _handled.set(_currentContext, []);
    }

    function AuraInspectorEventLog_OnEventEnd(eventInfo) {
        _contextStack.pop();
        if(_contextStack.length !== 0) {
            _currentContext = _contextStack[_contextStack.length-1];
        } else {
            _currentContext = null;
        }

        if(isAllowed(eventInfo)) {
            storeEvent(eventInfo);
            addCard(eventInfo);
        }

        if(_currentContext === null) {
            _handled = new Map();
        }
    }

    function AuraInspectorEventLog_OnClientActionStart(eventInfo) {
        if(!_currentContext) {
            return;
        }
        var actionId = eventInfo.actionId;

        _contextStack.push(actionId);
        _currentContext = actionId;
    }

    function AuraInspectorEventLog_OnClientActionEnd(eventInfo) {
        _contextStack.pop();
        _currentContext = _contextStack[_contextStack.length-1];
        
        var actionId = eventInfo.actionId;

        var stored = _handled.get(_currentContext);
        stored.push({ "scope": eventInfo.scope, "name": eventInfo.name, "actionId": actionId });
    }

    function ClearButton_OnClick(event) {
        // Clear the stored events?
        _events = [];
        
        ol.removeChildren();
    }

    function ExpandButton_OnClick(event) {
        var button = event.currentTarget;
        var card = button.nextSibling;

        if(button.textContent === "+") {
            button.textContent = "-";
            card.setAttribute("collapsed", "false");
        } else {
            button.textContent = "+";
            card.setAttribute("collapsed", "true");
        }
    }


    function FilterText_OnChange(event) {
        var text = event.currentTarget;
        _filters.eventName = text.value;

        this.refresh();
    }

    function Menu_OnClick(event) {
        var target = getParent(event.target, "aurainspector-onOffButton");

        if(target && target.hasAttribute("data-filter")) {
            var filter = target.getAttribute("data-filter");
            if(_filters.hasOwnProperty(filter)) {
                _filters[filter] = target.classList.contains("on");
                if(filter !== "all") {
                    this.refresh();
                }
            }
        }
    }
}