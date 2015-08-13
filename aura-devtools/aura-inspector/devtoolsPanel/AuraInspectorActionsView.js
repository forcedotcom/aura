/* Listens for events and shows them in the event log */
function AuraInspectorActionsView(devtoolsPanel) {
    var _list;
    var _pending;
    var _running;
    var _completed;

    var actions = new Map();

    this.init = function(tabBody) {
        _list = document.createElement("div");
        _list.className = "actions-list";
        _list.id = "actions-list";
        tabBody.appendChild(_list);

        _pending = document.createElement("section");
        _pending.innerHTML = "<h1>Pending</h1>";
        _running = document.createElement("section");
        _running.innerHTML = "<h1>Running</h1>";
        _completed = document.createElement("section");
        _completed.innerHTML = "<h1>Completed</h1>";

        _list.appendChild(_pending);
        _list.appendChild(_running);
        _list.appendChild(_completed);


        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnActionEnqueue", AuraInspectorActionsView_OnActionEnqueue.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnActionStateChange", AuraInspectorActionsView_OnActionStateChange.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnBootstrap", AuraInspectorActionsView_OnBootstrap.bind(this));
    };

    this.render = function() {

    };

    function AuraInspectorActionsView_OnBootstrap() {
        // refresh everything
        actions = new Map();

        if(_list) {
            var cards = _list.querySelectorAll(".action-card");
            for(var c=0,length=cards.length;c<length;c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
    }

    function AuraInspectorActionsView_OnActionEnqueue(action) {
        // Store for later redrawing
        actions.set(action.id, action);

        renderActionCard(action.id, _pending);
    }

    function AuraInspectorActionsView_OnActionStateChange(data) {
        if(!actions.has(data.id)) {
            return;
        }

        var action = actions.get(data.id);
        Object.assign(action, data);

        var card = renderActionCard(action.id);
        var cardId = "action_card_" + action.id;

        // Card already should be in the dom, remove that 
        // and add the new one.
        var existingCard = document.getElementById(cardId);
        if(existingCard) {
            existingCard.parentNode.removeChild(existingCard);
        }

        if(action.state === "RUNNING") {
            _running.appendChild(card);
        } else {
            _completed.insertBefore(card, _completed.querySelector(".action-card"));
        }
    }

    function renderActionCard(actionId, destination) {
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

        if(destination) {
            return destination.appendChild(card);
        }

        return card;
    }
}