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

    // Attach to the global object so our integrations can access it, but
    // use a symbol so it doesn't create a global property.
    global[$Symbol] = $Aura;

    $Aura.actions = {
        /*the event handler for AuraInspector:OnActionToWatchEnqueue
        called by AuraInspectorActionsView.drop and AuraInspectorActionsView_OnEnqueueNextResponseForAction
        var dataToPublish = { 
                            'actionName': actionName, //no need
                            'actionParameter':actionParameter, //no need for here...yet
                            'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
                            'actionIsStorable': actionIsStorable,
                            'actionStorageKey': actionStorageKey,
                            'nextResponse': nextResponse};
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
            //we only remove the response from storage once
            if( aleadyAdded === false ) {
                //remove the stored response from action storage -- if there is any
                if(data.actionIsStorable && data.actionIsStorable === true) {
                    var actionsStorage = $A.storageService.getStorage("actions");
                    var actionStorageKey = data.actionStorageKey;//data.actionName+JSON.stringify(data.actionParameter);//
                    if(actionsStorage && actionStorageKey && actionStorageKey.length > 0) {
                        actionsStorage.get(actionStorageKey)
                        .then(
                            function() {
                                console.log("find storage item for action:", data);
                                actionsStorage.remove(actionStorageKey)
                                .then(function () {
                                    console.log("successfully remove storage for action:", data);
                                    //notify Storage View
                                    $Aura.Inspector.publish("AuraInspector:RemoveStorageData", {'storageKey': actionStorageKey});
                                });
                            },
                            function(e) {
                                console.log("cannot find storage item for action:", data);
                            }
                        );
                    } else {
                        console.log("actionStorageKey missing, or there is no actionsStorage(what?)", data);
                    }
                }
            }//end of aleadyAdded is false
            
            actionsToWatch[data.actionName] = data; 
            if(data.nextResponse) {
                //override decode
                //console.log("AddActionToWatch, nextResponse:", data.nextResponse);
                $A.uninstallOverride("ClientService.decode", onDecode);
                $A.installOverride("ClientService.decode", onDecode);
            } else {
                //override send                
                //actionsToDrop.push(data);
                //we need to keep a map between actionID --> action , right before send
                $A.uninstallOverride("ClientService.send", OnSendAction);
                $A.installOverride("ClientService.send", OnSendAction);
            }
        },



        "AuraDevToolService.RemoveActionsToWatch": function() {
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
                console.log('Could not attach AuraDevTools Extension.');
            }
        }
    };

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
    $Aura.Inspector.subscribe("AuraInspector:OnActionToWatchClear", $Aura.actions["AuraDevToolService.RemoveActionsToWatch"])

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

        this.getComponent = function(componentId, options) {
            var component = $A.getComponent(componentId);
            // var configuration = {
            //     "body" : true // Should we serialize the body?
            // };
            var configuration = Object.assign({
                "attributes": true, // True to serialize the attributes, if you just want the body you can set this to false and body to true. (Good for serializing supers)
                "body": true, // Serialize the Body? This can be expensive so you can turn it off.
                "elementCount": false, // Count all child elements of all the elements associated to a component.
                "model": false // Serialize the model data as well
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
                        "valid": true,
                        "expressions": {},
                        "attributes": {},
                        "attributeValueProvider": getValueProvider(component.getAttributeValueProvider()),
                        "facetValueProvider": getValueProvider(component.getComponentValueProvider()),
                        "__proto__": null, // no inherited properties
                        "elementCount": 0,
                        "rerender_count": this.getCount(component._$getSelfGlobalId$() + "_rerendered")

                        // Added Later
                        //,"super": ""
                        //,"model": null
                    };

                    if(configuration.attributes) {
                        var attributes = component.getDef().getAttributeDefs();
                        attributes.each(function(attributeDef) {
                            var key = attributeDef.getDescriptor().getName();
                            var value;
                            var rawValue;
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
                                output.attributes[key] = value;
                            } else {
                                output.attributes[key] = rawValue;
                            }
                        }.bind(this));
                    } else if(!configuration.attributes && configuration.body) {
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

                    if(configuration.elementCount) {
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

                    if(configuration.model) {
                        var model = component.getModel();
                        if(model) {
                            output["model"] = model.data;
                        }
                    }

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
            var toJSON = InvalidComponent.prototype.toJSON;
            var toJSONCmp = Component.prototype.toJSON;
            delete InvalidComponent.prototype.toJSON;
            delete Component.prototype.toJSON;
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
                            value.$serId = increment++;
                        }
                    }

                    return value;
                });

            } catch(e) {
                console.error("AuraInspector: Error serializing object to json.");
            }
            

            visited.forEach(function(item){
                if("$serId$" in item) {
                    delete item["$serId"];
                }
            });

            InvalidComponent.prototype.toJSON = toJSON;
            Component.prototype.toJSON = toJSONCmp;

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

            while(!("_$getSelfGlobalId$" in valueProvider)) {
                valueProvider = valueProvider.getComponent();
            }

            output["globalId"] = valueProvider._$getSelfGlobalId$();

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
                window.postMessage({
                    "action": PUBLISH_BATCH_KEY,
                    "data": postMessagesQueue
                }, window.location.href);

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
        // wrapFunction(Component.prototype, "render", function(){
        //     $Aura.Inspector.count("component_rendered");
        //     $Aura.Inspector.count(this.getGlobalId() + "_rendered");
        // });

        wrapFunction(Component.prototype, "rerender", function(){
            $Aura.Inspector.count("component_rerendered");
            $Aura.Inspector.count(this.getGlobalId() + "_rerendered");
        });

        // No way of displaying this at the moment.
        // wrapFunction(Component.prototype, "unrender", function(){
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
            var parameters = output(event.getParams());

            data = {
                "id": eventId,
                "caller": arguments.callee.caller.caller.caller+"",
                "name": event.getDef().getDescriptor().getQualifiedName(),
                "parameters": parameters,
                "sourceId": source ? source.getGlobalId() : "",
                "startTime": startTime,
                "endTime": performance.now(),
                "type": event.getDef().getEventType()
            };

            $Aura.Inspector.publish("AuraInspector:OnEventEnd", data);

            return ret;
        }

        function output(data) {
            var componentToJSON = Component.prototype.toJSON;
            var invalidComponentToJSON = InvalidComponent.prototype.toJSON;
            delete Component.prototype.toJSON;
            delete InvalidComponent.prototype.toJSON;

            var json = $Aura.Inspector.safeStringify(data, function(key, value){
                if($A.util.isComponent(value)) {
                    return "[Component] {" + value.getGlobalId() + "}";
                } else if(value instanceof Function) {
                    return value +"";
                }
                return value;
            });

            Component.prototype.toJSON = componentToJSON;
            InvalidComponent.prototype.toJSON = invalidComponentToJSON;

            return json;
        }
    }

    //how expensive is JSON.parse?  can we save the trouble by just doing string.indexof
    function containsActionsWeAreWatching(oldResponseText) {
        for(actionWatched in actionsWatched) {
            if(oldResponseText.indexOf(actionWatched) > 0 ) {
                return true;
                break;
            }
        }
        return false;
    }

    function isNonEmptyArray(obj) {
        if(obj && typeof obj === "object" && obj instanceof Array && obj.length && obj.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    function isTrueObject(obj) {
        if(obj && typeof obj === "object" && !(obj instanceof Array)) {
            return true;
        } else {
            return false;
        }
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
                if(key && nextResponse) {
                    var returnValuek = returnValue[key];
                    if(nextResponse[key]) {
                        returnValue[key] = nextResponse[key];
                        console.log("found a match, update response for "+key);
                        //delete nextResponse[key];
                        return true;   
                    } else {
                        var res = replaceValueInObj(returnValuek, nextResponse);
                        if(res) { return res; }
                    }
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

            if( actionsWatched != {} ) {
                for(actionWatchedId in actionsWatched) {
                    if(oldResponseText.indexOf(actionWatchedId) > 0) {
                        var actionWatched = actionsWatched[actionWatchedId];
                        if(actionWatched.nextResponse && oldResponseText.startsWith("while(1);") ) {
                            var oldResponseObj = JSON.parse(oldResponseText.substring(9, oldResponseText.length));
                            if(oldResponseObj && oldResponseObj.actions) {
                                var actionsFromOldResponse = oldResponseObj.actions;
                                for(var i = 0; i < actionsFromOldResponse.length; i++) {
                                    var returnValue = actionsFromOldResponse[i].returnValue; 
                                    responseModified = replaceValueInObj(returnValue, actionWatched.nextResponse);

                                    if(responseModified === true) {
                                        //no need to continue, returnValue now contains new response
                                        actionsFromOldResponse[i].returnValue = returnValue;
                                        break; //get out of looping over actionsFromOldResponse
                                    }
                                }//end of looping over actionsFromOldResponse
                            }//end of oldResponseObj is valid and it has actions
                            if(responseModified === true) {
                                oldResponseObj.actions = actionsFromOldResponse;
                                newResponseText = "while(1);\n"+JSON.stringify(oldResponseObj);
                                //move the action from Watching to Processed
                                $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": actionWatchedId,
                                        "idtoWatch": actionWatched.idtoWatch,
                                        "state": "RESPONSEMODIFIED",
                                        "sentTime": performance.now()//do we need this?
                                });
                                delete actionsWatched[actionWatchedId];
                                break;//get out of looping over actionsWatched
                            }
                        }//end of actionWatched has nextResponse and oldResponseText start with 'while(1);'
                    }//end of oldResponseText contains the actionWatchedId we care
                }//end of looping over actionsWatched
            }//end of actionsWatched is not empty

            if(responseModified === true) {
                var newHttpRequest = {};
                newHttpRequest = $A.util.apply(newHttpRequest, oldResponse);
                newHttpRequest["response"] = newResponseText;
                newHttpRequest["responseText"] = newResponseText;

                var ret = config["fn"].call(config["scope"], newHttpRequest, noStrip);
                return ret;
            } else {
                var ret = config["fn"].call(config["scope"], oldResponse, noStrip);
                return oldResponse;
            }
        } else {
            console.log("AuraInspectorInjectedScript.onDecode, receive bad response, just pass it along");
            var ret = config["fn"].call(config["scope"], oldResponse, noStrip);
            return oldResponse;
        }
    }

    function OnSendAction(config, auraXHR, actions, method, options) {
            if (actions) {
                for(var c=0;c<actions.length;c++) {
                    if(actionsToWatch !== {}) {
                        var action = actions[c];
                        //for(var i=0; i<actionsToWatch.length; i++) {
                        for(key in actionsToWatch) {
                            var actionToWatch = actionsToWatch[key];
                            if(actionToWatch.actionName.indexOf(action.getDef().name) >= 0) {
                                //udpate the record of what we are watching, this is mainly for action we want to modify response
                                if(actionsWatched[''+action.getId()]) {
                                    console.log("Error: we already watching this action:", action);
                                } else {
                                    //copy nextResponse to actionWatched
                                    action['nextResponse'] = actionToWatch.nextResponse;
                                    action['idtoWatch'] = actionToWatch.actionId;
                                    actionsWatched[''+action.getId()] = action;
                                }
                                if(actionToWatch.nextResponse) { //we want to modify response, so let it stay in watch list
                                    console.log("action we want to modify response are send to server:"+actionToWatch.actionName, action);
                                    //still update the left side
                                    $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": action.getId(),
                                        "state": "RUNNING",
                                        "sentTime": performance.now()
                                        });
                                    //we already copy everything to actionToWatch, no need to keep it here
                                    delete actionsToWatch[key];
                                } else { //we want to drop it, so do it
                                    //move the action from Watching to Processed
                                    $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": action.getId(),
                                        "idtoWatch": actionToWatch.actionId,
                                        "state": "DROPPED",
                                        "sentTime": performance.now()
                                    });
                                    //drop the action from auraXHR
                                    actions.splice(c, 1);
                                    //remove it from actionsToWatch
                                    delete actionsToWatch[key];
                                }
                            }
                        }
                    }
                    else {
                        $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                        "id": actions[c].getId(),
                        "state": "RUNNING",
                        "sentTime": performance.now()
                        });
                    }

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

        function OnEnqueueAction(config, action, scope) {
            var ret = config["fn"].call(config["scope"], action, scope);

            var data =  {
                "id"         : action.getId(),
                "params"     : action.getParams(),
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

            var data = {
                "id": action.getId(),
                "state": action.getState(),
                "fromStorage": action.isFromStorage(),
                "returnValue": $Aura.Inspector.safeStringify(action.getReturnValue()),
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
                    $Aura.Inspector.publish("Transactions:OnTransactionEnd", t);
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

