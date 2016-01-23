/* Listens for actions and shows them in the actions tab */
function AuraInspectorActionsView(devtoolsPanel) {
    var _list;

    var _pending;
    var _running;
    var _completed;

    var _watchList;

    var _toWatch;
    var _processed;

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
            <div id="actionsToWatch-list" class="actionsToWatch-list">
                <section>
                    <h1>Pending Overrides</h1>
                    <div id="actionsToWatch-pending" class="drop-zone">
                        <span class="description">Drag actions here. Next time we see the action, we will not send it to server.</span>
                    </div>
                </section>
                <section id="actionsToWatch-completed">
                    <h1>Processed Overrides</h1>
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

        _watchList = tabBody.querySelector("#actionsToWatch-list");
        _toWatch = tabBody.querySelector("#actionsToWatch-pending");
        _processed = tabBody.querySelector("#actionsToWatch-completed");

        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnActionEnqueue", AuraInspectorActionsView_OnActionEnqueue.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnActionStateChange", AuraInspectorActionsView_OnActionStateChange.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnPanelConnect", AuraInspectorActionsView_OnBootstrap.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnPanelAlreadyConnected", AuraInspectorActionsView_OnBootstrap.bind(this));

        devtoolsPanel.subscribe("AuraInspector:EnqueueNextResponseForAction", AuraInspectorActionsView_OnEnqueueNextResponseForAction.bind(this));
        devtoolsPanel.subscribe("AuraInspector:EnqueueNextErrorForAction", AuraInspectorActionsView_OnEnqueueNextErrorForAction.bind(this));


        // Attach event handlers
        var div_actionsToWatch = tabBody.querySelector("#actionsToWatch-list");
        if(div_actionsToWatch) {
            div_actionsToWatch.addEventListener("dragover", allowDrop.bind(this));
            div_actionsToWatch.addEventListener("dragleave", noDrop.bind(this));
            div_actionsToWatch.addEventListener("dragend", noDrop.bind(this));
            div_actionsToWatch.addEventListener("drop", drop.bind(this));
        } else {
            var command = "console.error('div_actionsToWatch cannot be found');";
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
        if(_watchList) {
            devtoolsPanel.publish("AuraInspector:OnActiontoWatchClear", {});
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
        //we successfully modify the response, now remove the action card from Watch List to Processed
        if(data && data.state && data.state === "RESPONSEMODIFIED") {
            upsertCard(data);
        } else {
            if(!actions.has(data.id)) {
                return;
            }

            var action = actions.get(data.id);
            Object.assign(action, data);

            upsertCard(action);
        }

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
        var card;
        if(action.idtoWatch) { //card on the right side: move from Watch List
            card = document.getElementById("action_card_" + action.idtoWatch);
            card.parentNode.removeChild(card);
            //the action we just dropped/modified is a new action, let's update the card with new actionId
            //this only move the card from Watch List to Processed
            //at the point we don't have the result/parameter now as the action hasn'ts come back from server yet.
            //if we would like to update that, would need to delay this logic
            card.setAttribute("actionId", action.id);
            card.setAttribute("returnError", action.error);
            //also want to hide choice to drop/modify action
            card.setAttribute("toWatch", "false");
        } else { //card on the left side
            if(!isAllowed(action)) {
                return;
            }
            card = document.getElementById("action_card_" + action.id);
            if(card) {
                card.setAttribute("state", action.state);
                card.setAttribute("returnValue", action.returnValue);
                card.setAttribute("fromStorage", action.fromStorage);
                card.setAttribute("storageKey", action.storageKey);
                card.setAttribute("returnError", action.error);
                if(action.stats) {
                    card.setAttribute("stats", JSON.stringify(action.stats));
                }
                card.parentNode.removeChild(card);
            } else {
                card = createActionCard(action.id, false);
            }
        }

        switch(action.state) {
            case "RUNNING":
                _running.appendChild(card);
                break;
            case "NEW":
                _pending.appendChild(card);
                break;
            case "DROPPED":
                _processed.appendChild(card);
                break;
            case "RESPONSEMODIFIED":
                _processed.appendChild(card);
                break;
            case "ERROR":
                _completed.insertBefore(card, _completed.querySelector(".action-card"));
                break;
            default://"SUCCESS"
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
        if(_watchList) {
            var cards = _watchList.querySelectorAll("aurainspector-actionCard");
            for(var c=0,length=cards.length;c<length;c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
    }

    function createActionCard(actionId, toWatch) {
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
            card.setAttribute("dropOrModify", "dropAction");
            if(action.stats) {
                card.setAttribute("stats", JSON.stringify(action.stats));
            }
            //if card is on the right side, it's not draggable, we need to remember that in the actionCard itself.
            if(toWatch === true) {
                card.setAttribute("toWatch", true);
            } else {
                //we allow people to drag the card only when the card is on the left side
                card.setAttribute("draggable","true");
                card.addEventListener("dragstart", drag.bind(this) );
                card.addEventListener("dragend", endDrag.bind(this) );
                card.setAttribute("toWatch", false);
            }

        return card;
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
        _toWatch.className = "drop-zone allow-drop";
    }

    function noDrop (event) {
        _toWatch.className = "drop-zone";
    }

    function endDrag (event) {
      event.target.classList.remove("dragging");
      if(event.dataTransfer.dropEffect == "none"){
      } else {
        event.target.classList.add("dropped");
        event.target.setAttribute("draggable","false");
      }
    }

    function drag (event) {
        event.target.classList.add("dragging");
        event.dataTransfer.setData("text", event.target.getAttribute("actionId").toString());
    }

    //create a new action card with actionId
    //actionId : "123;a" , required
    function createActionCardIntoWatchDiv(actionId) {
        var actionCard = createActionCard(actionId, true);
        if(!_toWatch) {
                var command = "console.log('_toWatch missing');";
                chrome.devtools.inspectedWindow.eval(command);
        }
        _toWatch.appendChild(actionCard);        
    }

    //handler for AuraInspector:EnqueueNextResponseForAction from acitonCard.saveNextResponse
    //actionInfo = JSON.stringify ... { 
                            //'actionName': string, 
                            //'actionParameter': obj
                            //'actionId': string, like "713;a"
                            //'nextResponse': { key: newValue }
                            //'nextError' : { "message":bla, "stack":bla } 
                            //}};
    //then call AuraInspectorInjectedScript.AddActionToWatch
    function AuraInspectorActionsView_OnEnqueueNextResponseForAction(actionInfo) {
        console.log("AuraInspectorActionsView_OnEnqueueNextResponseForAction:", actionInfo);
        var actionInfoObj = JSON.parse(actionInfo);
        if( actionInfoObj && actionInfoObj.actionId && actionInfoObj.nextResponse ) {
            var action = actions.get(actionInfoObj.actionId);
            //fill in action info from original action
            actionInfoObj.actionIsStorable = action.storable;
            actionInfoObj.actionStorageKey = action.storageKey;
            //call AuraInspectorInjectedScript.AddActionToWatch
            devtoolsPanel.publish("AuraInspector:OnActionToWatchEnqueue", actionInfoObj);
        }        
    }

    function AuraInspectorActionsView_OnEnqueueNextErrorForAction(actionInfo) {
        console.log("AuraInspectorActionsView_OnEnqueueNextErrorForAction:", actionInfo);
        var actionInfoObj = JSON.parse(actionInfo);
        if(actionInfoObj && actionInfoObj.actionId && actionInfoObj.nextError) {
            var action = actions.get(actionInfoObj.actionId);
            //call AuraInspectorInjectedScript.AddActionToWatch
            devtoolsPanel.publish("AuraInspector:OnActionToWatchEnqueue", actionInfoObj);
        }  
    }

    function drop (event) {
        event.preventDefault();
        noDrop(event);
        if(event && event.dataTransfer) {
            var data = event.dataTransfer.getData("text");//data is actionId : "123;a"
            if(!data) {
                var command = "console.log('dataTransfer.getData.text is missing');";
                chrome.devtools.inspectedWindow.eval(command);
            } else {
                createActionCardIntoWatchDiv(data);
                var action = actions.get(data);
                var dataToPublish = {
                            'actionName': action.defName, //no need
                            'actionParameter':action.params, //no need for here...yet
                            'actionId': action.id, //713;a
                            'actionIsStorable': action.storable,
                            'actionStorageKey': action.storageKey,
                            'nextResponse': undefined //this has to be undefined
                };
                //call AuraInspectorInjectedScript.AddActionToWatch
                devtoolsPanel.publish("AuraInspector:OnActionToWatchEnqueue", dataToPublish);
            }

        }
    }

}
