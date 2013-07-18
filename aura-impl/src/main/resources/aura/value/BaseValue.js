/*
 * Copyright (C) 2013 salesforce.com, inc.
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
/*jslint sub: true */
/**
 * @namespace A Base set of utility functions for Value implementations.
 * @constructor
 * @protected
 */
var BaseValue = {

    /**
     * Returns the action caller based on the client action name.
     * Throws an error if the client action is not found.
     * @param {Object} index Contains the event parameters.
     * @param {Object} config Contains the action expression and value provider.
     */
    getActionCaller : function(index, config){

        var actionExpression = config["actionExpression"];
        var valueProvider = config["valueProvider"];

        if(aura.util.isString(actionExpression)){
            actionExpression = valueFactory.parsePropertyReference(actionExpression);
        }

        /**
         * Returns a function that runs the event on the client Action.
         * Throws an error if the name of the client action is not found.
         */
        var actionRef = valueFactory.create(actionExpression);
        return function(event){
            if (valueProvider.isValid && !valueProvider.isValid()) {
                return;
            }

            if (index !== null){
                event.getParams()["index"] = index;
            }

            var clientAction = expressionService.getValue(valueProvider, actionRef);
            if (clientAction) {
                if(clientAction.unwrap){
                    clientAction = clientAction.unwrap();
                }
                clientAction.runDeprecated(event);
            } else {
                aura.assert(false, "no client action by name " + actionRef.getValue());
            }
        };
    },

    /**
     * Adds handlers to the given value.
     * @param {String} key The data key to look up on the action caller.
     * @param {Object} value The value for which the handler is added to.
     * @param {Object} config To be passed to getActionCaller
     */
    addValueHandler : function(key, value, config){
        config["method"] = BaseValue.getActionCaller(key, config);
        value.addHandler(config);
    },

    events : {
        "change" : "aura:valueChange",
        "init" : "aura:valueInit"
    },

    /**
     * Returns the EventDef instance based on its given name.
     * @param {String} name The name of the Event to resolve.
     */
    getEventDef : function(name) {
        if (BaseValue.events[name]) {
            name = BaseValue.events[name];
        }
        return $A.get("e").getEventDef(name);
    },

    /**
     * Fires the event after setting up the handlers and parameters.
     * Creates a new Event instance with its eventDef and eventDispatcher attributes.
     * @param {String} name The name of the Event.
     * @param {Object} value
     * @param {Object} dispatcher The Event dispatcher.
     */
    fire : function(name, value, dispatcher) {
        if(!dispatcher){
            return;
        }
        var eventDef = BaseValue.getEventDef(name);
        var eventQName = eventDef.getDescriptor().getQualifiedName();
        var handlers = dispatcher[eventQName];
        if(handlers){
            var event = new Event({
                "eventDef" : eventDef,
                "eventDispatcher" : dispatcher
            });
            event.setParams({
                value : value
            });
            event.fire();
        }
    },

    /**
     * Adds handlers to components and events.
     * @param {Object} config
     * @param {Object} dispatcher
     */
    addHandler : function(config, dispatcher) {

        var eventQName = BaseValue.getEventDef(config["eventName"]).getDescriptor().getQualifiedName();
        var handlers = dispatcher[eventQName];

        if (!handlers) {
            handlers = {};
            dispatcher[eventQName] = handlers;
        }
        var globalId = config["globalId"];

        var cmpHandlers = handlers[globalId];
        if (!cmpHandlers) {
            cmpHandlers = [];
            handlers[globalId] = cmpHandlers;
        }

        var meth = config["method"];
        if (meth) {
            cmpHandlers.push(meth);
        } else {
            cmpHandlers.push(BaseValue.getActionCaller(null, config));
        }
    },

    /**
     * Destroys the handlers based on the globalId.
     * @param {String} globalId The globally unique id which is generated on pageload.
     * @param {Object} dispatcher The event dispatcher that contains the Event names.
     */
    destroyHandlers : function(globalId, dispatcher) {

        for ( var eventName in dispatcher) {
            var handlers = dispatcher[eventName];

            if (handlers) {
                delete handlers[globalId];
            }
        }
    },
    
    /** Figures the type to contain a value */
    typeFor: function(v) {
        if (v === undefined || v === null) {
            return 'SimpleValue';
        }
    	if (v.auraType && v.auraType === "Value") {
    		return v.toString();
    	} else {
    		if (v instanceof Array) {
    			return 'ArrayValue';
    		} else if (v instanceof Object) {
    			return 'MapValue';
    		} else {
    			return 'SimpleValue';
    		}
    	}

    }
};
