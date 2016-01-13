/* Listens for actions and shows them in the actions tab */
function AuraInspectorActionsView(devtoolsPanel) {
    var _list;

    var _pending;
    var _running;
    var _completed;

    var _listDrop;

    var _toDrop;
    var _dropped;

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
            <li class="record-button"><aurainspector-onOffButton class="circle on" data-filter="all" title="Toggle recording"><span>Recording</span></aurainspector-onOffButton></li>
            <li><button id="clear-button" class="clear-status-bar-item status-bar-item" title="Clear"><div class="glyph"></div><div class="glyph shadow"></div></button></li>
            <li class="divider" style="margin-left: -3px;"></li>
            <li><input id="filter-text" type="search" placeholder="Filter"/></li>
            <li class="divider"></li>
            <li><aurainspector-onOffButton class="on" data-filter="storable" title="Show storable actions"><span>Storable</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="stored" title="Show storable actions served from cache"><span>Cached</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="background" title="Show background actions"><span>Background</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="success" title="Show actions that succeeded"><span>Success</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="incomplete" title="Show actions in incomplete state"><span>Incomplete</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="error" title="Show actions that errored"><span>Error</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="aborted" title="Show aborted actions"><span>Aborted</span></aurainspector-onOffButton></li>
        </menu>
        <div class="actions-tab">
            <div id="actionsToDrop-list" class="actionsToDrop-list">
                <section>
                    <h1>To Drop</h1>
                    <div id="actionsToDrop-pending" class="drop-zone">
                        <span class="description">Drag actions here. Next time we see the action, we won't send it to server.</span>
                    </div>
                </section>
                <section id="actionsToDrop-completed">
                    <h1>Dropped</h1>
                </section>
            </div>
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
        </div>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        _list = tabBody.querySelector("#actions-list");
        _pending = tabBody.querySelector("#actions-pending");
        _running = tabBody.querySelector("#actions-running");
        _completed = tabBody.querySelector("#actions-completed");

        _listDrop = tabBody.querySelector("#actionsToDrop-list");
        _toDrop = tabBody.querySelector("#actionsToDrop-pending");
        _dropped = tabBody.querySelector("#actionsToDrop-completed");

        // _listDrop.addEventListener("mouseover", displayTooltipMessage.bind(this, "Drag and Drop action from Action List below, next time we see the same action, we won't send it to server"));
        // _listDrop.addEventListener("mouseout", removeTooltipMessage.bind(this));

        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnActionEnqueue", AuraInspectorActionsView_OnActionEnqueue.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnActionStateChange", AuraInspectorActionsView_OnActionStateChange.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnPanelConnect", AuraInspectorActionsView_OnBootstrap.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnPanelAlreadyConnected", AuraInspectorActionsView_OnBootstrap.bind(this));

        // Attach event handlers
        var div_actionsToDrop = tabBody.querySelector("#actionsToDrop-list");
        if(div_actionsToDrop) {
            div_actionsToDrop.addEventListener("dragover", allowDrop.bind(this));
            div_actionsToDrop.addEventListener("dragleave", noDrop.bind(this));
            div_actionsToDrop.addEventListener("dragend", noDrop.bind(this));
            div_actionsToDrop.addEventListener("drop", drop.bind(this));
        } else {
            var command = "console.error('div_actionsToDrop cannot be found');";
            chrome.devtools.inspectedWindow.eval(command);
        }

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

        if(_listDrop) {
            devtoolsPanel.publish("AuraInspector:OnActionToDropClear", {});
        }

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
            card.setAttribute("storageKey", action.storageKey);
            if(action.stats) {
                card.setAttribute("stats", JSON.stringify(action.stats));
            }
            card.parentNode.removeChild(card);
        } else {
            card = createActionCard(action.id, false);
        }
        //remove from 'to drop' list
        if(action.idToDrop) {
            card = document.getElementById("action_card_" + action.idToDrop);
            card.parentNode.removeChild(card);
            //the action we just dropped is new action, we need to update the card with its id
            card.setAttribute("actionId", action.id);
        }

        switch(action.state) {
            case "RUNNING":
                _running.appendChild(card);
                break;
            case "NEW":
                _pending.appendChild(card);
                break;
            case "DROPPED":
                _dropped.appendChild(card);
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
        if(_listDrop) {
            var cards = _listDrop.querySelectorAll("aurainspector-actionCard");
            for(var c=0,length=cards.length;c<length;c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
    }

    function createActionCard(actionId, toDrop) {
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
            card.setAttribute("storageKey", action.storageKey);
            if(action.stats) {
                card.setAttribute("stats", JSON.stringify(action.stats));
            }
            if(toDrop === false) {
                //set draggable
                card.setAttribute("draggable","true");
                card.addEventListener("dragstart", drag.bind(this) );
                card.addEventListener("dragend", endDrag.bind(this) );
                //set double click
                //card.addEventListener('dblclick', doubleClick.bind(this));
            }
            //set drop
            if(toDrop === true) {
                card.setAttribute("toDrop", toDrop);
            }

        return card;
    }

    //display a tooltip message as the last child node of element
    function displayTooltipMessage (messageToDisplay, event) {
        var element = event.currentTarget;
        var elementTop = element.style.top;
        var elementLeft = element.style.left;
        var toolTipElement = document.createElement("span");
            toolTipElement.id = "toolTipElement";
            toolTipElement.className = "toolTipElement";
        var node = document.createTextNode(messageToDisplay);
        toolTipElement.appendChild(node);
        //toolTipElement.style.fontSize = "10px";
        element.appendChild(toolTipElement);
    }

    //remove the tooltip message (it should be the last child node of element)
    function removeTooltipMessage (event) {
        var element = event.currentTarget;
        if(element.childNodes[element.childNodes.length-1].id === "toolTipElement") {
            element.removeChild(element.childNodes[element.childNodes.length-1]);
        }
    }

    function allowDrop (event) {
        event.preventDefault();
        _toDrop.className = "drop-zone allow-drop";
    }

    function noDrop (event) {
        _toDrop.className = "drop-zone";
    }

    function endDrag (event) {
      event.target.classList.remove("dragging");
      if(event.dataTransfer.dropEffect == "none"){
        // event.target.style.opacity = "1";
      } else {
        event.target.classList.add("dropped");
        event.target.setAttribute("draggable","false");
        // event.target.style.opacity = "1";
      }
    }

    function drag (event) {
        // event.target.style.opacity = "0.5";
        event.target.classList.add("dragging");
        event.dataTransfer.setData("text", event.target.getAttribute("actionId").toString());
    }

    function doubleClick (event) {
        var actionCardElement = event.target;
        if(actionCardElement && actionCardElement.getAttribute("actionId")) {
            actionCardElement.style.opacity = "0.5";
            createActionCardInToDropDivAndNotifyOthers(actionCardElement.getAttribute("actionId"));
        } else {
            var command = "console.log('doubleClick.event.target or its actionId is missing');";
            chrome.devtools.inspectedWindow.eval(command);
        }

    }

    function createActionCardInToDropDivAndNotifyOthers(actionId) {
        var actionCard = createActionCard(actionId, true);
        if(!_toDrop) {
                var command = "console.log('_toDrop missing');";
                chrome.devtools.inspectedWindow.eval(command);
        }

        _toDrop.appendChild(actionCard);
            //install override

        var actionName = actionCard.getAttribute("name");
        var actionParameter = actionCard.getAttribute("parameters");
        var actionStorageKey = actionCard.getAttribute("storageKey");

        var dataToPublish = { 'actionName': actionName, 'actionParameter':actionParameter, 'actionId': actionId,
                            'actionStorageKey': actionStorageKey};
        devtoolsPanel.publish("AuraInspector:OnActionToDropEnqueue", dataToPublish);
    }

    function drop (event) {
        event.preventDefault();
        noDrop(event);
        if(event && event.dataTransfer) {
            var data = event.dataTransfer.getData("text");

            if(!data) {
                var command = "console.log('dataTransfer.getData.text is missing');";
                chrome.devtools.inspectedWindow.eval(command);
            } else {
                createActionCardInToDropDivAndNotifyOthers(data, devtoolsPanel);
            }

        }
    }

}
