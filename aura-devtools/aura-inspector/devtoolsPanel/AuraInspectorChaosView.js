/* Listens for actions and shows them in the actions tab */
function AuraInspectorChaosView(devtoolsPanel) {

    var labels = {
        "samplingIntervalInSecond": chrome.i18n.getMessage("chaosview_samplingInterval_in_second"),
        "dropActionByPercentage": chrome.i18n.getMessage("chaosview_drop_action_by_percentage"),
        "stopAllRuns": chrome.i18n.getMessage("chaosview_buton_stop_all_runs"),
        "newChaosRun": chrome.i18n.getMessage("chaosview_new_chaos_run"),
        "buttonStart": chrome.i18n.getMessage("chaosview_button_start"),
        "buttonStop": chrome.i18n.getMessage("chaosview_button_stop"),
        "buttonSave": chrome.i18n.getMessage("chaosview_button_save"),
        "buttonCancel": chrome.i18n.getMessage("chaosview_button_cancel"),
        "oldChaosRun": chrome.i18n.getMessage("chaosview_old_chaos_run"),
        "buttonReplay": chrome.i18n.getMessage("chaosview_button_replay"),
        "chaosRunResult": chrome.i18n.getMessage("chaosview_chaos_run_result"),


    };


    //search 'MAGIC WARNING' in this file
    var InTheMiddleOfAChaosRun = false;
    var _chaosCardList;

    var markup = `
<div class="chaosTab">
    <div class="chaosRunOptions">
        <section>
            <h1 class="">${labels.newChaosRun}</h1>
            <div class="p-around--x-small m-horizontal--x-small">
                <div>
                    <label class="label"> ${labels.samplingIntervalInSecond} </label>
                    <input id="samplingInterval" type="number" size="2" maxsize="2" placeholder="4" min="0"/>
                </div>
                <div>
                    <label class="label m-top--x-small"> ${labels.dropActionByPercentage} </label>
                    <input id="actionDropPercentage" type="number" size="2" maxsize="3" placeholder="0" min="0" max="100"/>
                </div>
                <div class="m-top--x-small">
                    <button id="startChaosRun" class="text-button">${labels.buttonStart}</button>
                    <button id="stopChaosRun" class="text-button hidden">${labels.buttonStop}</button>
                    <button id="saveChaosRun" class="text-button hidden">${labels.buttonSave}</button>
                </div>
                <div class="hidden label m-top--x-small" id="newrunStatus"></div>
            </div>
        </section>
        <section class="old_chaos_run">
            <h1 class="">${labels.oldChaosRun}</h1>
            <div class="p-around--x-small m-horizontal--x-small">
                <div>
                    <input type="file" id="chooseChaosRunFile" name="files[]"/>
                </div>
                <div class="m-top--x-small">
                    <button id="replayChaosRun" class="text-button hidden">${labels.buttonReplay}</button>
                    <button id="cancelTheLoadedChaosRun" class="text-button hidden">${labels.buttonCancel}</button>
                </div>
                <div class="hidden label m-top--x-small" id="replayingStatus"></div>
            </div>
        </section>
    </div>
	<section class="chaosRunResult dark">
		<h1 class="">${labels.chaosRunResult}
            <button id="stopAllChaosRun" class="button--brand"> ${labels.stopAllRuns} </button>
        </h1>
		<div id="chaosActionsList"></div>
	</section>
</div>
	`;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        _chaosCardList = tabBody.querySelector("#chaosActionsList");

        // Attach event handlers
        tabBody.querySelector("#startChaosRun").addEventListener("click", startChaosRun.bind(this));
        tabBody.querySelector("#stopChaosRun").addEventListener("click", stopChaosRun.bind(this));
        tabBody.querySelector("#saveChaosRun").addEventListener("click", saveChaosRun.bind(this));

        tabBody.querySelector("#replayChaosRun").addEventListener("click", replayChaosRun.bind(this));
        tabBody.querySelector("#cancelTheLoadedChaosRun").addEventListener("click", cancelTheLoadedChaosRun.bind(this));

        tabBody.querySelector("#stopAllChaosRun").addEventListener("click", stopAllChaosRun.bind(this));
        tabBody.querySelector('#chooseChaosRunFile').addEventListener('change', handleFileSelect.bind(this), false);


        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnPanelConnect", AuraInspectorChaosView_OnBootstrap.bind(this));
        
        devtoolsPanel.subscribe("AuraInspector:OnClickSomeElement", AuraInspectorChaosView_OnClickSomeElement.bind(this));
        
        devtoolsPanel.subscribe("AuraInspector:OnRecordActionDropForChaosRun", AuraInspectorChaosView_OnRecordActionDropForChaosRun.bind(this)); 
        devtoolsPanel.subscribe("AuraInspector:OnNewChaosRunNewStatus", AuraInspectorChaosView_OnNewChaosRunNewStatus.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnChaosRunSaved", AuraInspectorChaosView_OnChaosRunSaved.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnStopNewChaosRunWithError", stopChaosRun.bind(this));
        
        devtoolsPanel.subscribe("AuraInspector:OnChaosRunLoaded", AuraInspectorChaosView_OnChaosRunLoaded.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnReplayChaosRunNewStatus", AuraInspectorChaosView_OnReplayChaosRunNewStatus.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnReplayChaosRunFinished", AuraInspectorChaosView_OnReplayChaosRunFinished.bind(this));
        
        devtoolsPanel.subscribe("AuraInspector:OnCreateChaosCard", AuraInspectorChaosView_OnCreateChaosCard.bind(this));

    };

    this.render = function() {};

    this.refresh = function() {
        removeAllCards();
        document.querySelector("#stopChaosRun").classList.add("hidden");
        document.querySelector("#startChaosRun").classList.remove("hidden");
        document.querySelector("#saveChaosRun").classList.add("hidden");
        document.querySelector("#replayChaosRun").classList.add("hidden");
        document.querySelector("#stopAllChaosRun").classList.remove("hidden");
        document.querySelector("#newrunStatus").classList.add("hidden");
        document.querySelector("#replayingStatus").classList.add("hidden");
        console.log("chaosView.refresh");
    };

    /*
        event handler for "AuraInspector:OnReplayChaosRunNewStatus"
        status : {'message': string}
    */
    function AuraInspectorChaosView_OnReplayChaosRunNewStatus(status) {
        if (status && status.message) {
            var div_replayingStatus = document.querySelector("#replayingStatus");
            div_replayingStatus.classList.remove("hidden");
            div_replayingStatus.textContent = status.message;
        }
    }

    /*
        event handler for "AuraInspector:OnNewChaosRunNewStatus"
        status : {'message': string}
    */
    function AuraInspectorChaosView_OnNewChaosRunNewStatus(status) {
        if (status && status.message) {
            var div_replayingStatus = document.querySelector("#newrunStatus");
            div_replayingStatus.classList.remove("hidden");
            div_replayingStatus.textContent = status.message;
        }
    }

    function removeAllCards() {
        var cards = _chaosCardList.querySelectorAll("aurainspector-chaosCard");
        if (cards) {
            for (var c = 0, length = cards.length; c < length; c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
    }

    /*
        called by AuraInspectorInjectedScript.clickElement, when we finish clicking all elements,
        or has to stop because of some error
        runResult = {} or {'error': someErrorMessage}
    */
    function AuraInspectorChaosView_OnReplayChaosRunFinished(runResult) {
        InTheMiddleOfAChaosRun = false;

        var finishMessage = "Chaos run finished: ";
        if (runResult && runResult.error) {
            finishMessage = finishMessage + runResult.error;
        } else {
            finishMessage = finishMessage + "SUCCESS !"
        }

        //create a chaosCard to the end of the run
        var chaosCard = createChaosCard(finishMessage, "");
        _chaosCardList.appendChild(chaosCard);

        document.querySelector("#startChaosRun").classList.remove("hidden");
        document.querySelector("#stopChaosRun").classList.add("hidden");

        document.querySelector("#replayChaosRun").classList.remove("hidden");
    }

    /*
        event handler for AuraInspector:OnPanelConnect
    */
    function AuraInspectorChaosView_OnBootstrap() {

        console.log("chaosView.AuraInspectorChaosView_OnBootstrap, InTheMiddleOfAChaosRun?" + InTheMiddleOfAChaosRun);

        //MAGIC WARNING
        //this AuraInspectorChaosView_OnBootstrap will be called twice everytime we load or refresh
        //because AuraInspector:OnPanelConnect is published twice, hence the 'InTheMiddleOfAChaosRun' magic
        //once by AuraInspector_OnAuraInitialized, once by this.init in devtoolsPanel.js, not sure why yet
        if (InTheMiddleOfAChaosRun === true) {
            removeAllCards();
            devtoolsPanel.publish("AuraInspector:OnContinueChaosRun", {});
            InTheMiddleOfAChaosRun = false;

            document.querySelector("#stopChaosRun").classList.add("hidden");
            document.querySelector("#startChaosRun").classList.add("hidden");
            document.querySelector("#saveChaosRun").classList.add("hidden");

            document.querySelector("#replayChaosRun").classList.add("hidden");
            document.querySelector("#replayingStatus").classList.remove("hidden");
        } else {
            document.querySelector("#stopChaosRun").classList.add("hidden");
            document.querySelector("#startChaosRun").classList.remove("hidden");
            document.querySelector("#saveChaosRun").classList.add("hidden");

            document.querySelector("#replayChaosRun").classList.remove("hidden");
            document.querySelector("#replayingStatus").classList.add("hidden");
        }

        document.querySelector("#stopAllChaosRun").classList.remove("hidden");
    }


    /*
    	event handler for "AuraInspectorChaosView:OnChaosRunSaved"
    */
    function AuraInspectorChaosView_OnChaosRunSaved() {
        removeAllCards();
    }

    /*
        event handler for "AuraInspectorChaosView:OnChaosRunLoaded",
        called by AuraInspectorInjectedScript."AuraDevToolService.LoadChaosRun"
        data = {
            'currentChaosRunSteps': a list of
                {
                //if it's a click operation
                'textContent': string,
                'locator': undefined or
                    {
                        "id":"888:1;0",
                        "root":"tabItemAnchor",
                        "parent":"pathAssistant",
                        "selector":"AtabHeader",
                        "context":{"tab-name":"Id.DecisionMakers"}
                    },
                'cssPath': string like "body > button + button > span"
                //if it's an action drop operation
                'actionName': string like serviceComponent://ui.force.impl.aura.components.ownerChangeContent.OwnerChangeContentController/ACTION$getOwnerChangeLinkVisibility
                'actionOperation': string //"Drop",
                'actionId': string //why we care
                'actionParameter': string //"{..}"
                'actionIsStorable': boolean
                'actionStorageKey': string
                }
            'currentChaosRunTimeMachine': {
                'startUrl':string
                'localCache': TODO
            }
        }
    */
    function AuraInspectorChaosView_OnChaosRunLoaded(data) {
        //fill _chaosCardList with chaos run
        if (data.currentChaosRunTimeMachine) {
            //TODO
        }
        if (data.currentChaosRunSteps && data.currentChaosRunSteps.length) {
            console.log("Load chaos run: ", data);
            var chaosCard, selector;
            for (var idx in data.currentChaosRunSteps) {
                step = data.currentChaosRunSteps[idx];
                if (step.hasOwnProperty('cssPath')) {
                    chaosCard = createChaosCard(step.textContent, step.cssPath, step.locator);
                } else if (step.hasOwnProperty('actionName')) {
                    var aname = step.actionName;
                    if (aname.indexOf("ACTION$") >= 0) {
                        aname = aname.substr(aname.indexOf("ACTION$") + 7, aname.length - 1);
                    }
                    chaosCard = createChaosCard(step.actionOperation + " action: " + aname);
                }
                if (chaosCard) {
                    _chaosCardList.appendChild(chaosCard);
                } else {
                    console.error("Cannot load step " + idx + " of chaos run", ata.currentChaosRunSteps);
                }
            }
        }
    }

    /*
	    event handler for "AuraInspector:OnClickSomeElement"
	    data = {
                'textContent': string,
                "locator":undefined or {
                    "id":"888:1;0",
                    "root":"tabItemAnchor",
                    "parent":"pathAssistant",
                    "selector":"AtabHeader",
                    "context":{"tab-name":"Id.DecisionMakers"}
                }
	            'cssPath': string like "body > button + button > span"
	    }
    */
    function AuraInspectorChaosView_OnClickSomeElement(step) {
        var textContent = step.textContent;
        var cssPath = step.cssPath;
        var locator = step.locator;
        //highlight element we gonna click with a ...green circle

        //create a new chaosCard
        var chaosCard = createChaosCard(textContent, cssPath, locator);
        _chaosCardList.appendChild(chaosCard);
    }

    /*
        event handler for "AuraInspector:OnCreateChaosCard"
        msgObj: {"message": string}
    */
    function AuraInspectorChaosView_OnCreateChaosCard(msgObj) {
        var chaosCard = createChaosCard(msgObj.message, undefined);
        _chaosCardList.appendChild(chaosCard);

    }

    /*
        event handler for AuraInspector:OnRecordActionDropForChaosRun,
        called from "AuraDevToolService.RecordDroppedAction" in AuraInspectionInjectedScript
        {'id': string like "969;a", 'defName': string}
    */
    function AuraInspectorChaosView_OnRecordActionDropForChaosRun(action) {
        if (action && action.id && action.defName) {
            var aname = action.defName;
            if (aname.indexOf("ACTION$") >= 0) {
                aname = aname.substr(aname.indexOf("ACTION$") + 7, aname.length - 1);
            }
            //create a new chaosCard
            var chaosCard = createChaosCard("We just randomly drop action " + action.id + " " + aname, "", undefined);
            _chaosCardList.appendChild(chaosCard);
        }
    }

    //create a chaos card, only textContent is necessary. for click step, cssPath is a must, for action step, nah
    function createChaosCard(textContent, cssPath, locator) {
        var card = document.createElement("aurainspector-chaosCard");
        //card.id = "chaos_card_" + action.id;
        card.className = "card m-horizontal--x-small m-top--x-small p-around--x-small";
        card.setAttribute("textContent", textContent);
        if (cssPath) {
            card.setAttribute("cssPath", cssPath);
        }
        if (locator && locator.root && locator.parent) {
            card.setAttribute("locatorRoot", locator.root);
            card.setAttribute("locatorParent", locator.parent);
            card.setAttribute("locatorContext", locator.context);
        }
        //some element has no textContent, nor locator, let's print out cssPath in this case
        if (textContent.length === 0 && !locator) {
            card.setAttribute("textContent", cssPath);
        }
        return card;
    }

    function startChaosRun(event) {
        //hide Start button, display Stop button
        document.querySelector("#stopChaosRun").classList.remove("hidden");
        document.querySelector("#startChaosRun").classList.add("hidden");
        document.querySelector("#saveChaosRun").classList.add("hidden");
        document.querySelector("#newrunStatus").classList.remove("hidden");

        document.querySelector("#stopAllChaosRun").classList.remove("hidden");
        document.querySelector("#replayChaosRun").classList.add("hidden");
        document.querySelector("#replayingStatus").classList.add("hidden");

        //clear up all cards
        removeAllCards();

        // Collect run parameter
        var samplingInterval = document.querySelector("#samplingInterval").value; //4000;
        samplingInterval = samplingInterval * 1000;
        if (samplingInterval <= 0) {
            samplingInterval = 4000;
            var msg = "Invalid input: samplingInterval must be a number between bigger than 0, gonna use the default value:4000(ms) instead";
            console.warn(msg);
            document.querySelector("#newrunStatus").textContent = msg;
        }

        var actionDropPercentage = document.querySelector("#actionDropPercentage").value * 1; //5
        if (actionDropPercentage < 0 || actionDropPercentage >= 100) {
            var msg = "Invalid input: percentage to drop action must be a number between 0 and 100, gonna use the default value:5 instead";
            console.warn(msg);
            document.querySelector("#newrunStatus").textContent = msg;
            actionDropPercentage = 5;
        } else {
            document.querySelector("#newrunStatus").textContent =
                "New chaos run start with samplingInterval=" + samplingInterval + "(ms), actionDropPercentage=" + actionDropPercentage;
        }

        var dataToPublish = {
            'samplingInterval': samplingInterval, //in ms
            'actionDropPercentage': actionDropPercentage //0~100
        };
        //call AuraInspectorInjectedScript.StartChaosRun
        devtoolsPanel.publish("AuraInspector:OnStartChaosRun", dataToPublish);

    }

    /*
        this is also the event handler for "AuraInspector:OnStopNewChaosRunWithError"
    */
    function stopChaosRun(runResult) {
        //hide Stop button, display Start button
        document.querySelector("#startChaosRun").classList.remove("hidden");
        document.querySelector("#stopChaosRun").classList.add("hidden");
        document.querySelector("#saveChaosRun").classList.remove("hidden");

        //call AuraInspectorInjectedScript.StopChaosRun
        devtoolsPanel.publish("AuraInspector:OnStopChaosRun", {});

        //create a chaosCard to the end of the run
        var finishMessage = "New chaos run stopped: ";
        if (runResult && runResult.error) {
            finishMessage = finishMessage + runResult.error;
        } else {
            finishMessage = finishMessage + "SUCCESS !"
        }
        document.querySelector("#newrunStatus").textContent = finishMessage;
        var chaosCard = createChaosCard(finishMessage, "");
        _chaosCardList.appendChild(chaosCard);
    }

    //Panic button has been pushed ! We will stop all on-going runs, replay or not, clean up all chaosCards.
    function stopAllChaosRun(event) {
        //clear up all cards
        removeAllCards();

        document.querySelector("#startChaosRun").classList.remove("hidden");
        document.querySelector("#stopChaosRun").classList.add("hidden");
        document.querySelector("#saveChaosRun").classList.add("hidden");

        document.querySelector("#replayingStatus").classList.remove("hidden");
        document.querySelector("#replayingStatus").textContent = "Someone just pushed the Panic Button, replay stopped";

        //call AuraInspectorInjectedScript.StopAllChaosRun to stop all intervals, and clear up localStorage
        devtoolsPanel.publish("AuraInspector:OnStopAllChaosRun", {});
    }

    function saveChaosRun(event) {
        document.querySelector("#stopChaosRun").classList.add("hidden");
        document.querySelector("#startChaosRun").classList.remove("hidden");

        // Collect run parameter
        var samplingInterval = document.querySelector("#samplingInterval").value; //4000;
        if (!samplingInterval) {
            samplingInterval = 4; //default
        }
        var actionDropPercentage = document.querySelector("#actionDropPercentage").value; //5
        if (actionDropPercentage < 0 || actionDropPercentage >= 100) {
            actionDropPercentage = 5; //default
        }
        document.querySelector("#newrunStatus").classList.textContent =
            "Chaos run saved with samplingInterval=" + samplingInterval + "(ms), actionDropPercentage=" + actionDropPercentage;
        samplingInterval = samplingInterval * 1000;
        //call AuraInspectorInjectedScript.SaveChaosRun
        devtoolsPanel.publish("AuraInspector:OnSaveChaosRun", {
            'samplingInterval': samplingInterval,
            'actionDropPercentage': actionDropPercentage
        });
    }

    //event handler for clicking chooseChaosRunFile
    function handleFileSelect(evt) {
        var files = evt.target.files;
        var fileReader = new FileReader();
        fileReader.onload = function() {
            removeAllCards();
            var text = fileReader.result;
            //console.log(fileReader.result);

            //call AuraInspectorInjectedScript.LoadChaosRun
            devtoolsPanel.publish("AuraInspector:OnLoadChaosRun", {
                'chaosRunFromFile': fileReader.result
            });
        };
        fileReader.readAsText(files[0]);

        document.querySelector("#replayChaosRun").classList.remove("hidden");
        document.querySelector("#cancelTheLoadedChaosRun").classList.remove("hidden");

        document.querySelector("#stopAllChaosRun").classList.add("hidden");

        document.querySelector("#stopChaosRun").classList.add("hidden");
        document.querySelector("#startChaosRun").classList.add("hidden");
        document.querySelector("#saveChaosRun").classList.add("hidden");

    }

    function replayChaosRun(event) {
        //WARNING MAGIC !
        InTheMiddleOfAChaosRun = true;

        document.querySelector("#stopAllChaosRun").classList.remove("hidden");

        // Collect run parameter
        var samplingInterval = document.querySelector("#samplingInterval").value;
        samplingInterval = samplingInterval * 1000;
        if (!samplingInterval) {
            samplingInterval = 4000;
        }

        // Dispatch
        var dataToPublish = {
            'samplingInterval': samplingInterval //in ms
        };

        //call AuraInspectorInjectedScript.ReplayChaosRun
        devtoolsPanel.publish("AuraInspector:OnReplayChaosRun", dataToPublish);

        removeAllCards();
    }

    function cancelTheLoadedChaosRun() {
        document.querySelector("#replayChaosRun").classList.add("hidden");
        document.querySelector("#startChaosRun").classList.remove("hidden");

        removeAllCards();

        //call AuraInspectorInjectedScript.CancelTheLoadedChaosRun
        devtoolsPanel.publish("AuraInspector:OnCancelTheLoadedChaosRun", {});
    }

}
