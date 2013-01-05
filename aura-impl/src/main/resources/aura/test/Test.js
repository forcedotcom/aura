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

/*jslint evil:true, sub:true */

var Test = function(){
    //#include aura.test.Test_private

    /**
     * Test utility functions
     * @namespace
     */
    var Test = {
		/**
		 * Asynchronously wait for a condition before continuing with the next
		 * stage of the test case.  The wait condition is checked after the
		 * current test stage is completed but before the next stage is started.
		 * @example aura.test.addWaitFor("i was updated", function(){return
		 *            element.textContent;}, function(){alert("the wait is over"});
		 * 
		 * @param {Object} expected
		 *             The value to compare against. If expected is a function,
		 *             it will evaluate it before comparison.
		 * @param {Object} testFunction
		 *             A function to evaluate and compare against expected.
		 * @param {function} callback
		 *             Invoked after the comparison evaluates to true
		 */
        addWaitFor : function(expected, testFunction, callback){
            if (!$A.util.isFunction(testFunction)) {
                throw new Error("addWaitFor expects a function to evaluate for comparison, but got: " + testFunction);
            }
            if (callback && !$A.util.isFunction(callback)) {
                throw new Error("addWaitFor expects a function for callback, but got: " + callback);
            }
            priv.waits.push({ expected:expected, actual:testFunction, callback:callback });
        },
        
        /**
         * Get an instance of an action.
         * Expects you to provide the parameters and call back function.
         * 
         * @param {Component} component
         * @param {String} name
         *             of the action from the component's perspective (e.g. "c.doSomething")
         * @param {Object} params
         * @param {function} callback
         * @returns {Action} an instance of the action
         */
        getAction:function(component, name, params, callback){
            var action = component.get(name);
            if (params) {
                action.setParams(params);
            }
            if (callback) {
                action.setCallback(component, callback);
            }
            return action;
        },

        /**
         * Peek if there are any pending server actions.
         * @returns {boolean}
         */
        isActionPending : function() {
            return $A.clientService["priv"].inRequest;
        },

        /**
         * Invoke a server action.  At the end of current test case stage, the
         * test will wait for any actions to complete before continuing to the
         * next stage of the test case.
         * @param {Action} action
         * @param {boolean} doImmediate
         *             if true, the request will be sent immediately, otherwise
         *             the action will be handled as any other Action and may
         *             be queued behind prior requests
         */
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
                                    logError("Unable to execute action", actions[k]);
                                }
                            }
                            var serverActions = msg["actions"];
                            for (var i = 0; i < serverActions.length; i++) {
                                for ( var j = 0; j < serverActions[i]["error"].length; j++) {
                                    logError("Error during action", serverActions[i]["error"][j]);
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
                            logError("Error during action", msg["errors"][i]);
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
         * Invoke a callback after the provided condition evaluates to truthy,
         * checking on the condition every specified interval.
         * @param {function} conditionFunction
         * @param {function} callback
         * @param {int} intervalInMs
         *             the number of milliseconds between each evaluation of
         *             conditionFunction 
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
                logError("Error in runAfterIf", e);
            }
        },

        /**
         * Set test to timeout in a period of miliseconds from now.
         * @param {int} timeoutMsec
         *             the number of milliseconds from now when the test should
         *             timeout
         */
        setTestTimeout : function(timeoutMsec){
            priv.timeoutTime = new Date().getTime() + timeoutMsec;
        },

        /**
         * Return whether the test is finished.
         * @returns {boolean}
         */
        isComplete : function(){
            return priv.complete === 0;
        },

        /**
         * Get the list of errors seen by the test, not including any errors
         * handled explicitly by the framework.
         * @returns {string} an empty string if no errors are seen, else a json
         *             encoded list of errors
         */
        getErrors : function(){
            if (priv.errors.length > 0){
                return aura.util.json.encode(priv.errors);
            } else {
                return "";
            }
        },

        /**
         * Essentially a toString method, except strings are enclosed with
         * double quotations.  Returns a string even for undefined/null value.
         * @param {Object} value
         * @returns {String}
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
                if (assertMessage) {
                    assertMessage += " : "+condition;
                } else {
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
                if (assertMessage) {
                    assertMessage += " : "+condition;
                } else {
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
         * Throws an Error, making a test fail with the specified message. 
         * @param {String} assertMessage
         *             defaults to "Assertion failure", if not provided
         * @throws {Error}
         */
        fail : function(assertMessage){
            if(assertMessage){
                throw new Error(assertMessage);
            }else{
                throw new Error("Assertion failure");
            }
        },

        /**
         * Get an object's prototype.
         * @param {Object} instance
         * @returns {Object}
         */
        getPrototype : function(instance){
            return instance && (Object.getPrototypeOf && Object.getPrototypeOf(instance)) || instance.__proto || instance.constructor.prototype;
        },

        /**
         * Replace a function on an object with a restorable override.
         * @param {Object} instance
         * @param {function} originalFunction
         * @param {function} newFunction
         * @returns {function}
         *             the override (newFunction) with an added "restore"
         *             function that, when invoked, will restore originalFunction
         *             on instance
         * @throws {Error}
         *             if instance does not have originalFunction as a property
         */
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

            var found = false;
            for(var p in instance){
                if(instance[p] === originalFunction){
                    instance[p] = override;
                    found = true;
                }
            }
            if(!found) {
            	throw new Error("Did not find the specified function on the given object!");
            }
            return override;
        },

        /**
         * Add a handler function to an existing object's function.
         * The handler may be attached before or after the target function.
         * If attached after (postProcess === true), the handler will be
         * invoked with the original function's return value followed by
         * the original arguments.  If attached before (postProcess !== true),
         * the handler will be invoked with just the original arguments.
         * @param {Object} instance
         * @param {function} originalFunction
         * @param {function} newFunction
         * @param {boolean} postProcess
         *             whether the handler will be called after or before
         *             originalFunction is called
         * @returns {function}
         *             the override of originalFunction, which has a "restore"
         *             function that, when invoked, will restore originalFunction
         *             on instance
         */
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

        /**
         * Get a DOM node's outerHTML.
         * @param {Node} node
         * @returns {String}
         */
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
         * Get the text content of a DOM node. Tries "innerText" followed by
         * "textContext" to take browser differences into account.
         * @param {Node} node 
         * @returns {String}
         */
        getText : function(node) {
            var t = node.innerText;
            if($A.util.isUndefinedOrNull(t)){
                t = node.textContent;
            }
            return (typeof t == "string") ? t : node.innerText;
        },
        
        /**
         * Get the textContent of all elements rendered by this component.
         * @param {Component} component
         * @returns {String}
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
         * Get the current value for a style for a DOMElement.
         * 
         * @param {DOMElement} elem
         * @param {String} Style 
         * @returns {String}
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
         * Filter out comment nodes from a list of nodes.
         * @param {Array|Object} nodes
         * @returns {Array}
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

        /**
         * Check if a node has been "deleted" by Aura.
         * @param {Node} node
         * @returns {boolean}
         */
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
        
        /**
         * Check if a string contains another string.
         * @param {String} testString
         *             the string to check
         * @param {String} targetString
         *             the string to look for
         * @returns {boolean}
         */
        contains : function(testString, targetString){
        	if (!$A.util.isUndefinedOrNull(testString)) {
        		return (testString.indexOf(targetString) != -1);
        	}
        	return false;
        },

        // Used by tests to modify framework source to trigger JS last mod update
        /** @ignore */
        dummyFunction : function(){
            return '@@@TOKEN@@@';
        }
    };

    //#include aura.test.Test_export
    return Test;
};
