//*** Used by Aura Inspector
// This is injected in the DOM directly via <script> injection
(function(global){
    var $Aura = {};

    //let's keep a map between actionID to action here, just like what AuraClientService is doing
    //when user wants to watch a action, let's add an entry here
    var actionsWatched = {};
    //a map between acitonName to action, if action.nextResponse exist, we override next response, if no, just drop the action
    var actionsToWatch = {};

    var $Symbol = Symbol.for("AuraDevTools");

    // Communicate directly with the aura inspector
    $Aura.Inspector = new AuraInspector();
    $Aura.Inspector.init();

    $Aura.chaos = new ChaosManager();

    // Attach to the global object so our integrations can access it, but
    // use a symbol so it doesn't create a global property.
    global[$Symbol] = $Aura;

    $Aura.actions = {

        /* event handlder for OnActionToRemoveFromWatchEnqueue, this will remove one action from watch list
        called by AuraInspectorActionsView_OnRemoveActionFromWatchList in AuraInspectorActionsView.js
        data = {
            'actionName': string
        }
        */
        "AuraDevToolService.RemoveActionFromWatch": function(data) {
            if(!data) {
                console.error("AuraDevToolService.RemoveActionFromWatch receive no data from publisher");
            }
            if(data.actionName && actionsToWatch[data.actionName]) {
                delete actionsToWatch[data.actionName];
            }
        },


        /*the event handler for AuraInspector:OnActionToWatchEnqueue
        called by AuraInspectorActionsView.drop and AuraInspectorActionsView_OnEnqueueNextResponseForAction
        data = {
                    'actionName': string,
                    'actionParameter':actionParameter, //no need for here...yet
                    'actionId': string, //action_card_713;a --> 713;a
                    'actionIsStorable': boolean,
                    'actionStorageKey': obj,
                    'nextResponse': obj, or undefined
                    'nextError': obj  {"message":String, "stack":String}, or undefined
                    'byChaosRun' boolean //true if we add action for replay chaos run
                    };
        */
        "AuraDevToolService.AddActionToWatch": function(data) {
            if(!data) {
                console.error("AuraDevToolService.AddActionToWatch receive no data from publisher");
            }
            //check if we already has the action in actionsToWatch, if so replace it with the new one
            var aleadyAdded = false;
            if(data.actionName && actionsToWatch[data.actionName]) {
                delete actionsToWatch[data.actionName];
                aleadyAdded = true;
            }
            //we only remove the response from storage when we first add this action
            if( aleadyAdded === false ) {
                //remove the stored response from action storage -- if there is any
                if(data.actionIsStorable && data.actionIsStorable === true) {
                    var actionsStorage = $A.storageService.getStorage("actions");
                    var actionStorageKey = data.actionStorageKey;//data.actionName+JSON.stringify(data.actionParameter);//
                    if(actionsStorage && actionStorageKey && actionStorageKey.length > 0) {
                        actionsStorage.get(actionStorageKey)
                        .then(
                            function() {
                                //console.log("find storage item for action:", data);
                                actionsStorage.remove(actionStorageKey)
                                .then(function () {
                                    //console.log("successfully remove storage for action:", data);
                                    //notify Storage View
                                    $Aura.Inspector.publish("AuraInspector:RemoveStorageData", {'storageKey': actionStorageKey});
                                });
                            },
                            function(e) {
                                console.warn("cannot find storage item for action:", data);
                            }
                        );
                    } else {
                        console.warn("actionStorageKey missing, or there is no actionsStorage(what?)", data);
                    }
                }
            }//end of aleadyAdded is false
            //if we already watching this action, this will replace the old one
            actionsToWatch[data.actionName] = data;

            //ask chaos view to create a chaos card
            if(data.byChaosRun) {
                var aname = data.actionName;
                if (aname.indexOf("ACTION$") >= 0) {//action could be long, make it more readable
                    aname = aname.substr(aname.indexOf("ACTION$") + 7, aname.length - 1);
                }
                $Aura.Inspector.publish("AuraInspector:OnCreateChaosCard",
                    {"message": "add action "+aname+" to watch list"} );
            }
        },


        /*
        handler for AuraInspector:OnActionToWatchClear, this will clear up all actions from watch list
        */
        "AuraDevToolService.RemoveActionsFromWatch": function() {
            actionsToWatch = {};
            $A.uninstallOverride("ClientService.send", OnSendAction);
            $A.installOverride("ClientService.send", OnSendAction);
            $A.uninstallOverride("ClientService.decode", onDecode);
        },

        "AuraDevToolService.HighlightElement": function(globalId) {
            // Ensure the classes are present that HighlightElement depends on.
            if(!$Aura.actions["AuraDevToolService.AddStyleRules"].addedStyleRules) {
                $Aura.actions["AuraDevToolService.AddStyleRules"](globalId);
                $Aura.actions["AuraDevToolService.AddStyleRules"].addedStyleRules = true;
            }

            var className = "auraDevToolServiceHighlight3";
            var previous = document.getElementsByClassName(className);
            for(var d=previous.length-1,current;d>=0;d--){
                current = previous[d];
                current.classList.remove(className);
                current.classList.remove("auraDevToolServiceHighlight4");
            }

            // Apply the classes to the elements
            if(globalId) {
                var cmp = $A.getCmp(globalId);
                if(cmp && cmp.isValid()) {
                    var elements = cmp.getElements();
                    // todo: add classes to elements
                    for(var c=0,length=elements.length;c<length;c++) {
                        if(elements[c].nodeType === 1){
                            elements[c].classList.add(className);
                        }
                    }
                }
            }
        },

        "AuraDevToolService.RemoveHighlightElement": function() {
            var removeClassName = "auraDevToolServiceHighlight3";
            var addClassName = "auraDevToolServiceHighlight4";
            var previous = document.getElementsByClassName(removeClassName);
            for(var d=previous.length-1;d>=0;d--){
                previous[d].classList.add(addClassName);
                //previous[d].classList.remove(removeClassName);
            }

        },

        "AuraDevToolService.AddStyleRules": function(globalId) {
            var styleRuleId = "AuraDevToolService.AddStyleRules";

            // Already added
            if(document.getElementById(styleRuleId)) { return; }

            var rules = `
                .auraDevToolServiceHighlight3:before{
                   position:absolute;
                   display:block;
                   width:100%;
                   height:100%;
                   z-index: 10000;
                   background-color:#006699;
                   opacity:.3;
                   content:' ';
                   border : 2px dashed white;
                }
                .auraDevToolServiceHighlight4.auraDevToolServiceHighlight3:before {
                   opacity: 0;
                   transition: opacity 2s;
                }
            `;

            var style = document.createElement("style");
                style.id = styleRuleId;
                style.textContent = rules;
                style.innerText = rules;

            var head = document.head;
                head.appendChild(style);


            document.body.addEventListener("transitionend", function removeClassHandler(event) {
                var removeClassName = "auraDevToolServiceHighlight3";
                var addClassName = "auraDevToolServiceHighlight4";
                var element = event.target;
                element.classList.remove(removeClassName);
                element.classList.remove(addClassName);
            });
        },
        /**
         * Is called after $A is loaded via aura_*.js, but before we run initAsync()
         */
        "AuraDevToolService.Bootstrap": function() {
            if (typeof $A !== "undefined" && $A.initAsync) {
                // Try catches for branches that don't have the overrides
                // This instrument is where we add the methods _$getRawValue$() and _$getSelfGlobalId$() to the
                // component prototype. This allowed us to move to outputing the component from injected code, vs code in the framework.
                // Would be nice to get rid of needing this.
                try {
                    $A.installOverride("outputComponent", function(){});
                } catch(e){}

                try {
                    // Counts how many times various things have happened.
                    bootstrapCounters();
                } catch(e){}

                try {
                    // Actions Tab
                    bootstrapActionsInstrumentation();
                 } catch(e){
                 }
                 try {
                    // Perf Tab
                    bootstrapPerfDevTools();
                 } catch(e){

                 }
                 try {
                    // Events Tab
                    bootstrapEventInstrumentation();
                } catch(e){}


                // Need a way to conditionally do this based on a user setting.
                $A.PerfDevTools.init();

                // Only do once, we wouldn't want to instrument twice, that would give us double listeners.
                this["AuraDevToolService.Bootstrap"] = function(){};
            } else {
                console.warn('Could not attach AuraDevTools Extension.');
            }
        }
    };//end of $Aura.actions

    /****************************************************************
    ****************** Chaos Functions Starts **********************
    ****************************************************************/

    function ChaosManager(config) {
        //Keep a list of element class we know gonna make the element clickable
        var clicableClassList = [
            'a:link',
            'actionCardAnchor',
            'cuf-feedItemActionTrigger',
            'forceActionLink',
            'forceEntityIcon',//left navigation
            'forceIcon',
            'header-label',
            'likeIconAnchor',
            //'inputTextArea',
            'menuTriggerLink',
            'outputLookupLink',
            'select',
            'triggerLinkText',
            'tabHeader',
            'uiButton',
            //'uiInput',
            'uiPill'
        ];
        this.getClicableClassList = function() { return clicableClassList; };

//Error Handling session
        var errorsToIgnore = []; //not in use yet

        var errosToCatchAndReport = [
            "Uncaught Action failed",
            "Uncaught Error in $A.getCallback()"
        ];
        this.getErrosToCatchAndReport = function() { return errosToCatchAndReport; };

        this.spinnerClass = 'loadingIndicator';//not in use yet

        //use this to find error message in error popup
        var errorMsgSelector = "div.oneApplicationError > div > textarea[readonly][placeholder]";
        //OK button on error popup
        var okButtonToDismissErrorSelector = ".uiButton[type][title=OK]";
        //'X' button on error popup -- this popup is different, it will show directly the error response from server, hence, our 'mimic' error reponse from chaos run
        var buttonToCloseErrorMessageWindow = "uiButton[type][title=Close this window]";
        this.getOkButtonToDismissErrorSelector = function() { return okButtonToDismissErrorSelector; };
        this.getButtonToCloseErrorMessageWindow = function() { return buttonToCloseErrorMessageWindow; };
        this.getErrorMsgSelector = function() { return errorMsgSelector; };
        
//Error Handling session ends

        var configuration = Object.assign({
            'defaultMaxTry' : 50,
            'defaultSamplingInterval' : 4000,//ms
            'actionDropPercentage' : 0, //out of 100
            'actionErrorPercentage' : 0 //out of 100
        }, config);

        this.getDefaultMaxTry = function() { return configuration.defaultMaxTry; };
        this.getDefaultSamplingInterval = function() { return configuration.defaultSamplingInterval; };
        this.getActionDropPercentage = function() { return configuration.actionDropPercentage; };
        this.getActionErrorPercentage = function() { return configuration.actionErrorPercentage; };

        this.updateConfiguration = function(newConfig) {
            configuration = Object.assign(configuration, newConfig); 
        };

        this.resetActionDropAndErrorPercentage = function() {
            configuration.actionDropPercentage = 0;
            configuration.actionErrorPercentage = 0;
        };

        this.waitForElementInNextStepInterval;// init to undefined;
        this.waitForAnyAuraRenderedElementInterval;// init to undefined;

        this.count_waitForElementFromAStepToAppear = 0;
        this.count_waitAnyAuraRenderedElementPresent = 0;

        var errorResponseDuringNewChaosRun = [{
            "message":"random error response for Chaos Run", "stack":"from Chaos Run"
        }];
        this.getErrorResponseDuringNewChaosRun = function() { return errorResponseDuringNewChaosRun; }
    

        //temp place to store chaos run. before we save them to local, or server
        this.currentChaosRun = {};
        /*
            currentChaosRunSteps is a list of chaos run step. we use this list to record new chaos run.
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
                    'actionName': string,
                    'actionOperation': string //"Drop" or "ErrorResponse"
                    'actionId': string //why we care
                    'actionParameter': string //"{..}"
                    'actionIsStorable': boolean
                    'actionStorageKey': string
                    'actionIsAbortable': boolean
                    'actionIsBackground': boolean
            }
        */
        this.currentChaosRunSteps = [];
        /*
            chaosRunToReplay = {
                'currentChaosRunSteps': see this.currentChaosRunSteps
                'indexOfStep': int
                'samplingInterval': int
            }
        */
        this.chaosRunToReplay; //init to undefined


        var persistGVPs = { "$Locale": true, "$Browser": true, "$Global": true };//useful in randomlyReturnErrorResponseForAction, we need to keep GVP even the response is error                                     

        this.shouldWeDropAction = function(random) {
            return random < this.getActionDropPercentage();
        };

        this.shouldWeErrorResponseAction = function(random) {
            return random < this.getActionErrorPercentage();
        };

        /* didWeAlreadyDecideToDropTheAction <-- responseWithIncomplete
           return responseWithIncomplete
        */
        this.randomlyDropAction = function(didWeAlreadyDecideToDropTheAction, oldResponseText) {
            var responseWithIncomplete = didWeAlreadyDecideToDropTheAction;
            //if we are in a new chaos run, and user would like to drop action randomly
                if( !didWeAlreadyDecideToDropTheAction && this.getActionDropPercentage() ) {
                       if( oldResponseText.startsWith("while(1);") ) {
                            //parse oldResponseObj out of oldResponseText
                            try {
                                var oldResponseObj = JSON.parse(oldResponseText.substring(9, oldResponseText.length));
                                //replace returnValue in oldResponseObj's actions
                                if(oldResponseObj && oldResponseObj.actions && oldResponseObj.actions.length > 0) {
                                    responseWithIncomplete = true;
                                    var actionsFromOldResponse = oldResponseObj.actions;
                                    for(var i = 0; i < actionsFromOldResponse.length; i++) {
                                        if(actionsFromOldResponse[i] && actionsFromOldResponse[i].id) {
                                            //console.log("drop action by request of new Chaos Run.", actionsFromOldResponse[i]);
                                            //push this action to actionsWatched, so actionTab know what to do
                                            actionsFromOldResponse[i]['idtoWatch'] = actionsFromOldResponse[i].id;
                                            actionsFromOldResponse[i]['nextError'] = undefined;//these 2 are useful against howDidWeModifyResponse
                                            actionsFromOldResponse[i]['nextResponse'] = undefined;
                                            actionsWatched[actionsFromOldResponse[i].id] = actionsFromOldResponse[i];
                                            //call AuraInspectorActionsView_OnActionOperationInChaosRun in AuraInspectorActionsView
                                            $Aura.Inspector.publish("AuraInspector:ActionOperationInChaosRun",
                                                {
                                                    'id': actionsFromOldResponse[i].id,
                                                    'actionOperation': 'Drop'
                                                }
                                            );
                                        }
                                    }
                                }
                            } catch (e) {
                                console.warn("Drop action encountered an error while parsing response from server. ", e);
                            }
                        }
                }//end of we are dropping action for new chaos run

            return responseWithIncomplete;
        };

        /*
            didWeAlreadyDecideToErrorResponseTheAction <-- responseWithError
            return {'responseWithError': responseWithError, 'newResponseText': newResponseText}
        */
        this.randomlyReturnErrorResponseForAction = function(didWeAlreadyDecideToErrorResponseTheAction, oldResponseText) {
            var responseWithError = didWeAlreadyDecideToErrorResponseTheAction;
            var newResponseText = oldResponseText;
            if( !didWeAlreadyDecideToErrorResponseTheAction && this.getActionErrorPercentage() ) {
                        if( oldResponseText.startsWith("while(1);") ) {
                            //parse oldResponseObj out of oldResponseText
                            try {
                                    var oldResponseObj = JSON.parse(oldResponseText.substring(9, oldResponseText.length));
                                    //replace returnValue in oldResponseObj's actions
                                    if( oldResponseObj && Array.isArray(oldResponseObj.actions) && oldResponseObj.actions.length > 0) {
                                        responseWithError = true;
                                        //if response is ERROR, we shouldn't have any SERIAL_REFID or SERIAL_ID related object in context, or our real decode will explode
                                        if(oldResponseObj.context && oldResponseObj.context.globalValueProviders) {
                                            var newGVP = [];
                                            for(var j = 0; j < oldResponseObj.context.globalValueProviders.length; j++) {
                                                var gvpj = oldResponseObj.context.globalValueProviders[j];
                                                if( isTrueObject(gvpj) && gvpj.type && persistGVPs[gvpj.type] ) {
                                                    newGVP.push(gvpj);
                                                }
                                            }
                                            oldResponseObj.context.globalValueProviders = newGVP;
                                        }
                                        var actionsFromOldResponse = oldResponseObj.actions;
                                        for(var i = 0; i < actionsFromOldResponse.length; i++) {
                                            //console.log("decode action#"+actionsFromOldResponse[i].id, actionsFromOldResponse[i]);
                                            //if(actionsFromOldResponse[i].id && actionsFromOldResponse[i].id === actionWatchedId) {
                                                //if(actionWatched.nextError) {//we would like to return error response
                                            //for aura framework to receive the error response
                                            actionsFromOldResponse[i].state = "ERROR";
                                            //when action return with error, returnValue should be null
                                            actionsFromOldResponse[i].returnValue = null;
                                            actionsFromOldResponse[i].error = $Aura.chaos.getErrorResponseDuringNewChaosRun();
                                            //for ActionTab to move action card around
                                            actionsFromOldResponse[i]['idtoWatch'] = actionsFromOldResponse[i].id;
                                            //these 2 are useful against howDidWeModifyResponse
                                            actionsFromOldResponse[i]['nextError'] = $Aura.chaos.getErrorResponseDuringNewChaosRun();
                                            actionsFromOldResponse[i]['nextResponse'] = undefined;
                                            actionsWatched[actionsFromOldResponse[i].id] = actionsFromOldResponse[i];
                                            //call AuraInspectorActionsView_OnActionOperationInChaosRun in AuraInspectorActionsView
                                            $Aura.Inspector.publish("AuraInspector:ActionOperationInChaosRun",
                                                {
                                                    'id': actionsFromOldResponse[i].id,
                                                    'actionOperation': 'ErrorResponse'
                                                }
                                            );
                                        }
                                        //update actions
                                        oldResponseObj.actions = actionsFromOldResponse;
                                        newResponseText = "while(1);\n"+JSON.stringify(oldResponseObj);
                                        
                                    }
                            } catch (e) {
                                    console.warn("Drop action encountered an error while parsing response from server. ", e);
                            }
                        }//end of oldResponseText start with "while(1)"
                }//end of we are returning error response for action during new chaos run
                return {'responseWithError': responseWithError, 'newResponseText': newResponseText};
        };

    }

    


    

    /*
        event handler for "AuraInspector:OnSomeActionOperationDuringChaosRun",
        called from ActionsView's AuraInspectorActionsView_OnActionOperationInChaosRun
        {
                'actionOperation': 'Drop' or 'ErrorResponse'
                'nextError': {'message':string, 'stack':string} <-- this.errorResponseDuringNewChaosRun
                'id': string like "969;a",
                'defName': string like "serviceComponent://ui.force.bla/ACTION$getRecord",
                'params': string "{"recrodDescriptor":"bla", "$serId$":4767}"
                'storable': boolean
                'storageKey': string, defName+params
                'abortable': boolean
                'background': boolean
        }
    */
    ChaosManager.prototype.recordActionOperationDuringChaosRun = function(data) {
        if(data && data.defName) {
            this.currentChaosRunSteps.push(
            {
                        'actionName': data.defName,
                        'actionOperation': data.actionOperation,
                        'nextError': this.getErrorResponseDuringNewChaosRun(),
                        'actionId': data.id,
                        'actionParameter': data.params,
                        'actionIsStorable': data.storable,
                        'actionStorageKey': data.storageKey,
                        'actionIsAbortable': data.abortable,
                        'actionIsBackground': data.background
            });
            //let chaos view know
            $Aura.Inspector.publish("AuraInspector:OnRecordActionOperationForChaosRun", data);
        }
    };

    /*
        event handler for AuraInspector:OnStartChaosRun , called from InspectorPanelSfdcChaos.StartChaosRun_OnClick
        { 'samplingInterval': number like 4000, 'actionDropPercentage': number between 0 to 100, 'actionErrorPercentage': number between 0 to 100 };
    */
    ChaosManager.prototype.startChaosRun = function(data) {
            this.updateConfiguration(data);

            //build a client-side timemachine
            if(typeof(Storage) !== "undefined" && sessionStorage) {
                //just in case we are in a middle of another chaos run
                sessionStorage.removeItem("chaosRunToReplay");
                this.stopAllIntervals();

                this.currentChaosRun = {};
                this.currentChaosRunSteps = [];
                timeMachine = {};
                
                var startUrl = window.location.href;
                if(startUrl.indexOf("?t=") > 0) {
                    startUrl = startUrl.substr(0,startUrl.indexOf("?t="));
                     //console.log("rip ?t= from current href:"+startUrl);
                }
                if(startUrl.endsWith("one.app")) {
                    timeMachine['startUrl'] = startUrl;
                    timeMachine['localCache'] = {}; //TODO, look into what we have in storage/ADS/etc
                    this.currentChaosRun['currentChaosRunTimeMachine'] = timeMachine;
                    //console.log("Save timeMachine:", currentChaosRunTimeMachine);
                } else {
                    var msg = "We only support chaos run start from one.app main page for now, current href is "+startUrl;
                    //this will call AuraInspectorChaosView_OnReplayChaosRunNewStatus in InspectorPanelSfdcChaos.js
                    $Aura.Inspector.publish("AuraInspector:OnNewChaosRunNewStatus", {'message': msg});
                    console.error(msg);
                    return;
                }
                
                
            } else {
                console.warn("There is no web storage, cannot build Time Machine to service browser location change");
            }

            if(this.waitForAnyAuraRenderedElementInterval != undefined) {
                console.warn("We have a previous new chaos run in progress, clear it up");
                clearInterval(this.waitForAnyAuraRenderedElementInterval);
                this.waitForAnyAuraRenderedElementInterval = undefined;
                this.count_waitAnyAuraRenderedElementPresent = 0;
            }
            this.waitForAnyAuraRenderedElementInterval = 
                setInterval(this.waitAnyAuraRenderedElementPresent.bind(this), this.getDefaultSamplingInterval());
            
    };


    /*
        event handler for AuraInspector:stopChaosRun, called by InspectorPanelSfdcChaos.StopChaosRun_OnClick
        chaosRunEndsWith = {'error': String} or {'success': String}
    */
    ChaosManager.prototype.stopChaosRun = function(chaosRunEndsWith) {
            this.resetActionDropAndErrorPercentage();

            clearInterval(this.waitForAnyAuraRenderedElementInterval);
            this.waitForAnyAuraRenderedElementInterval = undefined;
            this.count_waitAnyAuraRenderedElementPresent = 0;

            this.removeCircleElement();

            this.currentChaosRun['chaosRunEndsWith'] = chaosRunEndsWith;
            //console.log("ChaosRun Stopped");
    };
    
    //event handler for AuraInspector:stopAllChaosRun, called by InspectorPanelSfdcChaos.StopAllChaosRun_OnClick
    ChaosManager.prototype.stopAllChaosRun = function(data) {

            //and stop all intervals
            clearInterval(this.waitForElementInNextStepInterval);
            this.waitForElementInNextStepInterval = undefined;
            this.count_waitForElementFromAStepToAppear = 0;
            clearInterval(this.waitForAnyAuraRenderedElementInterval);
            this.waitForAnyAuraRenderedElementInterval = undefined;
            this.count_waitAnyAuraRenderedElementPresent = 0;

            //clean up
            this.resetActionDropAndErrorPercentage();
            this.removeActionFromWatchListAfterChaosRunStop();
            this.currentChaosRun = {};
            this.currentChaosRunSteps = [];
            sessionStorage.removeItem("chaosRunToReplay");

            //remove little green circle
            this.removeCircleElement();

            console.warn("All ongoing chaos runs, including replaying, will be stopped");
    };

    /*
        event handler for AuraInspector:saveChaosRun, called by InspectorPanelSfdcChaos.SaveChaosRun_OnClick
        {'samplingInterval': number like 4000, 'actionDropPercentage': number between 0 and 100, 'actionErrorPercentage': number between 0 and 100}
    */
    ChaosManager.prototype.saveChaosRun = function(data) {
            this.currentChaosRun = Object.assign(this.currentChaosRun, data);
            this.currentChaosRun["currentChaosRunSteps"] = this.currentChaosRunSteps;

            //this will call AuraInspectorChaosView_OnChaosRunSaved in InspectorPanelSfdcChaos.js, just to clear out chaos cards
            $Aura.Inspector.publish("AuraInspector:OnChaosRunSaved", {});

            //save the run to local file
            var json = JSON.stringify(this.currentChaosRun);
            var blob = new Blob([json], {type: "application/json"});
            var url  = URL.createObjectURL(blob);

            var ele = document.createElement('a');
            var d = new Date();
            var timeStamp = (d.getMonth()+1)+"_"+d.getDate()+"_"+d.getHours()+"_"+d.getMinutes()+"_"+d.getSeconds();
            ele.download    = "chaosRun_"+timeStamp+".json";
            ele.href        = url;
            ele.click();

            //console.log("ChaosRun Saved", currentChaosRun);

            //clear up
            this.currentChaosRunTimeMachine = {};
            this.currentChaosRun = {};
    };

    /*
        event handler for AuraInspector:OnLoadChaosRun, called by InspectorPanelSfdcChaos.ChooseChaosRunFile_OnClick
        { 'chaosRunFromFile': string }
    */
    ChaosManager.prototype.loadChaosRun = function(data) {
            if(data && data.chaosRunFromFile) {
                var chaosRunFromFile = data.chaosRunFromFile;

                //console.log("get chaos run from local file:", chaosRunFromFile);

                if(typeof(Storage) !== "undefined" && sessionStorage) {
                    //store it in localStorage
                    sessionStorage.setItem("chaosRunToReplay", chaosRunFromFile);

                    //call AuraInspectorChaosView_OnChaosRunLoaded in InspectorPanelSfdcChaos to display steps of the chaosRun
                    $Aura.Inspector.publish("AuraInspector:OnChaosRunLoaded", JSON.parse(chaosRunFromFile));
                } else {
                    console.error("No localStorage found");
                }
            } else {
                console.error("Bad data: unable to read chaos run from file", data);
            }
    };

    /*
        event handler for AuraInspector:OnCancelTheLoadedChaosRun, called by InspectorPanelSfdcChaos.CancelTheLoadedChaosRun_OnClick
    */
    ChaosManager.prototype.cancelTheLoadedChaosRun = function() {
            if(typeof(Storage) !== "undefined" && sessionStorage && sessionStorage.getItem("chaosRunToReplay")) {
                sessionStorage.removeItem("chaosRunToReplay");
            }
            this.chaosRunToReplay = undefined;
    };

    /*
        event handler for AuraInspector:OnReplayChaosRun, called by InspectorPanelSfdcChaos.ReplayChaosRun_OnClick
        build time machine, replay the loaded chaos run
        data: {'samplingInterval': number like 4000}
    */
    ChaosManager.prototype.replayChaosRun = function(data) {
    
            this.resetActionDropAndErrorPercentage();

            if(typeof(Storage) !== "undefined" && sessionStorage && sessionStorage.getItem("chaosRunToReplay")) {
                this.chaosRunToReplay = JSON.parse(sessionStorage.getItem("chaosRunToReplay"));
                //console.log("replay chaos run from sessionStorage: ", chaosRunToReplay);

                //set indexOfStep, also update it in session storage
                this.chaosRunToReplay["indexOfStep"] = 0;
                //use sampling internval of saved chaos run, if any
                this.chaosRunToReplay = Object.assign(this.chaosRunToReplay, data);
                //update sessionStorage
                sessionStorage.setItem("chaosRunToReplay", JSON.stringify(this.chaosRunToReplay));

                if(this.chaosRunToReplay.currentChaosRunTimeMachine && this.chaosRunToReplay.currentChaosRunTimeMachine.startUrl) {
                    //clear up all aura storage
                    this.clearAllAuraStorages(
                        function() {
                            //this will call AuraInspectorChaosView_OnReplayChaosRunNewStatus in InspectorPanelSfdcChaos.js
                            $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': "All aura storage cleared"});

                            var newLocation = JSON.parse(sessionStorage.getItem("chaosRunToReplay")).currentChaosRunTimeMachine.startUrl;
                                    
                            setTimeout(function()
                            {
                                //let user know we have cleared up all aura storage
                                var message = "Start\n page is going to refresh with this url in 3s\n"+newLocation;
                                $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': message});
                                //refresh page with url
                                setTimeout(function()
                                {
                                    //var newLocation = JSON.parse(sessionStorage.getItem("chaosRunToReplay")).currentChaosRunTimeMachine.startUrl;
                                    if(newLocation.indexOf("#") > 0) {//stupid # stop it from reloading
                                        window.location = newLocation;
                                        window.location.reload();
                                    } else {
                                        window.location = newLocation;
                                    }
                                }, 3000);
                            }, 1000);
                        },
                        function(e) {
                            console.warn(e);
                            $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': "There was a problem trying to clear aura storage"});
                        }
                    );
                } else {
                    console.warn("Replay chaos run from sessionStorage, there is no Time Machine", this.chaosRunToReplay);
                }
            } else {
                console.error("Cannot replay chaos run, either there is no local storage, or there is no chaosRunToReplay in it");
            }

    };

    /*
        event handler for 'AuraInspector:OnContinueChaosRun', called from AuraInspectorChaosView_OnBootstrap of InspectorPanelSfdcChaos
        this happen after browser refresh with the new location set by above function 'AuraDevToolService.ReplayChaosRun'
    */
    ChaosManager.prototype.continueChaosRun = function(data) {
            if(typeof(Storage) !== "undefined" && sessionStorage && sessionStorage.getItem("chaosRunToReplay")) {
                //chaosRunToReplay is global
                this.chaosRunToReplay = JSON.parse(sessionStorage.getItem("chaosRunToReplay"));
                if(this.chaosRunToReplay) {
                    //store steps in currentChaosRunSteps, repeately check if the first element show up in dom
                    this.currentChaosRunSteps = this.chaosRunToReplay.currentChaosRunSteps;
                    //TODO: this.chaosRunToReplay should have a configuration that carry samplingInterval
                    var samplingInterval = this.getDefaultSamplingInterval();
                    if(this.chaosRunToReplay.hasOwnProperty('samplingInterval') && this.chaosRunToReplay.samplingInterval > 0) {
                        samplingInterval = this.chaosRunToReplay.samplingInterval;
                    }

                    var message = "We are in the middle of the replaying a chaos run, samplingInterval="+samplingInterval;
                    //console.log(message, chaosRunToReplay);
                    //this will call AuraInspectorChaosView_OnReplayChaosRunNewStatus in InspectorPanelSfdcChaos.js
                    $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': message});

                    this.waitForElementInNextStepInterval = 
                        setInterval(this.waitForElementFromAStepToAppear.bind(this), samplingInterval);
                } else {
                    console.error("We would like to continue with chaos run, but there is no valid chaosRunToReplay in local storage");
                }
            } else {
                console.error("Cannot continue with chaos run because either there is no local storage, or there is no chaos run stored in it");
            }
    };

    /********************************************** end of ChaosManager ****************************************/

    /*  a step looks like this {
            //if it's a click
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
            //if it's action operation
            'actionName': string,
            'actionOperation': string //"Drop" or "ErrorResponse"
            'actionId': string //why we care
            'actionParameter': string //"{..}"
            'actionIsStorable': boolean
            'actionStorageKey': string
            'actionIsAbortable': boolean
            'actionIsBackground': boolean
        }
    */

    /****************************************** functions for replay a chaos run *************************************/
    //this happen when we decide to stop all the chaos run. if there are action added to watch list, we should clear up those too
    ChaosManager.prototype.removeActionFromWatchListAfterChaosRunStop = function(){
        if( actionsToWatch && Object.getOwnPropertyNames(actionsToWatch).length > 0) {
            for(key in actionsToWatch) {
                var actionToWatch = actionsToWatch[key];
                if(actionToWatch.byChaosRun) {
                    console.warn("We have to remove action from watch list because the chaos run stopped", actionToWatch);
                    delete actionToWatch[key];
                }
            }
        }
    }

    ChaosManager.prototype.scheduleActionOperationForNextStep = function() {
        var nextStepIndex = this.chaosRunToReplay.indexOfStep + 1;
        //it's possible we drop more than one action right after a click, let's schedule them all
        while(nextStepIndex <= (this.chaosRunToReplay["currentChaosRunSteps"].length - 1) &&
            this.chaosRunToReplay["currentChaosRunSteps"][nextStepIndex] &&
            this.chaosRunToReplay["currentChaosRunSteps"][nextStepIndex].hasOwnProperty('actionName') &&
            this.chaosRunToReplay["currentChaosRunSteps"][nextStepIndex].hasOwnProperty('actionOperation') ) {

            var nextStep = this.chaosRunToReplay["currentChaosRunSteps"][nextStepIndex];

            var message = "schedule action:"+nextStep.actionName+" to "+nextStep.actionOperation;
            //console.log(message, nextStep);
            //call AuarInspectorChaosView_OnReplayChaosRunNewStatus in InspectorPanelSfdcChaos.js 
            $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': message});

            //add the action to watch list
            var actionToAdd = {
                    'actionName': nextStep.actionName,
                    'actionParameter': nextStep.actionParameter,
                    'actionId': nextStep.actionId, //713;a
                    'actionIsStorable': nextStep.actionIsStorable,
                    'actionStorageKey': nextStep.actionStorageKey,
                    'actionIsAbortable': nextStep.actionIsAbortable,
                    'actionIsBackground': nextStep.actionIsBackground,
                    'nextResponse': undefined, //this has to be undefined
                    'nextError': (nextStep.actionOperation === 'ErrorResponse') ? this.getErrorResponseDuringNewChaosRun() : undefined,
            }
            //call AuraInspectorActionsView's AuraInspectorActionsView_OnEnqueueNextDropForChaosReplay
            $Aura.Inspector.publish("AuraInspector:EnqueueNextDropForChaosReplay", actionToAdd);

            //action scheduled to be drop, now remove the step
            this.chaosRunToReplay["currentChaosRunSteps"].splice(nextStepIndex,1);
            
        }
    }

    //we need to wait for the element in chaos run step to appear before clicking it
    ChaosManager.prototype.waitForElementFromAStepToAppear = function() {
        if( !this.chaosRunToReplay || !this.chaosRunToReplay.hasOwnProperty("indexOfStep") ) {
            //could this happen if page refresh during replay?
            console.error("No chaosRunToReplay in memory");
        }
        var step = this.chaosRunToReplay["currentChaosRunSteps"][this.chaosRunToReplay.indexOfStep];
        if(step && step.hasOwnProperty("cssPath")) {
            var message = "Replay step "+this.chaosRunToReplay.indexOfStep+": "+step.textContent
            +", try count: "+this.count_waitForElementFromAStepToAppear;
            //console.log(message, step);
            //this will call AuarInspectorChaosView_OnReplayChaosRunNewStatus in InspectorPanelSfdcChaos.js
            $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': message});

            //meh
            if(this.count_waitForElementFromAStepToAppear > this.getDefaultMaxTry()) {
                clearInterval(this.waitForElementInNextStepInterval);
                var errMsg = "We have to stop replaying chaos run because an element on the next step wouldn't show up";
                //this will call AuraInspectorChaosView_OnReplayChaosRunFinished in InspectorPanelSfdcChaos 
                $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunFinished", {'error': errMsg});
                console.error(errMsg, step);
            }

            if( this.findElementWithLocatorOrCSSPath(step.locator, step.cssPath) )  {//yay
                //if we want to drop some action right after this click, now it's the time to schedule it.
                this.scheduleActionOperationForNextStep();
                //now click the element, then increase indexOfStep
                this.count_waitForElementFromAStepToAppear = 0;
                var previousIndexOfStep = this.clickElement(step);
                //now either there are more steps after this one, or we are at the end of replaying
                if(previousIndexOfStep >= 0 && previousIndexOfStep < this.chaosRunToReplay["currentChaosRunSteps"].length - 1)
                {
                    this.chaosRunToReplay.indexOfStep = previousIndexOfStep + 1;
                } else {
                    //clear the interval
                    clearInterval(this.waitForElementInNextStepInterval);
                    this.waitForElementInNextStepInterval = undefined;
                    if(this.chaosRunToReplay.indexOfStep === this.chaosRunToReplay["currentChaosRunSteps"].length - 1) {
                        this.removeCircleElement();

                        var message = "Chaos run finished";
                        //console.log(message);
                        //this will call AuarInspectorChaosView_OnReplayChaosRunNewStatus in InspectorPanelSfdcChaos.js
                        $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunNewStatus", {'message': message});
                        //this will call AuarInspectorChaosView_OnReplayChaosRunFinished in InspectorPanelSfdcChaos.js
                        $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunFinished", {});

                    } else {
                        this.removeCircleElement();

                        var errMsg = "Chaos run stopped because step "+this.chaosRunToReplay.indexOfStep+" is out of bound";
                        console.error(errMsg, chaosRunToReplay["currentChaosRunSteps"]);
                        //this will call AuarInspectorChaosView_OnReplayChaosRunFinished in InspectorPanelSfdcChaos
                        $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunFinished", {'error': errMsg});
                    }
                }
            } else {
                this.count_waitForElementFromAStepToAppear = this.count_waitForElementFromAStepToAppear + 1;
                //console.log("waitForElementFromAStepToAppear, try#"+count_waitForElementFromAStepToAppear+" of maxTry="+defaultMaxTry);
            }
        } else {
            this.removeCircleElement();

            var errMsg = "Chaos Run Stop because indexOfStep="+this.chaosRunToReplay.indexOfStep+" is bogus";
            console.error(errMsg, this.chaosRunToReplay["currentChaosRunSteps"]);
            //this will call AuarInspectorChaosView_OnReplayChaosRunFinished in InspectorPanelSfdcChaos.js
            $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunFinished", {'error': errMsg});
        }
    }

    //click on element from a step of chaosrun
    //return chaosRunToReplay.indexOfStep if everything goes well, -1 if we cannot find element to click
    ChaosManager.prototype.clickElement = function(step) {
                //console.log("Click element for step#"+chaosRunToReplay.indexOfStep, step);
                //try locator first
                var elementToClick;
                elementToClick = this.findElementWithLocatorOrCSSPath(step.locator, step.cssPath);

                if(elementToClick) {
                    //console.log("click on "+step.textContent, step);
                    //this will call AuarInspectorChaosView_OnClickSomeElement in InspectorPanelSfdcChaos.js to create chaos card
                    $Aura.Inspector.publish("AuraInspector:OnClickSomeElement", step);

                    //highlight then actually click on the element
                    this.highlightElement(elementToClick);
                    setTimeout( function() { elementToClick.click(); }, 1000 );

                    return this.chaosRunToReplay.indexOfStep;

                } else {
                    var errMsg = "Chaos run stopped because we cannot find the element to click";
                    console.error(errMsg, step);
                    //this will call AuarInspectorChaosView_OnReplayChaosRunFinished in InspectorPanelSfdcChaos.js
                    $Aura.Inspector.publish("AuraInspector:OnReplayChaosRunFinished", {'error': errMsg});

                    return -1;
                }
    }

    ChaosManager.prototype.findElementWithLocatorOrCSSPath = function(locator, cssPath) {
        var selector = '[data-aura-rendered-by] '; // retrieve all aura elements
        var elements = [];

        if (!locator) {
            //console.log("we don't have locator for this step, use cssPath instead", cssPath);
            var elementByCssPath = document.querySelector(cssPath);
            return elementByCssPath;
        }
        // Add context to selector if we have it
        if (locator && locator.context) {
            var keys = Object.keys(locator.context);
            var datamap = keys.map(function(k) { return '[' + k + '=\'' + locator.context[k] + '\']'});
            selector += datamap.join();
        }
        //console.log("try to find element with selector:"+selector);
        // Filter by aura tag + context
        elements = Array.prototype.slice.call(document.querySelectorAll(selector));

        if(elements.length === 1) {
            //console.log("found element with selector in locator("+selector+")",locator);
            return elements[0];
        }
        else if(elements.length > 1) {
            // Filter given the localId's
            elements = elements.filter(function(el) {
                var parentId;
                var cmp = $A.componentService.getRenderingComponentForElement(el);
                var localId = cmp && cmp.getLocalId();
                var tmp = cmp && cmp.getComponentValueProvider()

                if (localId && localId === locator.root) {
                    while (tmp && tmp !== cmp) {
                        var parentId = tmp.getLocalId();
                        if (parentId === locator.parent) {
                                return true;
                        }

                        cmp = tmp;
                        tmp = tmp.getComponentValueProvider();
                    }
                }
            });

            if (elements.length === 1) {
                //console.log("found element with parentId&localId in locator("+selector+")",locator);
                return elements[0];
            } else {
                //console.log("found more than one elements based on locator's context and localId, use cssPath instead", locator, cssPath);
                var elementByCssPath = document.querySelector(cssPath);
                return elementByCssPath;
            }
        } else {
            //console.log("couldn't find any element based on locator's context, use cssPath instead", locator, cssPath);
            var elementByCssPath = document.querySelector(cssPath);
            return elementByCssPath;
        }
    }

    /****************************************** functions for a new chaos run *************************************/

    //when we click through the app, if the page load slowly, need to wait till at least one aura-rendered element show up
    ChaosManager.prototype.waitAnyAuraRenderedElementPresent = function(errorHandlingFunction) {
        if(this.count_waitAnyAuraRenderedElementPresent > this.getDefaultMaxTry()) {
            this.count_waitAnyAuraRenderedElementPresent = 0;
            clearInterval(this.waitForAnyAuraRenderedElementInterval);
            var errMsg = "We have to stop the new chaos run because aura rendered element is missing";
            //ask chaos tab to create a chaos card, this will call stopChaosRun in InspectorPanelSfdcChaos
            $Aura.Inspector.publish("AuraInspector:OnStopNewChaosRunWithError", {'error': errMsg});
            //above will end up calling "AuraDevToolService.StopChaosRun" here to clear up waitForAnyAuraRenderedElementInterval
            console.warn(errMsg);
        }
        if(typeof errorHandlingFunction === "function") {
            var stopNewChaosRun = errorHandlingFunction();
            if(stopNewChaosRun === true) { 
                return;
            }
        }
        //we need to wait till at least one aura rendered element to show up before try to click on anything
        var selector = '[data-aura-rendered-by]';
        var elementNodeList = document.querySelectorAll(selector);
        if(elementNodeList.length > 0) {
            this.count_waitAnyAuraRenderedElementPresent = 0;
            clearInterval(this.waitForAnyAuraRenderedElementInterval);
            this.clickRandomClickableElement();
        } else {
            //console.log("waitAnyAuraRenderedElementPresent, try#"+count_waitAnyAuraRenderedElementPresent+" of maxTry="+defaultMaxTry);
            this.count_waitAnyAuraRenderedElementPresent = this.count_waitAnyAuraRenderedElementPresent + 1;
        }

    }

    /*
        Example : 
        get the error message (if any), return true if we see an error we care, false other wise.
        and click on 'OK' button or 'X' button to dismiss error popups if we don't care about it

        return true if we catch any error we care, false other wise.

        TODO: shall we record these clicks into ChaosRunSteps? now we don't
     */
    ChaosManager.prototype.defaultErrorHandlingFunction = function() {
        var allErrorTextAreas = document.querySelectorAll(this.getErrorMsgSelector());
        if(allErrorTextAreas.length > 0) {
            for(var idx = 0; idx < allErrorTextAreas.length; idx++ ){
                errorText = allErrorTextAreas[idx].innerHTML;
                if( errorText && errorText.length > 0 ) {
                    var errosToCatchAndReport = this.getErrosToCatchAndReport();
                    for(var idx2 = 0; idx2 < errosToCatchAndReport.length; idx2 ++) {
                            if(errorText.indexOf(errosToCatchAndReport[idx2]) >= 0) {
                                //stop the new chaos run, log a bug maybe?
                                var errMsg = "We have to stop the new chaos run because we catch an error we care:"+errosToCatchAndReport[idx];
                                console.warn(errMsg);
                                //ask chaos tab to create a chaos card, this will call stopChaosRun in InspectorPanelSfdcChaos
                                $Aura.Inspector.publish("AuraInspector:OnStopNewChaosRunWithError", {'error': errMsg});
                                //above will end up calling "AuraDevToolService.StopChaosRun" here to clear up waitForAnyAuraRenderedElementInterval

                                return true;//get out of this error handling
                            }
                    }
                }
            }
            //click on 'OK' button(s) if we don't care about the error 
            var allOkButtons = document.querySelectorAll(this.getOkButtonToDismissErrorSelector());
            console.warn("click on OK buttons to dismiss error popups/ how many popups are there:", allOkButtons.length);
            for(var idx = 0; idx < allOkButtons.length ; idx++) {
                $Aura.Inspector.publish("AuraInspector:OnNewChaosRunNewStatus", {'message': "Click on OK button to dismiss error popups"});

                this.highlightElement(allOkButtons[idx]);
                setTimeout( function() { allOkButtons[idx].click(); }, 800 );
            }
            //click on 'X' button of "random error response for Chaos Run" pop up
            var allCloseErrorMsgWindowButtons = document.querySelectorAll(this.getButtonToCloseErrorMessageWindow());
            console.warn("click on X to dismiss error message popups / how many popups are there:", allCloseErrorMsgWindowButtons.length);
            for(var idx = allCloseErrorMsgWindowButtons.length; idx > 0 ; idx--) {
                 $Aura.Inspector.publish("AuraInspector:OnNewChaosRunNewStatus", {'message': "click on X to dismiss error message popups"});
                this.highlightElement(allCloseErrorMsgWindowButtons[idx]);
                setTimeout( function() { allCloseErrorMsgWindowButtons[idx].click(); }, 800 );
            }
            return false;
        } else {
            return false;
        }
        
    }

    //click on a random element. this is called during a new chaos run
    ChaosManager.prototype.clickRandomClickableElement = function() {
        var elementToClickObj = this.getRandomClickableAuraElement();
        if(!elementToClickObj) {//we get into a place where we cannot find clickable element, stop chaos run
            var errMsg = "We have to stop the new chaos run because we couldn't find any clickable elements";
            //ask chaos tab to create a chaos card, this will call stopChaosRun in InspectorPanelSfdcChaos
            $Aura.Inspector.publish("AuraInspector:OnStopNewChaosRunWithError", {'error': errMsg});
            //above will end up calling "AuraDevToolService.StopChaosRun" here to clear up waitForAnyAuraRenderedElementInterval

            console.warn(errMsg);

            return;
        } else {
            var elementToClick = elementToClickObj.element;
            var data = {
                'textContent': elementToClick.textContent,
                'locator': elementToClickObj.locator,
                'cssPath': elementToClickObj.cssPath
            };
            this.currentChaosRunSteps.push(data);
            //this will call InspectorPanelSfdcChaos_OnClickSomeElement in AuarInspectorChaosView to create a chaos card
            $Aura.Inspector.publish("AuraInspector:OnClickSomeElement", data);
            //acutally click the element
            this.highlightElement(elementToClick);
            setTimeout( function() { elementToClick.click(); }, 800 );

            this.waitForAnyAuraRenderedElementInterval = 
            setInterval(this.waitAnyAuraRenderedElementPresent.bind(this, this.defaultErrorHandlingFunction.bind(this)), this.getDefaultSamplingInterval());
        }
        
    }

    /*
    {
        'element': 
        'cssPath': string
        'locator': { 'root': string, 'parent': string, 'context': {string --> nodeValue} }
    }
    */
    ChaosManager.prototype.getRandomClickableAuraElement = function() {
        var res = {};
        var resLocator = {};
        var elementNodeList; var elements = [];
        var randomClickableClassIndex;
        var randomElementsIndex;
        var elementObj, element;
        var renderingComponent;
        var idx;

        var tryCount = 0;
        do {
            tryCount = tryCount + 1;
            var clickableClassList = this.getClicableClassList();
            randomClickableClassIndex = Math.floor( Math.random() * clickableClassList.length );
            selector = '.'+ clickableClassList[randomClickableClassIndex] +'[data-aura-rendered-by] ';
            elementNodeList = document.querySelectorAll(selector);
            for (idx = 0; idx < elementNodeList.length; idx++) {
                var elementNode = elementNodeList.item(idx);
                if( this.isElementVisible(elementNode) ) {
                    var cssPath = this.getCssPath(elementNode);
                    if(cssPath) {
                        elements.push( { 'element': elementNode, 'cssPath': cssPath } );
                    }
                }
            }
            //console.log("try selector#"+randomClickableClassIndex+":"+selector);
        } while(elements.length === 0 && tryCount < this.getDefaultMaxTry()*5)

        if(tryCount >= this.getDefaultMaxTry()*5) {
            return null;
        }

        randomElementsIndex = Math.floor( Math.random() * elements.length );
        elementObj = elements[randomElementsIndex];
        res = elementObj;
        element = elementObj.element;
        renderingComponent = $A.componentService.getRenderingComponentForElement(element);
        if(renderingComponent.getLocalId()) {
            var parentCmp = this.getClosestAncestorWithLocalId(renderingComponent);
            if(parentCmp.getLocalId()) {//yay
                    resLocator['root'] = renderingComponent.getLocalId();
                    resLocator['parent'] = parentCmp.getLocalId();
                    //console.log(renderingComponent.getLocalId()+","+parentCmp.getLocalId());
                    resLocator['context'] = this.getElementAttributesStartWithDataDash(element);
                    res['locator'] = resLocator;
                    //console.log("1.get randomEle #"+randomElementsIndex+":"+element.textContent, res);
                    return res;
            } else {//meh, let's just use the css selector
                    //console.log("2.get randomEle #"+randomElementsIndex+":"+element.textContent, res);
                    return res;
            }
        } else {//meh, let's just use the css selector
            //console.log("3.get randomEle #"+randomElementsIndex+":"+element.textContent, res);
            return res;
        }
    }

    /****************************************************************
    ****************** Utility Functions Starts **********************
    ****************************************************************/

    ChaosManager.prototype.stopAllIntervals = function() {
        clearInterval(this.waitForElementInNextStepInterval);
        this.waitForElementInNextStepInterval = undefined;
        this.count_waitForElementFromAStepToAppear = 0;
        clearInterval(this.waitForAnyAuraRenderedElementInterval);
        this.waitForAnyAuraRenderedElementInterval = undefined;
        this.count_waitAnyAuraRenderedElementPresent = 0;
    }

    ChaosManager.prototype.clearAllAuraStorages = function(resolveFunc, rejectFunc) {
        var storages = $A.storageService.getStorages();
        var plst = [];
        for(var storageName in storages) {
            var p = storages[storageName].clear();
            plst.push(p);
        }
        Promise.all(plst).then(
            function() {
                resolveFunc();
            },
            function(e) {
                rejectFunc(e);
            }
        );
    }

    ChaosManager.prototype.getElementAttributesStartWithDataDash = function(element) {
        var resObj = {}; var attr;
        for(var item in element.attributes) {
            attr = element.attributes[item];
            if(attr.name && attr.name.startsWith("data-") && !attr.name.endsWith("rendered-by")) {
                resObj[attr.name] = attr.nodeValue;
            }
        }
        return resObj;

    }

    ChaosManager.prototype.getClosestAncestorWithLocalId = function(cmp) {
        var parent = cmp && cmp.getComponentValueProvider();
        var tmp = cmp;
        while( parent && parent !== tmp && !parent.getLocalId() ) {
            tmp = parent;
            parent = parent.getComponentValueProvider();
        }
        return parent;
    }

    ChaosManager.prototype.isElementVisible = function(element) {
        if( '0' === element.style.opacity ||'none' === element.style.display || 'hidden' === element.style.visibility
            || element.getBoundingClientRect().left <=0 || element.getBoundingClientRect().top <= 0
            || element.getBoundingClientRect().bottom >= window.innerHeight
            || element.getBoundingClientRect().right >= window.innerWidth
            ) {
            return false;
        } else {
            //var centerLeft = getCenterPositionLeftOfElement(element);
            //var centerTop = getCenterPositionTopOfElement(element);
            var topElement = document.elementFromPoint(element.getBoundingClientRect().left, element.getBoundingClientRect().top);
            if(topElement && topElement === element) {
                return true;
            } else {
                return false;
            }

        }
    }

    ChaosManager.prototype.getCenterPositionLeftOfElement = function(element) {
        return element.getBoundingClientRect().left+element.getBoundingClientRect().width/3;
    }

    ChaosManager.prototype.getCenterPositionTopOfElement = function(element) {
        return element.getBoundingClientRect().top+element.getBoundingClientRect().height/3;
    }

    //functions highlight the element we gonna with greenCircle
    ChaosManager.prototype.createCircleElement = function() {
            var circleEle = document.createElement("div");
            circleEle.setAttribute("id", "greenCircle");
            circleEle.className = "greenCircle";
            circleEle.style.background = "greenyellow";
            circleEle.style.width = "25px";
            circleEle.style.height = "25px";
            circleEle.style.borderRadius = "50px";
            circleEle.style.opacity = "0.5";
            circleEle.style.transition="left .5s ease-in, top .5s ease-in";
            circleEle.style.zIndex = "9999";
            circleEle.style.position = "fixed";
            circleEle.style.left = "50px";
            circleEle.style.top = "50px";


            window.document.body.appendChild(circleEle);
            return circleEle;
    }

    ChaosManager.prototype.removeCircleElement = function() {
        var circleEle = document.querySelector("#greenCircle");
        if(circleEle) {
            circleEle.parentElement.removeChild(circleEle);
        }
    }

    ChaosManager.prototype.moveCircleToWhatWeJustClicked = function(left, top) {
            var circleEle = document.querySelector("#greenCircle");
            circleEle.style.left = left+"px";
            circleEle.style.top = top+"px";
    }

    ChaosManager.prototype.highlightElement = function(element) {
        if(!window.document.querySelector("#greenCircle")) {
            this.createCircleElement();
        }
        this.moveCircleToWhatWeJustClicked(
            this.getCenterPositionLeftOfElement(element), this.getCenterPositionTopOfElement(element));
    }
    //end of functions to highlight the element we gonna with greenCircle

    //functions to get css path of some element
    ChaosManager.prototype.previousElementSibling = function(element) {
      if (element.previousElementSibling !== 'undefined') {
        return element.previousElementSibling;
      } else {
        // Loop through ignoring anything not an element
        while (element = element.previousSibling) {
          if (element.nodeType === Node.ELEMENT_NODE) {
            return element;
          }
        }
      }
    }

    ChaosManager.prototype.getCssPath = function(element) {
      if (!(element instanceof HTMLElement)) { return false; }
      var path = [];
      while (element.nodeType === Node.ELEMENT_NODE) {
        var selector = element.nodeName;
        if (element.id && element.id.indexOf(";")<0 && element.id.indexOf(":")<0 ) { selector += ('#' + element.id); }
        else {
          // Walk backwards until there is no previous sibling
          var sibling = element;
          // Will hold nodeName to join for adjacent selection
          var siblingSelectors = [];
          while (sibling !== null && sibling.nodeType === Node.ELEMENT_NODE) {
            siblingSelectors.unshift(sibling.nodeName);
            sibling = this.previousElementSibling(sibling);
          }
          // :first-child does not apply to HTML
          if (siblingSelectors[0] !== 'HTML') {
            siblingSelectors[0] = siblingSelectors[0] + ':first-child';
          }
          selector = siblingSelectors.join(' + ');
        }
        path.unshift(selector);
        element = element.parentNode;
      }
      return path.join(' > ');
    }//end of functions to get css path of some element


    /****************************************************************
    ****************** Utility Functions Ends **********************
    ****************************************************************/

    /****************************************************************
    ****************** Chaos Functions Ends **********************
    ****************************************************************/



    // Subscribes!
    $Aura.Inspector.subscribe("AuraInspector:OnPanelConnect", function AuraInspector_OnPanelLoad() {
        $Aura.actions["AuraDevToolService.Bootstrap"]();

        window.postMessage({
            "action": "AuraInspector:bootstrap",
            "data": {"key":"AuraInspector:bootstrap", "data":{}}
        }, window.location.href);

    });

    // $Aura.Inspector.subscribe("AuraInspector:OnPanelAlreadyConnected", function AuraInspector_OnPanelLoad() {
    //     $Aura.actions["AuraDevToolService.Bootstrap"]();
    //     $Aura.Inspector.unsubscribe("AuraInspector:OnPanelAlreadyConnected", AuraInspector_OnPanelLoad);
    // });

    $Aura.Inspector.subscribe("AuraInspector:OnHighlightComponent", $Aura.actions["AuraDevToolService.HighlightElement"]);
    $Aura.Inspector.subscribe("AuraInspector:OnHighlightComponentEnd", $Aura.actions["AuraDevToolService.RemoveHighlightElement"]);

    $Aura.Inspector.subscribe("AuraInspector:OnActionToWatchEnqueue", $Aura.actions["AuraDevToolService.AddActionToWatch"]);
    $Aura.Inspector.subscribe("AuraInspector:OnActionToRemoveFromWatchEnqueue", $Aura.actions["AuraDevToolService.RemoveActionFromWatch"]);
    $Aura.Inspector.subscribe("AuraInspector:OnActionToWatchClear", $Aura.actions["AuraDevToolService.RemoveActionsFromWatch"]);

    $Aura.Inspector.subscribe("AuraInspector:OnStartChaosRun", $Aura.chaos.startChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnStopChaosRun", $Aura.chaos.stopChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnSaveChaosRun", $Aura.chaos.saveChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnLoadChaosRun", $Aura.chaos.loadChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnReplayChaosRun", $Aura.chaos.replayChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnContinueChaosRun", $Aura.chaos.continueChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnStopAllChaosRun", $Aura.chaos.stopAllChaosRun.bind($Aura.chaos));
    $Aura.Inspector.subscribe("AuraInspector:OnSomeActionOperationDuringChaosRun", $Aura.chaos.recordActionOperationDuringChaosRun.bind($Aura.chaos));


    function AuraInspector() {
        var subscribers = new Map();
        var PUBLISH_KEY = "AuraInspector:publish";
        var PUBLISH_BATCH_KEY = "AuraInspector:publishbatch";
        var BOOTSTRAP_KEY = "AuraInspector:bootstrap";
        var postMessagesQueue = [];
        var batchPostId = null;
        var COMPONENT_CONTROL_CHAR = "\u263A"; // ☺ - This value is a component Global Id
        var ACTION_CONTROL_CHAR = "\u2744"; // ❄ - This is an action
        var ESCAPE_CHAR = "\u2353"; // This value was escaped, unescape before using.
        var increment = 0;
        var lastItemInspected;
        var countMap = new Map();

        this.init = function() {
            // Add Rightclick handler. Just track what we rightclicked on.
            addRightClickObserver();

            this.subscribe("AuraInspector:ContextElementRequest", function(){
                if(lastItemInspected && lastItemInspected.nodeType === 1) {
                    this.publish("AuraInspector:ShowComponentInTree", lastItemInspected.getAttribute("data-aura-rendered-by"));
                }
            }.bind(this));
        };

        this.publish = function(key, data) {
            if(!key) { return; }

            // We batch the post messages
            // to avoid excessive messages which was causing
            // stabalization issues.
            postMessagesQueue.push({"key":key, "data":data});

            if(batchPostId === null || batchPostId === undefined) {
                batchPostId = sendQueuedPostMessages();
            }
        };

        this.subscribe = function(key, callback) {
            if(!key || !callback) { return; }

            if(!subscribers.has(key)) {
                subscribers.set(key, []);
            }

            subscribers.get(key).push(callback);
        };

        this.unsubscribe = function(key, callback) {
            if(!key || !callback) { return false; }

            if(!subscribers.has(key)) {
                return false;
            }

            var listeners = subscribers.get(key);
            subscribers.set(key, listeners.filter(function(item){
                return item !== callback;
            }));

        };

        // Overriden by some tricky code down below to try to get into the context of the app.
        this.accessTrap = function(callback) {
            if(typeof callback === "function") {
                callback();
            }
        };

        this.getComponent = function(componentId, options) {
            var component = $A.getComponent(componentId);
            var configuration = Object.assign({
                "attributes": true, // True to serialize the attributes, if you just want the body you can set this to false and body to true. (Good for serializing supers)
                "body": true, // Serialize the Body? This can be expensive so you can turn it off.
                "elementCount": false, // Count all child elements of all the elements associated to a component.
                "model": false, // Serialize the model data as well
                "valueProviders": false, // Should we serialize the attribute and facet value providers to the output? Could be a little slow now since we serialize passthrough value keys which could be big objects.
                "handlers": false // Do we serialize the event handlers this component is subscribed to?
            }, options);
            if(component){
                if(!component.isValid()) {
                    return JSON.stringify({
                        "valid": false,
                        "__proto__": null // no inherited properties
                    });
                } else {
                    var output = {
                        "descriptor": component.getDef().getDescriptor().toString(),
                        "globalId": component._$getSelfGlobalId$(),
                        "localId": component.getLocalId(),
                        "rendered": component.isRendered(),
                        "isConcrete": component.isConcrete(),
                        "valid": true,
                        "expressions": {},
                        "attributes": {},
                        "__proto__": null, // no inherited properties
                        "elementCount": 0,
                        "rerender_count": this.getCount(component._$getSelfGlobalId$() + "_rerendered")

                        // Added Later
                        //,"super": ""
                        //,"model": null
                    };

                    // VALUE PROVIDERS
                    if(configuration.valueProviders) {
                        output["attributeValueProvider"] = getValueProvider(component.getAttributeValueProvider());
                        output["facetValueProvider"] = getValueProvider(component.getComponentValueProvider());
                    }

                    // ATTRIBUTES
                    if(configuration.attributes) {
                        var auraError=$A.error;
                        var attributes = component.getDef().getAttributeDefs();

                        try {
                            // The Aura Inspector isn't special, it doesn't
                            // have access to the value if the access check
                            // system prevents it. So we should notify we
                            // do not have access.
                            var accessCheckFailed;

                            // Track Access Check failure on attribute access
                            $A.error=function(message,error){
                                if(message.indexOf("Access Check Failed!")===0){
                                    accessCheckFailed = true;
                                }
                            };

                            attributes.each(function(attributeDef) {
                                var key = attributeDef.getDescriptor().getName();
                                var value;
                                var rawValue;
                                accessCheckFailed = false;

                                // BODY
                                // If we don't want the body serialized, skip it.
                                // We would only want the body if we are going to show
                                // the components children.
                                if(key === "body" && !configuration.body) { return; }
                                try {
                                    rawValue = component._$getRawValue$(key);
                                    value = component.get("v." + key);
                                } catch(e) {
                                    value = undefined;
                                }

                                if($A.util.isExpression(rawValue)) {
                                    output.expressions[key] = rawValue+"";
                                    output.attributes[key] = accessCheckFailed ? "[ACCESS CHECK FAILED]" : value;
                                } else {
                                    output.attributes[key] = rawValue;
                                }
                            }.bind(this));
                        } catch(e) {
                            console.error(e);
                        } finally {
                            $A.error = auraError;
                        }
                    }
                    // BODY
                    else if(configuration.body) {
                        var rawValue;
                        var value;
                        try {
                            rawValue = component._$getRawValue$("body");
                            value = component.get("v.body");
                        } catch(e) {
                            value = undefined;
                        }
                        if($A.util.isExpression(rawValue)) {
                            output.expressions["body"] = rawValue+"";
                            output.attributes["body"] = value;
                        } else {
                            output.attributes["body"] = rawValue;
                        }
                    }

                    var supers = [];
                    var superComponent = component;
                    while(superComponent = superComponent.getSuper()) {
                        supers.push(superComponent._$getSelfGlobalId$());
                    }

                    if(supers.length) {
                        output["supers"] = supers;
                    }

                    // ELEMENT COUNT
                    // Concrete is the only one with elements really, so doing it at the super
                    // level is duplicate work.
                    if(component.isConcrete() && configuration.elementCount) {
                        var elements = component.getElements() || [];
                        var elementCount = 0;
                        for(var c=0,length=elements.length;c<length;c++) {
                            if(elements[c] instanceof HTMLElement) {
                                // Its child components, plus itself.
                                elementCount += elements[c].getElementsByTagName("*").length + 1;
                            }
                        }
                        output.elementCount = elementCount;
                    }

                    // MODEL
                    if(configuration.model) {
                        var model = component.getModel();
                        if(model) {
                            output["model"] = model.data;
                        }
                    }

                    // HANDLERS
                    if(configuration.handlers){
                        var handlers = {};
                        var events = component.getEventDispatcher();
                        var current;
                        var apiSupported = true; // 204+ only. Don't want to error in 202. Should remove this little conditional in 204 after R2.
                        for(var eventName in events) {
                            current = events[eventName];
                            if(Array.isArray(current) && current.length && apiSupported) {
                                handlers[eventName] = [];
                                for(var c=0;c<current.length;c++){
                                    if(!current[c].hasOwnProperty("actionExpression")) {
                                        apiSupported = false;
                                        break;
                                    }
                                    handlers[eventName][c] = {
                                        "expression": current[c]["actionExpression"],
                                        "valueProvider": getValueProvider(current[c]["valueProvider"])
                                    };
                                }
                            }
                        }
                        if(apiSupported) {
                            output["handlers"] = handlers;
                        }
                    }

                    // Output to the dev tools
                    return this.safeStringify(output);
                }
            }
            return "";
        };

        /**
         * Safe because it handles circular references in the data structure.
         *
         * Will add control characters and shorten components to just their global ids.
         * Formats DOM elements in a pretty manner.
         */
        this.safeStringify = function(originalValue) {
            // For circular dependency checks
            var doNotSerialize = {
                "[object Window]": true,
                "[object global]": true,
                "__proto__": null
            };
            var visited = new Set();
            var toJSONCmp = $A.Component.prototype.toJSON;
            delete $A.Component.prototype.toJSON;
            var result = "{}";
            try {
                result = JSON.stringify(originalValue, function(key, value) {
                    if(value === document) { return {}; }
                    if(Array.isArray(this) || key) { value = this[key]; }
                    if(!value) { return value; }

                    if(typeof value === "string" && (value.startsWith(COMPONENT_CONTROL_CHAR) || value.startsWith(ACTION_CONTROL_CHAR))) {
                        return ESCAPE_CHAR + escape(value);
                    }

                    if(value instanceof HTMLElement) {
                        var attributes = value.attributes;
                        var domOutput = [];
                        for(var c=0,length=attributes.length,attribute;c<length;c++) {
                            attribute = attributes.item(c);
                            domOutput.push(attribute.name + "=" + attribute.value);
                        }
                        return `<${value.tagName} ${domOutput.join(' ')}>`; // Serialize it specially.
                    }

                    if(value instanceof Text) {
                        return value.nodeValue;
                    }

                    if($A.util.isComponent(value)) {
                        return COMPONENT_CONTROL_CHAR + value.getGlobalId();
                    }

                    if($A.util.isExpression(value)) {
                        return value.toString();
                    }

                    if($A.util.isAction(value)) {
                        return ACTION_CONTROL_CHAR + value.getDef().toString();
                    }

                    if(Array.isArray(value)) {
                        return value.slice();
                    }

                    if(typeof value === "object") {
                    //     try {
                    //     var primitive = value+"";
                    // } catch(ex) { debugger; }
                        if("$serId$" in value && visited.has(value)) {
                            return {
                                "$serRefId$": value["$serId$"],
                                "__proto__": null
                            };
                        }
                        else if(doNotSerialize[Object.prototype.toString.call(value)]) {
                            value = {};
                        }
                        else if(!$A.util.isEmpty(value)) {
                            visited.add(value);
                            value.$serId$ = increment++;
                        }
                    }

                    return value;
                });

            } catch(e) {
                console.error("AuraInspector: Error serializing object to json.");
            }


            visited.forEach(function(item){
                if("$serId$" in item) {
                    delete item["$serId$"];
                }
            });

            $A.Component.prototype.toJSON = toJSONCmp;

            return result;
        };

        /**
         * Increment a counter for the specified key.
         * @example
         * $Aura.Inspector.count('rendered');
         * $Aura.Inspector.count('rendered');
         * $Aura.Inspector.getCount('rendered'); // 2
         * @param  {String} key Any unique ID to count
         */
        this.count = function(key) {
            countMap.set(key, countMap.has(key) ? countMap.get(key) + 1 : 1)
        };

        /**
         * Get how many times a key has been counted without incrementing the counter.
         *
         * @param  {String} key Unique id to count.
         */
        this.getCount = function(key) {
            return countMap.has(key) ? countMap.get(key) : 0;
        };

        /**
         * Reset a counted key to 0.
         *
         * @param  {String} key Unique id that you passed to this.count(key) to increment the counter.
         */
        this.clearCount = function(key) {
            if(countMap.has(key)) {
                countMap.delete(key);
            }
        }

        // Start listening for messages
        window.addEventListener("message", Handle_OnPostMessage);

        function Handle_OnPostMessage(event) {
            if(event && event.data) {
                if(event.data.action === PUBLISH_KEY) {
                    callSubscribers(event.data.key, event.data.data);
                } else if(event.data.action === PUBLISH_BATCH_KEY) {
                    var data = event.data.data || [];
                    for(var c=0,length=data.length;c<length;c++) {
                        callSubscribers(data[c].key, data[c].data);
                    }
                }
            }
        }

        /** Serializing Passthrough Values as valueProviders is a bit complex, so we have this helper function to do it. */
        function getValueProvider(valueProvider) {
            if("_$getSelfGlobalId$" in valueProvider) {
                return valueProvider._$getSelfGlobalId$();
            }

            // Probably a passthrough value
            var output = {
                // Can't do providers yet since we don't have a way to get access to them.
                // We should though, it would be great to see in the inspector.
                //"providers": safeStringify()
                $type$: "passthrough"
            };

            if('getPrimaryProviderKeys' in valueProvider) {
                var values = {};
                var value;
                var keys;
                var provider = valueProvider;
                while(provider && !("_$getSelfGlobalId$" in provider)) {
                    keys = provider.getPrimaryProviderKeys();
                    for(var c = 0; c<keys.length;c++) {
                        key = keys[c];
                        if(!values.hasOwnProperty(key)) {
                            value = provider.get(key);
                            if($A.util.isComponent(value)) {
                                values[key] = {
                                    "id": value
                                };
                            } else {
                                values[key] = value;
                            }
                        }
                    }
                    provider = provider.getComponent();
                }
                if(provider && "_$getSelfGlobalId$" in provider) {
                    output["globalId"] = provider._$getSelfGlobalId$();
                }
                output["values"] = values;
            } else {
                while(!("_$getSelfGlobalId$" in valueProvider)) {
                    valueProvider = valueProvider.getComponent();
                }
                output["globalId"] = valueProvider._$getSelfGlobalId$();
            }

            return output;
        }

        function callSubscribers(key, data) {
            if(subscribers.has(key)) {
                subscribers.get(key).forEach(function(callback){
                    callback(data);
                });
            }
        }

        function sendQueuedPostMessages() {
            if("requestIdleCallback" in window) {
                batchPostId = window.requestIdleCallback(sendQueuedPostMessagesCallback);
            } else {
                batchPostId = window.requestAnimationFrame(sendQueuedPostMessagesCallback);
            }

            function sendQueuedPostMessagesCallback() {
                try {
                    window.postMessage({
                        "action": PUBLISH_BATCH_KEY,
                        "data": postMessagesQueue
                    }, window.location.href);
                } catch(e) {
                    console.error("AuraInspector: Failed to communicate to inspector.", e);
                }
                postMessagesQueue = [];
                batchPostId = null;
            }
        }

        function addRightClickObserver(){
            document.addEventListener("mousedown", function(event){
                // Right Click
                if(event.button === 2) {
                    var current = event.target;
                    while(current && current != document && !current.hasAttribute("data-aura-rendered-by")) {
                        current = current.parentNode;
                    }
                    lastItemInspected = current;
                }
            });
        }

    }

    function wrapFunction(target, methodName, newFunction) {
        if(typeof target[methodName] != "function") {
            return;
        }
        var original = target[methodName];
        target[methodName] = function() {
            newFunction.apply(this, arguments);
            return original.apply(this, arguments);
        };
    }

    function bootstrapCounters() {
        // Count how many components are being created.
        $A.installOverride("ComponentService.createComponentPriv", function(){
             var config = Array.prototype.shift.apply(arguments);

             var ret = config["fn"].apply(config["scope"], arguments);

             $Aura.Inspector.count("component_created");

             return ret;
        });

        // No way of displaying this at the moment.
        // wrapFunction($A.Component.prototype, "render", function(){
        //     $Aura.Inspector.count("component_rendered");
        //     $Aura.Inspector.count(this.getGlobalId() + "_rendered");
        // });

        wrapFunction($A.Component.prototype, "rerender", function(){
            $Aura.Inspector.count("component_rerendered");
            $Aura.Inspector.count(this.getGlobalId() + "_rerendered");
        });

        /*
            I'll admit, this is a  hack into the Aura access check framework.
            I shouldn't rely on this, it's merely a best case scenario work around.
            Fallbacks should be present if I use this method.
         */
        var originalRender = $A.Component.prototype.render;
        wrapFunction($A.Component.prototype, "render", function(){
            var current = this.getDef();
            while(current.getSuperDef()) {
                current = current.getSuperDef();
            }
            if(current.getDescriptor().getQualifiedName() === "markup://aura:application") {
                $Aura.Inspector.accessTrap = $A.getCallback(function(callback) {
                    if(typeof callback === "function") {
                        callback();
                    }
                });
                // No need anymore to do the override. It's simply to attach this access trap.
                $A.Component.prototype.render = originalRender;
            }
        });
        // No way of displaying this at the moment.
        // wrapFunction($A.Component.prototype, "unrender", function(){
        //     $Aura.Inspector.count("component_unrendered");
        //     $Aura.Inspector.count(this.getGlobalId() + "_unrendered");
        // });
    }

    function bootstrapEventInstrumentation() {

        // Doesn't exist in 198 yet, once it does lets remove this try catch.
        try {
            $A.installOverride("Event.fire", OnEventFire);
        } catch(e){}

        function OnEventFire(config, params) {
            var startTime = performance.now();
            var eventId = "event_" + startTime;
            var data = {
                "id": eventId
            };

            $Aura.Inspector.publish("AuraInspector:OnEventStart", data);

            var ret = config["fn"].call(config["scope"], params);

            var event = config["scope"];
            var source = event.getSource();

            data = {
                "id": eventId,
                "caller": arguments.callee.caller.caller.caller+"",
                "name": event.getDef().getDescriptor().getQualifiedName(),
                "parameters": output(event.getParams()),
                "sourceId": source ? source.getGlobalId() : "",
                "startTime": startTime,
                "endTime": performance.now(),
                "type": event.getDef().getEventType()
            };

            $Aura.Inspector.publish("AuraInspector:OnEventEnd", data);

            return ret;
        }

        function output(data) {
            var componentToJSON = $A.Component.prototype.toJSON;
            delete $A.Component.prototype.toJSON;

            var json = $Aura.Inspector.safeStringify(data, function(key, value){
                if($A.util.isComponent(value)) {
                    return "[Component] {" + value.getGlobalId() + "}";
                } else if(value instanceof Function) {
                    return value +"";
                }
                return value;
            });

            $A.Component.prototype.toJSON = componentToJSON;

            return json;
        }
    }

    //This return true if the object is an array, and it's not empty
    function isNonEmptyArray(obj) {
        return Array.isArray(obj) && obj.length > 0;
    }

    //This return true if the object is with type Object, but not an array or null/undefined
    function isTrueObject(obj) {
        return typeof obj === "object" && !(obj instanceof Array);
    }

    //go through returnValue object, replace the value if nextResponse[key] exist
    function replaceValueInObj (returnValue, nextResponse) {
        if(isNonEmptyArray(returnValue)) {
            for(var i = 0; i < returnValue.length; i ++) {
                var returnValuei = returnValue[i];
                var res = replaceValueInObj(returnValuei, nextResponse);
                if(res) { return res; }
            }
        }  else if (isTrueObject(returnValue)) {
            for(key in returnValue) {
                var returnValuek = returnValue[key];
                if(nextResponse && nextResponse.hasOwnProperty(key)) {
                    returnValue[key] = nextResponse[key];
                    //console.log("found a match, update response for "+key);
                    return true;
                } else {
                    var res = replaceValueInObj(returnValuek, nextResponse);
                    if(res) { return res; }
                }
            }
        }
    }

    //oldResponse: XMLHttpRequest
    //actionsFromAuraXHR: AuraXHR keep an object called actions, it has all actions client side are waiting for response, a map between actionId and action.
    function onDecode(config, oldResponse, noStrip) {
        //var response = oldResponse["response"];
        if(oldResponse["response"] && oldResponse["response"].length > 0) {
            //modify response if we find the action we are watching
            var response = oldResponse["response"];
            var oldResponseText = oldResponse["responseText"];
            var newResponseText = oldResponseText;
            var responseModified = false;//if we modify the response, set this to true
            var responseWithError = false;//if we send back error response, set this to true
            var responseWithIncomplete = false;//if we want to kill the action, set this to true
            try {
            if( Object.getOwnPropertyNames(actionsWatched).length > 0 ) {
                for(actionWatchedId in actionsWatched) {
                    if(oldResponseText.indexOf(actionWatchedId) > 0) {
                        var actionWatched = actionsWatched[actionWatchedId];
                        if( oldResponseText.startsWith("while(1);") ) {
                            //parse oldResponseObj out of oldResponseText
                            
                            var oldResponseObj = JSON.parse(oldResponseText.substring(9, oldResponseText.length));

                            //replace returnValue in oldResponseObj's actions
                            if(oldResponseObj && oldResponseObj.actions) {
                                var actionsFromOldResponse = oldResponseObj.actions;
                                for(var i = 0; i < actionsFromOldResponse.length; i++) {
                                    //console.log("decode action#"+actionsFromOldResponse[i].id, actionsFromOldResponse[i]);
                                    if(actionsFromOldResponse[i].id && actionsFromOldResponse[i].id === actionWatchedId) {
                                        if(actionWatched.nextError) {//we would like to return error response
                                            var errsArr = [];
                                            errsArr.push(actionWatched.nextError);
                                            actionsFromOldResponse[i].state = "ERROR";
                                            //when action return with error, returnValue should be null
                                            actionsFromOldResponse[i].returnValue = null;
                                            actionsFromOldResponse[i].error = errsArr;
                                            responseWithError = true;
                                            break;//get out of looping over actionsFromOldResponse
                                        } else if(actionWatched.nextResponse) {//we would like to return non-error response
                                            var returnValue = actionsFromOldResponse[i].returnValue;
                                            responseModified = replaceValueInObj(returnValue, actionWatched.nextResponse);
                                            if(responseModified === true) {
                                                //no need to continue, returnValue now contains new response
                                                actionsFromOldResponse[i].returnValue = returnValue;
                                                break; //get out of looping over actionsFromOldResponse
                                            }
                                        } else {//we would like to kill action, return incomplete
                                            responseWithIncomplete = true;
                                        }
                                    }
                                }//end of looping over actionsFromOldResponse
                            }//end of oldResponseObj is valid and it has actions
                            //replace context in oldResponseObj
                            if(responseWithError === true ) {
                                //udpate context:
                                //if response is ERROR, we shouldn't have any SERIAL_REFID or SERIAL_ID related object in context, or our real decode will explode
                                if(oldResponseObj.context && oldResponseObj.context.globalValueProviders) {
                                    var newGVP = [];
                                    for(var j = 0; j < oldResponseObj.context.globalValueProviders.length; j++) {
                                        var gvpj = oldResponseObj.context.globalValueProviders[j];
                                        if( isTrueObject(gvpj) && gvpj.type ) {
                                            if(gvpj.type === "$Locale" || gvpj.type === "$Browser" || gvpj.type === "$Global") {
                                                //we keep Local, Browser and Global ONLY
                                                newGVP.push(gvpj);
                                            } else {
                                                //get rid of others
                                            }
                                        }
                                    }
                                    oldResponseObj.context.globalValueProviders = newGVP;
                                }
                                //update actions
                                oldResponseObj.actions = actionsFromOldResponse;
                                newResponseText = "while(1);\n"+JSON.stringify(oldResponseObj);
                                //move the actionCard from watch list to Processed
                                //this will call AuraInspectorActionsView_OnActionStateChange in AuraInspectorActionsView.js
                                $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": actionWatchedId,
                                        "idtoWatch": actionWatched.idtoWatch,
                                        "state": "RESPONSEMODIFIED",
                                        "error": actionWatched.nextError,//we don't show error on processed actionAcard, but pass it anyway
                                        "sentTime": performance.now()//do we need this?
                                });
                                break;//get out of looping over actionsWatched
                            } else if(responseModified === true) {
                                oldResponseObj.actions = actionsFromOldResponse;
                                newResponseText = "while(1);\n"+JSON.stringify(oldResponseObj);
                                //move the actionCard from watch list to Processed
                                //this will call AuraInspectorActionsView_OnActionStateChange in AuraInspectorActionsView.js
                                $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": actionWatchedId,
                                        "idtoWatch": actionWatched.idtoWatch,
                                        "state": "RESPONSEMODIFIED",
                                        "sentTime": performance.now()//do we need this?
                                });
                                break;//get out of looping over actionsWatched
                            } else if(responseWithIncomplete === true) {
                                //move the actionCard from watch list to Processed
                                //this will call AuraInspectorActionsView_OnActionStateChange in AuraInspectorActionsView.js
                                $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": actionWatchedId,
                                        "idtoWatch": actionWatched.idtoWatch,
                                        "state": "RESPONSEMODIFIED",
                                        "sentTime": performance.now(),//do we need this?
                                        "byChaosRun": actionWatched.byChaosRun
                                });
                                if(actionWatched.byChaosRun) {
                                    $Aura.Inspector.publish("AuraInspector:OnCreateChaosCard",
                                        {"message": "Drop action "+actionWatched.id + ", the old actionId from replay: "+actionWatched.idtoWatch} );
                                    if(actionWatched.id === actionWatched.idtoWatch) {
                                        console.warn("The action in your replay has the same id as the action being dropped, this will confuse ActionTab, as it use actionId to find and move actionCard around. Please change action id in your replay file to something else, like 9999 :-) ");
                                    }
                                }
                                break;//get out of looping over actionsWatched
                            }
                        }//end of actionWatched has nextResponse and oldResponseText start with 'while(1);'
                    }//end of oldResponseText contains the actionWatchedId we care
                }//end of looping over actionsWatched
            }//end of actionsWatched is not empty
            } catch(e) {
                    console.warn("get response we cannot parse with JSON.parse, skip", oldResponse);
                    var ret = config["fn"].call(config["scope"], oldResponse, noStrip);
                    return ret;
            }

            var r1 = Math.random() * 100;
            if($Aura.chaos.shouldWeDropAction(r1)) {
                //if we are in a new chaos run and user would like to drop action randomly
                responseWithIncomplete = $Aura.chaos.randomlyDropAction(responseWithIncomplete, oldResponseText); 
            }
            var r2 = Math.random() * 100;
            if($Aura.chaos.shouldWeErrorResponseAction(r2)) {
                //if we are in a new chaos run and we would like to return error response randomly
                resObj = $Aura.chaos.randomlyReturnErrorResponseForAction(responseWithIncomplete, oldResponseText);
                responseWithError = resObj.responseWithError;
                newResponseText = resObj.newResponseText;
            }
            
            

            if(responseWithIncomplete) {
                oldResponse.status = 0;//so AuraClientService.isDisconnectedOrCancelled will return true

                var ret = config["fn"].call(config["scope"], newHttpRequest, noStrip);
                return ret;
            }
            else if(responseModified === true || responseWithError === true) {
                var newHttpRequest = {};
                newHttpRequest = $A.util.apply(newHttpRequest, oldResponse);
                newHttpRequest["response"] = newResponseText;
                newHttpRequest["responseText"] = newResponseText;

                var ret = config["fn"].call(config["scope"], newHttpRequest, noStrip);
                return ret;
            } else {//nothing happended, just send back oldResponse
                var ret = config["fn"].call(config["scope"], oldResponse, noStrip);
                return ret;
            }
        } else {
            console.warn("AuraInspectorInjectedScript.onDecode received a bad response.");
            var ret = config["fn"].call(config["scope"], oldResponse, noStrip);
            return ret;
        }
    }

    //go through actionToWatch, if we run into an action we are watching, either drop it
    //or register with actionsWatched, so we can modify response later in onDecode
    function OnSendAction(config, auraXHR, actions, method, options) {
            if (actions) {
                for(var c=0;c<actions.length;c++) {
                    if( Object.getOwnPropertyNames(actionsToWatch).length > 0) {
                        var action = actions[c];
                        for(key in actionsToWatch) {
                            var actionToWatch = actionsToWatch[key];
                            if(actionToWatch.actionName.indexOf(action.getDef().name) >= 0) {
                                //udpate the record of what we are watching, this is mainly for action we want to modify response
                                if(actionsWatched[''+action.getId()]) {
                                    console.warn("Error: we already watching this action:", action);
                                } else {
                                    //copy nextResponse to actionWatched
                                    action['nextError'] = actionToWatch.nextError;
                                    action['nextResponse'] = actionToWatch.nextResponse;
                                    action['idtoWatch'] = actionToWatch.actionId;
                                    if(actionToWatch.byChaosRun) {
                                        action['byChaosRun'] = actionToWatch.byChaosRun;
                                    }
                                    actionsWatched[''+action.getId()] = action;
                                }
                                //remove from actionsToWatch
                                //we just copy everything needed(nextError,nextResponse,bla) to actionsWatched, no need to keep this actoinToWatch around
                                delete actionsToWatch[key];
                            }
                        }
                    }//end of if actionsToWatch is not empty
                    //udpate action card on the left side anyway
                    $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                        "id": actions[c].getId(),
                        "state": "RUNNING",
                        "sentTime": performance.now()
                    });


                }
            }

            var ret = config["fn"].call(config["scope"], auraXHR, actions, method, options);


            return ret;
    }

    function bootstrapActionsInstrumentation() {

        $A.installOverride("enqueueAction", OnEnqueueAction);
        $A.installOverride("Action.finishAction", OnFinishAction);
        $A.installOverride("Action.abort", OnAbortAction);
        $A.installOverride("ClientService.send", OnSendAction);
        $A.installOverride("Action.runDeprecated", OnActionRunDeprecated);
        $A.installOverride("ClientService.decode", onDecode);

        function OnEnqueueAction(config, action, scope) {
            var ret = config["fn"].call(config["scope"], action, scope);

            var data =  {
                "id"         : action.getId(),
                "params"     : $Aura.Inspector.safeStringify(action.getParams()),
                "abortable"  : action.isAbortable(),
                "storable"   : action.isStorable(),
                "background" : action.isBackground(),
                "state"      : action.getState(),
                "isRefresh"  : action.isRefreshAction(),
                "defName"    : action.getDef()+"",
                "fromStorage": action.isFromStorage(),
                "enqueueTime": performance.now(),
                "storageKey" : action.getStorageKey()
            };

            $Aura.Inspector.publish("AuraInspector:OnActionEnqueue", data);

            return ret;
        }

        function OnFinishAction(config, context) {
            var startCounts = {
                "created": $Aura.Inspector.getCount("component_created")
                // "rendered": $Aura.Inspector.getCount("component_rendered"),
                // "rerendered": $Aura.Inspector.getCount("component_rerendered"),
                // "unrendered": $Aura.Inspector.getCount("component_unrendered")
            };

            var ret = config["fn"].call(config["scope"], context);

            var action = config["self"];

            var howDidWeModifyResponse = undefined;
            if(actionsWatched[action.getId()]) {
                var actionWatched = actionsWatched[action.getId()];
                if(actionWatched.nextError != undefined) {
                    howDidWeModifyResponse = "responseModified_error";
                } else if (actionWatched.nextResponse != undefined) {
                    howDidWeModifyResponse = "responseModified_modify";
                } else {
                    howDidWeModifyResponse = "responseModified_drop"
                }
                delete actionsWatched[action.getId()];
            }

            var data = {
                "id": action.getId(),
                "state": action.getState(),
                "fromStorage": action.isFromStorage(),
                "returnValue": $Aura.Inspector.safeStringify(action.getReturnValue()),
                "error": $Aura.Inspector.safeStringify(action.getError()),
                "howDidWeModifyResponse": howDidWeModifyResponse,
                "finishTime": performance.now(),
                "stats": {
                    "created": $Aura.Inspector.getCount("component_created") - startCounts.created
                    // "rendered": $Aura.Inspector.getCount("component_rendered") - startCounts.rendered,
                    // "rerendered": $Aura.Inspector.getCount("component_rerendered") - startCounts.rerendered,
                    // "unrendered": $Aura.Inspector.getCount("component_unrendered") - startCounts.unrendered
                }
            };

            $Aura.Inspector.publish("AuraInspector:OnActionStateChange", data);

            return ret;
        }

        function OnAbortAction(config, context) {
            var ret = config["fn"].call(config["scope"], context);

            var action = config["self"];

            var data = {
                "id": action.getId(),
                "state": action.getState(),
                "finishTime": performance.now()
            };

            $Aura.Inspector.publish("AuraInspector:OnActionStateChange", data);

            return ret;
        }



        function OnActionRunDeprecated(config, event) {
            var action = config["self"];
            var startTime = performance.now();
            var data = {
                "actionId": action.getId()
            };

            $Aura.Inspector.publish("AuraInspector:OnClientActionStart", data);

            var ret = config["fn"].call(config["scope"], event);

            data = {
                "actionId": action.getId(),
                "name": action.getDef().getName(),
                "scope": action.getComponent().getGlobalId()
            };

            $Aura.Inspector.publish("AuraInspector:OnClientActionEnd", data);
        }
    }



    function bootstrapPerfDevTools() {
        $A.PerfDevToolsEnabled = true;

        var OPTIONS = {
                componentCreation  : true,
                componentRendering : true,
                timelineMarks      : false,
                transactions       : true,
            },
            CMP_CREATE_MARK   = 'componentCreation',
            START_SUFIX       = 'Start',
            END_SUFIX         = 'End',
            CMP_CREATE_END    = CMP_CREATE_MARK + END_SUFIX,
            SAMPLING_INTERVAL = 0.025;


        $A.PerfDevTools = {
            init: function (cfg) {
                cfg || (cfg = {});
                this._initializeOptions(cfg);
                this._hooks = {};
                this.collector = {
                    componentCreation : [],
                    rendering: []
                };
                this._initializeHooks();
            },
            clearMarks: function (marks) {
                this._resetCollector(marks);
            },
            _initializeOptions: function (cfg) {
                this.opts = {
                    componentCreation  : cfg.componentCreation  || OPTIONS.componentCreation,
                    componentRendering : cfg.componentRendering || OPTIONS.componentRendering,
                    timelineMarks      : typeof cfg.timelineMarks === 'boolean' ? cfg.timelineMarks : OPTIONS.timelineMarks,
                    transactions       : cfg.transactions || OPTIONS.transactions
                };
            },
            _initializeHooks: function () {
                if (this.opts.componentCreation /* && $A.getContext().mode !== 'PROD'*/) {
                    this._initializeHooksComponentCreation();
                }
                // It should work in all modes
                this._initializeHooksTransactions();

            },
            _createNode: function (name, mark, id) {
                return {
                    id  : id,
                    mark: mark,
                    name: name,
                    timestamp: window.performance.now(),
                };
            },
            _resetCollector: function (type) {
                if (type) {
                    this.collector[type] = [];
                    return;
                }

                for (var i in this.collector) {
                    this.collector[i] = [];
                }
            },
            _initializeHooksTransactions: function () {
                $A.metricsService.onTransactionEnd(this._onTransactionEnd.bind(this));
            },
            _onTransactionEnd: function (t) {
                setTimeout(function (){
                    // We do a timeout to give a chance to
                    // other transactionEnd handlers to modify the transaction
                    $Aura.Inspector.publish("Transactions:OnTransactionEnd", $Aura.Inspector.safeStringify(t));
                }, 0);
            },

            _initializeHooksComponentCreation: function () {
                this._hookOverride("ComponentService.createComponentPriv", CMP_CREATE_MARK);
            },
            getComponentCreationProfile: function () {
                return this._generateCPUProfilerDataFromMarks(this.collector.componentCreation);
            },
            _hookOverride: function(key, mark) {
                $A.installOverride(key, function(){
                    var config = Array.prototype.shift.apply(arguments);
                    var cmpConfig = arguments[0];
                    var descriptor = $A.util.isString(cmpConfig) ? cmpConfig : (cmpConfig["componentDef"]["descriptor"] || cmpConfig["componentDef"]) + '';

                    var collector = this.collector[mark];
                    collector.push(this._createNode(descriptor, mark + START_SUFIX));

                    var ret = config["fn"].apply(config["scope"], arguments);

                    var id = ret.getGlobalId && ret.getGlobalId() || "([ids])";
                    collector.push(this._createNode(descriptor, mark + END_SUFIX, id));

                    return ret;
                }.bind(this), this);
            },
            _hookMethod: function (host, methodName, mark) {
                var self = this;
                var hook = host[methodName];
                var collector = this.collector[mark];

                this._hooks[methodName] = hook;
                host[methodName] = function (config) {
                    if (Array.isArray(config)) {
                        return hook.apply(this, arguments);
                    }

                    var descriptor = (config.componentDef.descriptor || config.componentDef) + '',
                        collector  = self.collector[mark];

                    // Add mark
                    collector.push(self._createNode(descriptor, mark + START_SUFIX));

                    // Hook!
                    var result = hook.apply(this, arguments);
                    var id = result.getGlobalId && result.getGlobalId() || '([ids])';

                    // End mark
                    collector.push(self._createNode(descriptor, mark + END_SUFIX, id));
                    return result;
                };
            },
            _generateCPUProfilerDataFromMarks: function (marks) {
                if(!marks || !marks.length) { return {}; }

                //global stuff for the id
                var id = 0;
                function nextId () {return ++id;}
                function logTree(stack, mark) {
                    // UNCOMMENT THIS FOR DEBUGGING PURPOSES:
                    // var d = '||| ';
                    // console.log(Array.apply(0, Array(stack)).map(function(){return d;}).join(''), mark);
                }

                function hashCode(name) {
                    var hash = 0, i, chr, len;
                    if (name.length == 0) return hash;
                    for (i = 0, len = name.length; i < len; i++) {
                        chr   = name.charCodeAt(i);
                        hash  = ((hash << 5) - hash) + chr;
                        hash |= 0; // Convert to 32bit integer
                    }
                    return Math.abs(hash);
                }

                function generateNode (name, options) {
                    options || (options = {});
                    return  {
                        functionName: name || ("Random." + Math.random()),
                        scriptId: "3",
                        url: options.details || "",
                        lineNumber: 0,
                        columnNumber: 0,
                        hitCount: options.hit || 0,
                        callUID: hashCode(name),
                        children: [],
                        deoptReason: "",
                        id: nextId()
                    };
                }

                var endText    = CMP_CREATE_END,
                    startTime  = marks[0].timestamp, // Get from first and last mark
                    endTime    = marks[marks.length - 1].timestamp,
                    markLength = marks.length,
                    duration   = endTime - startTime,
                    sampling   = SAMPLING_INTERVAL,
                    root       = generateNode("(root)"),
                    idle       = generateNode("(idle)"),
                    current    = generateNode(marks[0].name),
                    stack      = [current, root];

                current._startTime = marks[0].timestamp;

                function generateTimestamps(startTime, endTime) {
                    var diff  = endTime - startTime,
                        ticks = Math.round(diff / sampling), // every N miliseconds
                        time  = startTime,
                        ts    = [time];

                    for (var i = 1; i < ticks; i++) {
                        time += sampling;
                        ts.push(time);
                    }
                    return ts;
                }

                function generateSamples (root, size, idle) {
                    var samples = new Array(size).join(","+idle.id).split(idle.id);
                        samples[0] = idle.id;
                    var currentIndex = 0;
                    var idleHits = 0;


                    function calculateTimesForNode(node) {
                        if (node._idleHits) {
                            currentIndex += node._idleHits;
                            idleHits += node._idleHits;
                        }

                        for (var i = 0; i < node.hitCount; i++) {
                            samples[currentIndex + i] = node.id;
                        }
                        currentIndex += node.hitCount;

                        for (var j = 0; j < node.children.length; j++) {
                            calculateTimesForNode(node.children[j]);
                        }

                    }
                    calculateTimesForNode(root, root.id);
                    idle.hitCount = Math.max(0, size - currentIndex + idleHits); //update idle with remaining hits
                    return samples;
                }

                logTree(stack.length - 1, 'open: ' + marks[0].name);
                for (var i = 1; i < markLength; i++) {
                    tmp = marks[i];
                    if (stack[0].functionName === tmp.name && tmp.mark === endText) {
                        tmpNode = stack.shift();
                        tmpNode._endTime = tmp.timestamp;
                        tmpNode._totalTime = tmpNode._endTime - tmpNode._startTime;
                        tmpNode._childrenTime = tmpNode.children.reduce(function (p, c) {return p + c._totalTime;}, 0);
                        tmpNode._selfTime = tmpNode._totalTime - tmpNode._childrenTime;
                        tmpNode.hitCount = Math.floor(tmpNode._selfTime / sampling);
                        tmpNode._cmpId = tmp.id;
                        tmpNode._childComponentCount += tmpNode.children.length;

                        //push into the parent
                        stack[0].children.push(tmpNode);
                        stack[0]._childComponentCount += tmpNode._childComponentCount;
                        logTree(stack.length, 'close: ' + tmp.name + ' selfTime: ' + tmpNode._selfTime.toFixed(4) + '| totalTime: ' + tmpNode._totalTime.toFixed(4));
                    } else {

                        current = generateNode(tmp.name);
                        current._startTime = tmp.timestamp;
                        current._childComponentCount = 0;
                        if (stack.length === 1 && ((markLength - i) > 1)) {
                            current._idleHits = Math.floor((tmp.timestamp - marks[i - 1].timestamp) / sampling);
                        }

                        stack.unshift(current);
                        logTree(stack.length - 1, 'open: ' + tmp.name);
                    }
                }
                root.children.push(idle);
                var timestamp = generateTimestamps(startTime, endTime);
                var samples = generateSamples(root, timestamp.length, idle);

                return {
                    head: root,
                    startTime: startTime / 1000,
                    endTime : endTime / 1000,
                    timestamp: timestamp,
                    samples : samples,
                };
            }
        };
    };




})(this);
