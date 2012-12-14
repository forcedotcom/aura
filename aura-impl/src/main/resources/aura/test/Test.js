/*
 * Copyright (C) 2012 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint evil: true, sub : true*/
/**
 * @namespace Test Framework
 * 
 */
var Test = function(){
    //#include aura.test.Test_private

    window.onerror = (function(){
        var origHandler = window.onerror;
        var newHandler = function(msg, url, line){
            var error = { message: "Uncaught js error: " + msg };
            if(url){
                error["url"] = url;
            }
            if(line){
                error["line"] = line;
            }
            priv.errors.push(error);
        };

        if(origHandler) {
            return function(){ return origHandler.apply(this, arguments) || newHandler.apply(this, arguments); };
        } else {
            return newHandler;
        }
    })();

    /**
     * @constructor
     */
    var test = {
    	/**
    	 * Used to keep track of errors happening in test modes.
    	 * @private
    	 */
        logError : function(msg, e){
            var p, err = { "message": msg + ": " + (e.message || e.toString()) };
            for (p in e){
                if(p=="message"){
                    continue;
                }
                err[p] = "" + e[p];
            }
            priv.errors.push(err);
        },

        /**
         * @private
         */
        run : function(name, code, count){
            // check if test has already started running, since frame loads from layouts may trigger multiple runs
            if(priv.complete >= 0){
                return;
            }
            priv.complete = 2;
            priv.timeoutTime = new Date().getTime() + 5000 * count;
            if(!count){
                count = 1;
            }
            var cmp = $A.getRoot();
            var suite = aura.util.json.decode(code);
            var stages = suite[name]["test"];
            stages = $A.util.isArray(stages) ? stages : [stages];

            var doTearDown = function() {
                // check if already tearing down
                if(priv.complete > 1){
                    priv.complete = 1;
                }else {
                    return;
                }
                try{
                    if(suite["tearDown"]){
                        suite["tearDown"].call(suite, cmp);
                    }
                    setTimeout(function(){priv.complete--;}, 100);
                }catch(e){
                    $A.test.logError("Error during tearDown", e);
                    priv.complete = 0;
                }
            };
            
            /**
             * @private
             */
            var continueWhenReady = function() {
                if(priv.complete < 2){
                    return;
                }
                if(priv.errors.length > 0){
                    doTearDown();
                    return;
                }
                try{
                    if((priv.complete > 1) && (new Date().getTime() > priv.timeoutTime)){
                        if(priv.waits.length > 0){
                            var texp = priv.waits[0].expected;
                            if($A.util.isFunction(texp)){
                                texp = texp().toString();
                            }
                            var tact = priv.waits[0].actual;
                            var val = tact;
                            if($A.util.isFunction(tact)){
                                val = tact().toString();
                                tact = tact.toString();
                            }
                            throw new Error("Test timed out waiting for: " + tact + "; Expected: " + texp + "; Actual: " + val);
                        }else{
                            throw new Error("Test timed out");
                        }
                    }
                    if(priv.complete > 2){
                        setTimeout(continueWhenReady, 200);
                    }else{
                        if(priv.waits.length > 0){
                            var exp = priv.waits[0].expected;
                            if($A.util.isFunction(exp)){
                                exp = exp();
                            }
                            var act = priv.waits[0].actual;
                            if($A.util.isFunction(act)){
                                act = act();
                            }
                            if(exp === act){
                                var callback = priv.waits[0].callback;
                                if(callback){
                                    //Set the suite as scope for callback function. Helpful to expose test suite as 'this' in callbacks for addWaitFor
                                    callback.call(suite);
                                }
                                priv.waits.shift();
                                setTimeout(continueWhenReady, 1);
                            }else{
                                setTimeout(continueWhenReady, 200);
                            }
                        }else if(stages.length === 0){
                            doTearDown();
                        }else{
                            priv.lastStage = stages.shift();
                            priv.lastStage.call(suite, cmp);
                            setTimeout(continueWhenReady, 1);
                        }
                    }
                }catch(e){
                    if(priv.lastStage) {
                        e["lastStage"] = priv.lastStage;
                    }
                    $A.test.logError("Test error", e);
                    doTearDown();
                }
            };
            try {
                if(suite["setUp"]){
                    suite["setUp"].call(suite, cmp);
                }
            }catch(e){
                $A.test.logError("Error during setUp", e);
                doTearDown();
            }
            setTimeout(continueWhenReady, 1);
        },

        /**
         * Wait for expected === actual, or if actual is not provided, then expected === true before invoking callback
         * @param {Object} expected
         * @param {Object} actual
         * @param {function} callback
         */ 
        addWaitFor : function(expected, actual, callback){
            if(arguments.length === 1){
                if(!$A.util.isFunction(expected)){
                    throw new Error("addWaitFor expects a function to return true, or 2 things to compare for equality");
                }
                priv.waits.push({ expected: true, actual: expected, callback : callback });
            } else {
                priv.waits.push({ expected: expected, actual: actual, callback : callback });
            }
        },
        
        /**
         * Get an instance of a server controller by name.
         * Expects you to provide the parameters and call back function.
         * 
         * @param {Component} cmp
         * @param {String} name
         * @param {Object} params
         * @param {function} callback
         */
        getServerControllerInstance:function(cmp,name, params, callback){
            var cntlr = cmp.get(name);
            cntlr.setParams(params);
            cntlr.setCallback(cmp, callback);
            return cntlr;
        },

        /**
         * See if there are any pending actions 
         */
        isActionPending : function() {
            return $A.clientService["priv"].inRequest;
        },

        callServerAction : function(action, doImmediate){
            if(priv.complete === 0){
                return;
            }
            //Increment Complete to indicate that a asynchronous call is going to be initiated, selenium will
            //wait till complete comes down to 0 which indicates all asynchronous calls were complete
            priv.complete++;
            var actions = $A.util.isArray(action) ? action : [action];
            var cmp = $A.getRoot();
            try{
                if (!!doImmediate){
                    var requestConfig = {
                        "url": $A["clientService"]["priv"].host + '/aura',
                        "method": 'POST',
                        "scope" : cmp,
                        "callback" :function(response){
                            var msg = $A["clientService"]["priv"].checkAndDecodeResponse(response);
                            if ($A.util.isUndefinedOrNull(msg)) {
                                    for ( var k = 0; k < actions.length; k++) {
                                    $A.test.logError("Unable to execute action", actions[k]);
                                    }
                            }
                            var serverActions = msg["actions"];
                            for (var i = 0; i < serverActions.length; i++) {
                                    for ( var j = 0; j < serverActions[i]["error"].length; j++) {
                                    $A.test.logError("Error during action", serverActions[i]["error"][j]);
                                    }
                            }
                            priv.complete--;
                        },
                        "params" : {
                            "message": $A.util.json.encode({"actions" : actions}),
                            "aura.token" : $A["clientService"]["priv"].token,
                            "aura.context" : $A.getContext().encodeForServer(),
                            "aura.num" : 0
                        }
                    };
                    $A.util.transport.request(requestConfig);
                } else {
                    $A.clientService.runActions(actions, cmp , function(msg){
                        for(var i=0;i<msg["errors"].length;i++){
                            $A.test.logError("Error during action", msg["errors"][i]);
                        }
                        priv.complete--;
                    });
                }
            }catch(e){
                // If trying to runAction() fails with an error, catch that error, signal that the attempt to run
                // server action was complete and throw error.
                priv.complete--;
                throw e;
            }
        },

        /**
         * @private
         */
        runAfterIf : function(conditionFunction, callback, intervalInMs){
            if(priv.complete === 0){
                return;
            }
            try{
                if(conditionFunction()){
                    if(callback){
                       callback();
                    }
                }else{
                    priv.complete++;
                    if(!intervalInMs){
                        intervalInMs = 500;
                    }
                    setTimeout(function(){
                            aura.test.runAfterIf(conditionFunction, callback);
                            priv.complete--;
                        },intervalInMs);
                    return;
                }
            }catch(e){
                $A.test.logError("Error in runAfterIf", e);
            }
        },

        /**
         * set test timeout in miliseconds
         * @param {int} timeoutMsec
         */
        setTestTimeout : function(timeoutMsec){
            priv.timeoutTime = new Date().getTime() + timeoutMsec;
        },

        /**
         * @private
         */
        isComplete : function(){
            return priv.complete === 0;
        },

        /**
         * Get the list of errors encountered by the js test
         */
        getErrors : function(){
            if (priv.errors.length > 0){
                return aura.util.json.encode(priv.errors);
            }else{
                return "";
            }
        },

        /**
         * get the string representation of errors encountered by a js test
         */
        getDump : function() {
            var status = "";
            if (priv.errors.length > 0) {
                status += "errors {" + $A.test.print($A.test.getErrors()) + "} ";
            }
            if (priv.waits.length > 0 ) {
                var actual;
                try {
                    actual = priv.waits[0].actual();
                } catch (e) {}
                status += "waiting for {" + $A.test.print(priv.waits[0].expected) + "} currently {" + $A.test.print(actual) + "} from {" + $A.test.print(priv.waits[0].actual) + "} after {" + $A.test.print(priv.lastStage) + "} ";
            } else if (!$A.util.isUndefinedOrNull(priv.lastStage)) {
                status += "executing {" + $A.test.print(priv.lastStage) + "} ";
            }
            return status;
        },

        /**
         * Essentially a toString method. Returns a string even for undefined/null value.
         * @param {Object} value
         */
        print : function(value) {
            if (value === undefined) {
                return "undefined";
            } else if (value === null) {
                return "null";
            } else if ("string" == typeof(value)) {
                return '"' + value + '"';
            } else {
                return value.toString();
            }
        },

        /**
         * Assert that if(condition) check evaluates to true. 
         * @param {Object} condition
         * @param {String} assertMessage
         * @example 
         * Positive: assertTruthy("helloWorld") 
         * Negative: assertTruthy(null)
         */
        assertTruthy : function(condition, assertMessage) {
            if (!condition) {
                if(assertMessage){
                    assertMessage += " : "+condition;
                }
                else{
                    assertMessage = "Assertion Failure: expected {Truthy}, but Actual : {" + condition + "}";
                }
                throw new Error(assertMessage);
            }
        },

         /**
         * Assert that if(condition) check evaluates to false. 
         * @param {Object} condition
         * @param {String} assertMessage
         * @example 
         * Negative: assertFalsy("helloWorld") 
         * Postive: assertFalsy(null)
         */
        assertFalsy : function(condition, assertMessage) {
            if (condition) {
                if(assertMessage){
                    assertMessage += " : "+condition;
                }
                else{
                    assertMessage = "Assertion Failure: expected {Falsy}, but Actual : {" + condition + "}";
                }
                throw new Error(assertMessage);
            }
        },

         /**
         * Assert that if(condition) check evaluates to true. 
         * @param {Object} condition
         * @param {String} assertMessage
         * @example 
         * Positive: assert("helloWorld") 
         * Negative: assert(null)
         */
        assert : function(condition, assertMessage) {
            aura.test.assertTruthy(condition, assertMessage);
        },
        
        
		/**
		 * Assert that the two values provided are equal
		 * @param {Object} arg1
		 * @param {Object} arg2
		 * @param {String} assertMessage
		 */
        assertEquals : function(arg1, arg2, assertMessage){
            if(arg1!==arg2){
                if(!assertMessage){
                    assertMessage = "Values not equal";
                }
                assertMessage += "\nExpected: {"+arg1 +"} but Actual: {"+arg2+"}";
                if(typeof arg1 !== typeof arg2){
                    assertMessage += "\n. Type Mismatch.";
                }
                 throw new Error(assertMessage);
            }
        },
        
        /**
         * Assert that the condition === true
         * @param {boolean} condition
         * @param {String} assertMessage
         */
        assertTrue : function(condition, assertMessage){
               if(!assertMessage){
                   assertMessage = "Expected: {True}, but Actual: {False} ";
               }
            aura.test.assertEquals(true,condition,assertMessage);
        },
        
        /**
         * Assert that the condition === false
         * @param {boolean} condition
         * @param {String} assertMessage
         */
        assertFalse :function(condition, assertMessage){
               if(!assertMessage){
                   assertMessage = "Expected: {False}, but Actual: {True} ";
               }
               aura.test.assertEquals(false,condition,assertMessage);
        },
        
         /**
         * Assert that the value passed in is either undefined or null
         * @param {Object} arg1
         * @param {String} assertMessage
         */
        assertUndefinedOrNull : function(arg1, assertMessage){
            if(!assertMessage){
                assertMessage = "Assertion failure, Expected: {Undefined or Null}, but Actual: {"+arg1+"} ";
            }
               aura.test.assertTrue($A.util.isUndefinedOrNull(arg1),assertMessage);
        },
        
         /**
         * Assert that value === null
         * @param {Object} arg1
         * @param {String} assertMessage
         */
        assertNull : function(arg1, assertMessage){
            if(!assertMessage){
                assertMessage = "Assertion failure, Expected: {Null}, but Actual: {"+arg1+"} ";
            }
               aura.test.assertTrue(arg1===null,assertMessage);
        },
        
        /**
         * Assert that value !== null
         * @param {Object} arg1
         * @param {String} assertMessage
         */
        assertNotNull : function(arg1, assertMessage){
            if(!assertMessage){
                assertMessage = "Assertion failure, Expected: {Non Null}, but Actual:{"+arg1+"}";
            }
            aura.test.assertTrue(arg1!==null,assertMessage);
        },
        
        /**
         * Throws an Error, making a js test fail with the message specifid
         * @param {String} assertMessage
         */
        fail : function(assertMessage){
            if(assertMessage){
                throw new Error(assertMessage);
            }else{
                throw new Error("Assertion failure");
            }
        },

        getPrototype : function(instance){
            return instance && (Object.getPrototypeOf && Object.getPrototypeOf(instance)) || instance.__proto || instance.constructor.prototype;
        },

        overrideFunction : function(instance, originalFunction, newFunction){
            var override = newFunction;
            override.originalInstance = instance;
            override.originalFunction = originalFunction;
            override["restore"] = function(){
                var toRestore = override.originalInstance;
                for(var q in toRestore){
                    if(toRestore[q] === override){
                        var original = override.originalFunction;
                        // if we're restoring to an override, update it's pointer too
                        if(original.originalInstance){
                            original.originalInstance = override.originalInstance;
                        }
                        toRestore[q] = original;
                    }
                }
            };

            // if we're overriding an override, update it's pointer to restore to us
            if(originalFunction.originalInstance){
                originalFunction.originalInstance = override;
            }

            for(var p in instance){
                if(instance[p] === originalFunction){
                    instance[p] = override;
                }
            }
            return override;
        },

        addFunctionHandler : function(instance, originalFunction, newFunction, postProcess){
            var handler = newFunction;
            return $A.test.overrideFunction(instance, originalFunction, postProcess ?
                function(){
                    handler.apply(this, originalFunction.apply(this, arguments), arguments);
                } :
                function(){
                    handler.apply(this, arguments);
                    originalFunction.apply(this, arguments);
                }
            );
        },

        getOuterHtml : function(node) {
            return node.outerHTML || (function(n){
                var div = document.createElement('div');
                div.appendChild(n.cloneNode(true));
                var h = div.innerHTML;
                div = null;
                return h;
            })(node);
        },

        /** 
         * Returns text content of the Dom element. Tries "innerText" followed by "textContext" to take browser differens into account.
         * @param {DOMElement} node 
         */
        getText : function(node) {
            var t = node.innerText;
            if($A.util.isUndefinedOrNull(t)){
                t = node.textContent;
            }
            return (typeof t == "string") ? t : node.innerText;
        },
        
        /**
         * Given a component, this function return the textContent of all elements rendered by this component.
         * @param {Component} component
         */
        getTextByComponent : function(component){
            var ret = "";
            if(component){
                var elements = component.getElements();
                if(elements){
                    //If the component has only one element
                    var ele = elements["element"];
                    if(ele && ele.nodeType !== 8/*COMMENT*/){
                        return aura.test.getText(ele);
                    }
                    //If the component has an array of elements
                    for(var i=0;elements[i];i++){
                        if(elements[i].nodeType !== 8/*COMMENT*/){
                            ret += aura.test.getText(elements[i]);
                        }
                    }
                }
            }
            return ret;
        },

        /**
         * Get value for the specified style for the element provided
         * 
         * @param {DOMElement} elem
         * @param {String} Style 
         */
        getStyle : function(elem, style){
            var val = "";
            if(document.defaultView && document.defaultView.getComputedStyle){
                val = document.defaultView.getComputedStyle(elem, "").getPropertyValue(style);
            }
            else if(elem.currentStyle){
                style = style.replace(/\-(\w)/g, function (s, ch){
                    return ch.toUpperCase();
                });
                val = elem.currentStyle[style];
            }
            return val;
        },

        /**
         * Filters out comment nodes from a list nodes provided
         * @param {Array|Object} nodes
         */
        getNonCommentNodes : function(nodes){
            var ret = [];
            if($A.util.isObject(nodes)){
                for(var i in nodes){
                    if(nodes[i].nodeType && nodes[i].nodeType !== 8) {
                        ret.push(nodes[i]);
                    }
                }
            }else{
                for(var j = 0; j < nodes.length; j++){
                    if(8 !== nodes[j].nodeType) {
                        ret.push(nodes[j]);
                    }
                }
            }
            return ret;
        },

        isNodeDeleted : function(node){
            if (!node.parentNode){
                return true;
            }
            var div = document.createElement("div");
            document.documentElement.appendChild(div);
            aura.util.removeElement(div);
            return node.parentNode === div.parentNode;
        },

        select : function() {
            return document.querySelectorAll.apply(document, arguments);
        },
        
        contains : function(test, target){
        	if (!$A.util.isUndefinedOrNull(test)) {
        		return (test.indexOf(target) != -1);
        	}
        	return false;
        },

        // Used by tests to modify framework source to trigger JS last mod update
        dummyFunction : function(){
            return '@@@TOKEN@@@';
        },

        // Checks if undefined variable message is correct. Message varies across browsers.
        checkUndefinedMsg : function(variable, msg) {
            var chromeMsg = variable + " is not defined";
            var ieMsg = "\'" + variable + "\' is undefined";
            var iosMsg = "Can't find variable: " + variable;

            if (msg == chromeMsg || msg == ieMsg || msg == iosMsg) {
                return true;
            } else {
                return false;
            }
        }
    };

    //#include aura.test.Test_export
    return test;
};
