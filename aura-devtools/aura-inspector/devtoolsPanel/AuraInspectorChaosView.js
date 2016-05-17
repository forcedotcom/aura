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
        "oldChaosRun": chrome.i18n.getMessage("chaosview_old_chaos_run"),
        "buttonReplay": chrome.i18n.getMessage("chaosview_button_replay"),
        "chaosRunResult": chrome.i18n.getMessage("chaosview_chaos_run_result"),

        
    };


    //search 'MAGIC WARNING' in this file
    var InTheMiddleOfAChaosRun = false;
	var _chaosCardList;
    
	var markup = `
		<div class="chaos_tab">
			<div class="chaos_run_options">
				<span class="description">Chaos Run Options</span>
				<menu type="toolbar">
                    <li>
                        <label class="description"> ${labels.samplingIntervalInSecond} </label>
		            	<input id="samplingInterval" type="number" size="2" maxsize="2" placeholder="4"/>
		            </li>
                    <li class="divider"></li>
                    <li>
                         <label class="description"> ${labels.dropActionByPercentage} </label>
                         <input id="actionDropPercentage" type="number" size="2" maxsize="3" placeholder="0"/>
                    </li>
                    <li class="divider"></li>
                    <button id="stop_all_chaos_run" class="stop_all_chaos_run text-button"> ${labels.stopAllRuns} </button>
	        	</menu>
                <div class="new_chaos_run">
                    <span class="description">${labels.newChaosRun}</span>
    	        	<button id="start_chaos_run" class="start_chaos_run text-button">${labels.buttonStart}</button>
    			    <button id="stop_chaos_run" class="stop_chaos_run text-button hidden">${labels.buttonStop}</button>
                    <button id="save_chaos_run" class="save_chaos_run text-button hidden">${labels.buttonSave}</button>
                    <div class="newrun_status hidden" id="newrun_status">
                    </div>
                </div>
                <div class="old_chaos_run">
                    <span class="description">${labels.oldChaosRun}</span>
                    <div class="load_chaos_run_from_file">
                        <input type="file" id="choose_chaos_run_file" name="files[]"/>
                    </div>
                    <button id="replay_chaos_run" class="replay_chaos_run text-button hidden">${labels.buttonReplay}</button>
                    <div class="replaying_status hidden" id="replaying_status">
                    </div>
                </div>
	        </div>
			<div class="chaos_run_result">
				<span class="description">${labels.chaosRunResult}</span>
				<section id="chaos_actions_list">
	            </section>
			</div>
		</div>
	`;

	this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        _chaosCardList = tabBody.querySelector("#chaos_actions_list");

        // Attach event handlers
        tabBody.querySelector("#start_chaos_run").addEventListener("click", startChaosRun.bind(this));
        tabBody.querySelector("#stop_chaos_run").addEventListener("click", stopChaosRun.bind(this));
        tabBody.querySelector("#save_chaos_run").addEventListener("click", saveChaosRun.bind(this));
        
        tabBody.querySelector("#replay_chaos_run").addEventListener("click", replayChaosRun.bind(this));
        tabBody.querySelector("#stop_all_chaos_run").addEventListener("click", stopAllChaosRun.bind(this));
        tabBody.querySelector('#choose_chaos_run_file').addEventListener('change', handleFileSelect.bind(this), false);


        // Start listening for events to draw
        devtoolsPanel.subscribe("AuraInspector:OnPanelConnect", AuraInspectorChaosView_OnBootstrap.bind(this));    
        devtoolsPanel.subscribe("AuraInspector:OnReplayChaosRunFinished", AuraInspectorChaosView_OnReplayChaosRunFinished.bind(this));   
        devtoolsPanel.subscribe("AuraInspector:OnClickSomeElement", AuraInspectorChaosView_OnClickSomeElement.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnRecordActionDropForChaosRun", AuraInspectorChaosView_OnRecordActionDropForChaosRun.bind(this));
		devtoolsPanel.subscribe("AuraInspector:OnChaosRunSaved", AuraInspectorChaosView_OnChaosRunSaved.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnChaosRunLoaded", AuraInspectorChaosView_OnChaosRunLoaded.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnStopNewChaosRunWithError", stopChaosRun.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnReplayChaosRunNewStatus", AuraInspectorChaosView_OnReplayChaosRunNewStatus.bind(this));
        devtoolsPanel.subscribe("AuraInspector:OnCreateChaosCard", AuraInspectorChaosView_OnCreateChaosCard.bind(this));
        
       
    };

    this.render = function() {
    };

    this.refresh = function() {
        removeAllCards();
        document.querySelector("#stop_chaos_run").classList.add("hidden"); 
        document.querySelector("#start_chaos_run").classList.remove("hidden");  
        document.querySelector("#save_chaos_run").classList.add("hidden");  
        document.querySelector("#replay_chaos_run").classList.add("hidden");  
        document.querySelector("#stop_all_chaos_run").classList.remove("hidden"); 
        document.querySelector("#replaying_status").classList.add("hidden");
        console.log("chaosView.refresh");
    };

    /*
        event handler for "AuraInspector:OnReplayChaosRunNewStatus"
        status : {'message': string}
    */
    function AuraInspectorChaosView_OnReplayChaosRunNewStatus(status) {
        if(status && status.message) {
            var div_replaying_status = document.querySelector("#replaying_status");
            div_replaying_status.classList.remove("hidden");
            div_replaying_status.textContent = status.message;
        }
    }

    function removeAllCards() {
        var cards = _chaosCardList.querySelectorAll("aurainspector-chaosCard");
        if(cards) {
            for(var c=0,length=cards.length;c<length;c++) {
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

        var finishMessage = "Chaos Run Finished with ";
        if(runResult && runResult.error) {
            finishMessage = finishMessage + runResult.error;
        } else {
            finishMessage = finishMessage + "SUCCESS !"
        }

        //create a chaosCard to the end of the run
        var chaosCard = createChaosCard(finishMessage, "");
        _chaosCardList.appendChild(chaosCard);

        document.querySelector("#start_chaos_run").classList.remove("hidden");
        document.querySelector("#stop_chaos_run").classList.add("hidden");

        document.querySelector("#replay_chaos_run").classList.remove("hidden");
    }

    /*
        event handler for AuraInspector:OnPanelConnect
    */
    function AuraInspectorChaosView_OnBootstrap() {

            console.log("chaosView.AuraInspectorChaosView_OnBootstrap, InTheMiddleOfAChaosRun?"+InTheMiddleOfAChaosRun);
            
            //MAGIC WARNING
            //this AuraInspectorChaosView_OnBootstrap will be called twice everytime we load or refresh
            //because AuraInspector:OnPanelConnect is published twice, hence the 'InTheMiddleOfAChaosRun' magic
            //once by AuraInspector_OnAuraInitialized, once by this.init in devtoolsPanel.js, not sure why yet
            if(InTheMiddleOfAChaosRun === true)
            {
                removeAllCards();
                devtoolsPanel.publish("AuraInspector:OnContinueChaosRun", {});
                InTheMiddleOfAChaosRun = false;

                document.querySelector("#stop_chaos_run").classList.add("hidden"); 
                document.querySelector("#start_chaos_run").classList.add("hidden");  
                document.querySelector("#save_chaos_run").classList.add("hidden");  
                
                document.querySelector("#replay_chaos_run").classList.add("hidden");
                document.querySelector("#replaying_status").classList.remove("hidden"); 
            } else {
                document.querySelector("#stop_chaos_run").classList.add("hidden"); 
                document.querySelector("#start_chaos_run").classList.remove("hidden");  
                document.querySelector("#save_chaos_run").classList.add("hidden");  
                
                document.querySelector("#replay_chaos_run").classList.remove("hidden");
                document.querySelector("#replaying_status").classList.add("hidden");
            }

            document.querySelector("#stop_all_chaos_run").classList.remove("hidden"); 
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
        if(data.currentChaosRunTimeMachine) {
            //TODO
        }
        if(data.currentChaosRunSteps && data.currentChaosRunSteps.length) {
            console.log("load chaos run:", data);
            var chaosCard, selector;
            for(var idx in data.currentChaosRunSteps) {
                step = data.currentChaosRunSteps[idx];
                if(step.hasOwnProperty('cssPath')) {
                    chaosCard = createChaosCard(step.textContent, step.cssPath, step.locator);
                } else if (step.hasOwnProperty('actionName')) {
                    var aname = step.actionName;
                    if(aname.indexOf("ACTION$") >= 0) {
                        aname = aname.substr(aname.indexOf("ACTION$")+7, aname.length-1);
                    }
                    chaosCard = createChaosCard(step.actionOperation+" action:"+aname);
                }    
                if(chaosCard) {
                    _chaosCardList.appendChild(chaosCard);
                } else {
                    console.error("cannot load step#"+idx+" of chaos run", ata.currentChaosRunSteps);
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
        if(action && action.id && action.defName) {
            var aname = action.defName;
            if(aname.indexOf("ACTION$") >= 0) {
                aname = aname.substr(aname.indexOf("ACTION$")+7, aname.length-1);
            }
            //create a new chaosCard
            var chaosCard = createChaosCard("We just randomly drop action# "+action.id+" "+aname, "", undefined);
            _chaosCardList.appendChild(chaosCard);
        }       
    }

    //create a chaos card, only textContent is necessary. for click step, cssPath is a must, for action step, nah
    function createChaosCard(textContent, cssPath, locator) {
    	var card = document.createElement("aurainspector-chaosCard");
        //card.id = "chaos_card_" + action.id;
        card.className = "chaos_card";
        card.setAttribute("textContent", textContent);
        if(cssPath) { 
            card.setAttribute("cssPath", cssPath);
        }
        if(locator && locator.root && locator.parent) {
            card.setAttribute("locatorRoot", locator.root);
            card.setAttribute("locatorParent", locator.parent);
            card.setAttribute("locatorContext", locator.context);
        }
        //some element has no textContent, nor locator, let's print out cssPath in this case
        if(textContent.length === 0 && !locator){
            card.setAttribute("textContent", cssPath);
        }
        return card;
    }

    function startChaosRun(event) {
    	//hide Start button, display Stop button
        document.querySelector("#stop_chaos_run").classList.remove("hidden"); 
        document.querySelector("#start_chaos_run").classList.add("hidden");  
        document.querySelector("#save_chaos_run").classList.add("hidden");
        document.querySelector("#newrun_status").classList.remove("hidden");

        document.querySelector("#stop_all_chaos_run").classList.remove("hidden");
        document.querySelector("#replay_chaos_run").classList.add("hidden");    
        document.querySelector("#replaying_status").classList.add("hidden");

        //clear up all cards
        removeAllCards();       

    	// Collect run parameter
    	var samplingInterval = document.querySelector("#samplingInterval").value;//4000;
        samplingInterval = samplingInterval * 1000;
        if(samplingInterval<=0) {
            samplingInterval = 4000;
            var msg = "invalid input: samplingInterval must be a number between bigger than 0, gonna use the default value:4000(ms) instead";
            console.warn(msg);
            document.querySelector("#newrun_status").textContent = msg;
        }
        
        var actionDropPercentage = document.querySelector("#actionDropPercentage").value * 1;//5
        if(actionDropPercentage<0 || actionDropPercentage>=100) {
            var msg = "invalid input: percentage to drop action must be a number between 0 and 100, gonna use the default value:5 instead";
            console.warn(msg);
            document.querySelector("#newrun_status").textContent = msg;
            actionDropPercentage = 5;
        } else {
            document.querySelector("#newrun_status").textContent = 
            "New Chaos Run start with samplingInterval="+samplingInterval+"(ms), actionDropPercentage="+actionDropPercentage;
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
        document.querySelector("#start_chaos_run").classList.remove("hidden"); 
        document.querySelector("#stop_chaos_run").classList.add("hidden"); 
        document.querySelector("#save_chaos_run").classList.remove("hidden");  

    	//call AuraInspectorInjectedScript.StopChaosRun
        devtoolsPanel.publish("AuraInspector:OnStopChaosRun", {});

        //create a chaosCard to the end of the run
        var finishMessage = "New Chaos Run Stopped with ";
        if(runResult && runResult.error) {
            finishMessage = finishMessage + runResult.error;
        } else {
            finishMessage = finishMessage + "SUCCESS !"
        }
        document.querySelector("#newrun_status").textContent = finishMessage;
        var chaosCard = createChaosCard(finishMessage, "");
        _chaosCardList.appendChild(chaosCard);
    }

    //Panic button has been pushed ! We will stop all on-going runs, replay or not, clean up all chaosCards. 
    function stopAllChaosRun(event) {
        //clear up all cards
        removeAllCards();

        //if(InTheMiddleOfAChaosRun === true) {
        //    InTheMiddleOfAChaosRun = false;
            document.querySelector("#replaying_status").textContent = "Someone just push the Panic Button, replay has been stopped";
        //}

        //call AuraInspectorInjectedScript.StopAllChaosRun to stop all intervals, and clear up localStorage
        devtoolsPanel.publish("AuraInspector:OnStopAllChaosRun", {});
    }

    function saveChaosRun(event) {
        document.querySelector("#stop_chaos_run").classList.add("hidden"); 
        document.querySelector("#start_chaos_run").classList.remove("hidden"); 

        // Collect run parameter
        var samplingInterval = document.querySelector("#samplingInterval").value;//4000;
        if(!samplingInterval) {
            samplingInterval = 4;//default
        }
        var actionDropPercentage = document.querySelector("#actionDropPercentage").value;//5
        if(actionDropPercentage<0 || actionDropPercentage>=100) {
            actionDropPercentage = 5;//default
        }
        document.querySelector("#newrun_status").classList.textContent = 
        "chaos run saved with samplingInterval="+samplingInterval+"(ms), actionDropPercentage="+actionDropPercentage;
        samplingInterval = samplingInterval * 1000;
        //call AuraInspectorInjectedScript.SaveChaosRun
        devtoolsPanel.publish("AuraInspector:OnSaveChaosRun", {'samplingInterval': samplingInterval, 'actionDropPercentage':actionDropPercentage});
    }

    //event handler for clicking choose_chaos_run_file
    function handleFileSelect(evt) {
        var files = evt.target.files; 
        var fileReader = new FileReader();
        fileReader.onload = function(){
          removeAllCards();
          var text = fileReader.result;
          //console.log(fileReader.result);

          //call AuraInspectorInjectedScript.LoadChaosRun
          devtoolsPanel.publish("AuraInspector:OnLoadChaosRun", {'chaosRunFromFile': fileReader.result});
        };
        fileReader.readAsText(files[0]);

        document.querySelector("#replay_chaos_run").classList.remove("hidden");  

        document.querySelector("#stop_all_chaos_run").classList.add("hidden");

        document.querySelector("#stop_chaos_run").classList.add("hidden"); 
        document.querySelector("#start_chaos_run").classList.add("hidden");  
        document.querySelector("#save_chaos_run").classList.add("hidden");   
        
    }

    function replayChaosRun(event) {
        //WARNING MAGIC !
        InTheMiddleOfAChaosRun = true;

        // Collect run parameter
        var samplingInterval = document.querySelector("#samplingInterval").value;
        samplingInterval = samplingInterval * 1000;
        if(!samplingInterval) {
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

}