/* Listens for events and shows them in the event log */
function AuraInspectorActionsView(devtoolsPanel) {
    var _list;
    var _pending;
    var _running;
    var _completed;
    var _listening;
    var _filtered = {
        all: false,
        storable: false,
        stored: false,
        success: false,
        incomplete: false,
        error: false,
        aborted: false,
        background: false,
        name: ""
    };

    var actions = new Map();

    var markup = `
        <menu type="toolbar">
            <li><aurainspector-onOffButton class="circle on" data-filter="all" title="Toggle Recording"><span>Recording</span></aurainspector-onOffButton></li>
            <li><button id="clear-button" class="circle on" title="Clear"><span>X</span></button></li>
            <li class="divider"></li>
            <li><input id="filter-text" type="search" placeholder="Filter"/></li>
            <li><aurainspector-onOffButton class="on" data-filter="storable" title="Show Storable"><span>Storable</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="stored" title="Hide from Storage"><span>From Storage</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="background" title="Show Background actions"><span>Background</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="success" title="Show actions of type Success"><span>Success</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="incomplete" title="Show actions of type Incomplete"><span>Incomplete</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="error" title="Show actions of type Error"><span>Error</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="aborted" title="Show actions of type Aborted"><span>Aborted</span></aurainspector-onOffButton></li>
        </menu>
        <div id="actions-list" class="actions-list">
            <section id="actions-pending">
                <h1>Pending</h1>
            </section>
            <section id="actions-running">
                <h1>Running</h1>
            </section>
            <section id="actions-completed">
                <h1>Completed</h1>
            </section>
        </div>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        _list = tabBody.querySelector("#actions-list");
        _pending = tabBody.querySelector("#actions-pending");
        _running = tabBody.querySelector("#actions-running");
        _completed = tabBody.querySelector("#actions-completed");

        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnActionEnqueue", AuraInspectorActionsView_OnActionEnqueue.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnActionStateChange", AuraInspectorActionsView_OnActionStateChange.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnBootstrap", AuraInspectorActionsView_OnBootstrap.bind(this));


        // Attach event handlers
        var menu = tabBody.querySelector("menu");
        menu.addEventListener("click", Menu_OnClick.bind(this));

        var clearButton = tabBody.querySelector("#clear-button");
        clearButton.addEventListener("click", ClearButton_OnClick.bind(this));

        var filterText = tabBody.querySelector("#filter-text");
        filterText.addEventListener("change", FilterText_OnChange.bind(this));
        filterText.addEventListener("keyup", FilterText_OnChange.bind(this));
    };

    this.render = function() {

    };

    this.refresh = function() {
        removeAllCards();

        actions.forEach(function(action){
            upsertCard(action);
        });
    };

    function AuraInspectorActionsView_OnBootstrap() {
        // refresh everything
        actions = new Map();

        removeAllCards();
    }

    function AuraInspectorActionsView_OnActionEnqueue(action) {
        // Store for later redrawing
        actions.set(action.id, action);

        upsertCard(action);
    }

    function AuraInspectorActionsView_OnActionStateChange(data) {        
        if(!actions.has(data.id)) {
            return;
        }

        var action = actions.get(data.id);
        Object.assign(action, data);

        upsertCard(action);
    }

    function ClearButton_OnClick(event) {
        actions = new Map();

        this.refresh();
    }

    function FilterText_OnChange(event) {
        var text = event.currentTarget;
        _filtered.name = text.value;

        this.refresh();
    }

    function Menu_OnClick(event) {
        var target = getParent(event.target, "aurainspector-onOffButton");

        if(target && target.hasAttribute("data-filter")) {
            var filter = target.getAttribute("data-filter");
            if(_filtered.hasOwnProperty(filter)) {
                _filtered[filter] = !target.classList.contains("on");
                if(filter !== "all") {
                    this.refresh();
                }
            }
        }
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

    function isAllowed(action) {
        if(_filtered.all) { return false; }
        if(_filtered.storable && action.storable) { return false; }
        if(_filtered.background && action.background) { return false; }
        if(_filtered.success && action.state === "SUCCESS") { return false; }
        if(_filtered.incomplete && action.state === "INCOMPLETE") { return false; }
        if(_filtered.error && action.state === "ERROR") { return false; }
        if(_filtered.aborted && action.state === "ABORTED") { return false; }
        if(_filtered.stored && action.fromStorage) { return false; }

        if(_filtered.name) {
            // Allows you to do !aura:// to get everything that doesn't match the pattern.
            var exclude = _filtered.name.indexOf("!") === 0;
            if(exclude) {
                var name = _filtered.name.substr(1);
                return !action.defName.includes(name);
            }
            return action.defName.includes(_filtered.name);
        }

        return true;
    }

    function upsertCard(action) {
        if(!isAllowed(action)) {
            return;
        }

        var card = document.getElementById("action_card_" + action.id);
        if(card) {
            card.setAttribute("state", action.state);
            card.setAttribute("returnValue", action.returnValue);
            card.setAttribute("fromStorage", action.fromStorage);
            card.parentNode.removeChild(card);
        } else {
            card = createActionCard(action.id);
        }

        switch(action.state) {
            case "RUNNING": 
                _running.appendChild(card); 
                break;
            case "NEW": 
                _pending.appendChild(card); 
                break;
            default: 
                _completed.insertBefore(card, _completed.querySelector(".action-card"));
                break;
        }
    }

    function removeAllCards() {
        if(_list) {
            var cards = _list.querySelectorAll("aurainspector-actionCard");
            for(var c=0,length=cards.length;c<length;c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
    }

    function createActionCard(actionId) {
        if(!actions.has(actionId)) {
            return;
        }

        var action = actions.get(actionId);
        var params = JSON.stringify(action.params);
        
        var card = document.createElement("aurainspector-actionCard");
            card.id = "action_card_" + action.id;
            card.className = "action-card action-card-state-" + action.state;
            card.setAttribute("actionId", action.id);
            card.setAttribute("name", action.defName);
            card.setAttribute("parameters", params);
            card.setAttribute("state", action.state);
            card.setAttribute("isStorable", action.storable);
            card.setAttribute("isRefresh", action.isRefresh);
            card.setAttribute("isAbortable", action.abortable);
            card.setAttribute("isBackground", action.background);
            card.setAttribute("returnValue", action.returnValue);
            card.setAttribute("isFromStorage", action.fromStorage);

        return card;
    }
}