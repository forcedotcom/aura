/* Listens for events and shows them in the event log */
function AuraInspectorEventLog(devtoolsPanel) {
    var _filters = {
        all: false,
        eventName: "",
        application: true,
        component: true,
        handledOnly: false
    };
    var ol;
    var _events = [];
    var _eventsMap = new Map();
    var _actionsMap = new Map();
    var MAX_EVENTS = 100000; // We could store a LOT of events, so lets just set a high max.
    var _contextStack = [];
    var _currentContext = null;
    var _handled = new Map();

    var markup = `
        <menu type="toolbar">
            <li><aurainspector-onOffButton class="circle" data-filter="all" title="Toggle Recording"><span>Recording</span></aurainspector-onOffButton></li>
            <li><button id="clear-button" class="circle on" title="Clear"><span>X</span></button></li>
            <li><input id="filter-text" type="search" placeholder="Filter"/></li>
            <li><aurainspector-onOffButton class="on" data-filter="application" title="Show Application Events"><span>App Events</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="component" title="Show Component Events"><span>Cmp Events</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="" data-filter="handledOnly" title="Hide Unhandled Events"><span>Handled Only</span></aurainspector-onOffButton></li>
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
        if(_filters.handledOnly && hasHandledData(eventInfo)) { return false; }

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
        var eventId = getEventId(eventInfo);

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

        if(!eventInfo.handledBy) {
            var handleData = _handled.get(eventId);
            if(handleData) {
                card.setAttribute("handledBy", JSON.stringify(handleData));
                eventInfo.handledBy = handleData;
            }
        } else {
            card.setAttribute("handledBy", JSON.stringify(eventInfo.handledBy)); 
            card.setAttribute("handledByTree", JSON.stringify(eventInfo.handledByTree || "{}"));
        }

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
            var removed = _events.pop();
            _eventsMap.delete(getEventId(removed));            
        }
        _events.push(eventInfo);
        _eventsMap.set(getEventId(eventInfo), eventInfo);
    }

    function getHandledDataTree(contextId, previousId) {
        var tree = [];
        var currentHandlers = _handled.get(contextId) || [];
        var id;
        var data;
        var type;

        if(_actionsMap.has(contextId)) {
            tree.push({ "id": contextId, "data": _actionsMap.get(contextId), "type": "action", "parent": previousId });
        } else {
            data = _eventsMap.get(contextId);
            tree.push({ "id": contextId, "data":  { "id": data.id, "sourceId": data.sourceId, "name": data.name, "startTime": data.startTime } , "type": "event", "parent": previousId });
        }

        var handled;
        for(var c=0;c<currentHandlers.length;c++) {
            handled = currentHandlers[c];
            id = currentHandlers[c].id;            
            tree = tree.concat(getHandledDataTree(id, contextId));
        }
        return tree;
    }

    function hasHandledData(eventInfo) {
        if('handledBy' in eventInfo) { return !eventInfo.handledBy || eventInfo.handledBy.length !== 0; }

        var eventId = getEventId(eventInfo);
        var handleData = _handled.get(eventId);
        if(handleData) {
            return handleData.length > 0; 
        }
        return false;
    }

    function getEventId(eventInfo) {
        if('id' in eventInfo) { return eventInfo.id; }
        eventInfo.id = "event_" + eventInfo.startTime;
        return eventInfo.id;
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
        if(!_filters.all) {
            return;
        }

        var eventId = getEventId(eventInfo);

        _contextStack.push(eventId);
        _currentContext = eventId;
        _handled.set(_currentContext, []);
    }

    function AuraInspectorEventLog_OnEventEnd(eventInfo) {
        if(isAllowed(eventInfo)) {
            storeEvent(eventInfo);
            addCard(eventInfo);
        }

       if(!_currentContext) {
            return;
        }

        var startContextId = _contextStack.pop();
        if(!startContextId) { return; }
        if(_contextStack.length !== 0) {
            _currentContext = _contextStack[_contextStack.length-1];

            var stored = _handled.get(_currentContext);
            stored.push(eventInfo);
        } else {
            _currentContext = null;

            // Build Handled By Tree
            var tree = getHandledDataTree(startContextId);
            for(var c=0;c<tree.length;c++) {
                var eventElement = document.getElementById(tree[c].id);
                if(eventElement){
                    _eventsMap.get(tree[c].id).handledByTree = tree;
                    eventElement.setAttribute("handledByTree", JSON.stringify(tree));
                }    
            }
            _handled = new Map();
        }
    }

    function AuraInspectorEventLog_OnClientActionStart(actionInfo) {
        if(!_currentContext) {
            return;
        }

        var id = "action_" + actionInfo.actionId;

        _handled.set(id, []);

        _contextStack.push(id);
        _currentContext = id;
    }

    function AuraInspectorEventLog_OnClientActionEnd(actionInfo) {
        if(!_currentContext) {
            return;
        }

        _contextStack.pop();
        _currentContext = _contextStack[_contextStack.length-1];
        
        var data = { "id": "action_" + actionInfo.actionId, "scope": actionInfo.scope, "name": actionInfo.name, "actionId": actionInfo.actionId };

        var stored = _handled.get(_currentContext);
        stored.push(data);

        _actionsMap.set(data.id, data);
    }

    function ClearButton_OnClick(event) {
        // Clear the stored events?
        _events = [];
        _eventsMap = new Map();
        _actionsMap = new Map();
        _handled = new Map();
        _contextStack = [];
        _currentContext = null;

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
