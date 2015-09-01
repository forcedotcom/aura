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
 * @description Creates an Event with name, source component, event definition, event dispatcher, parameters, and sets the fired flag to false.
 * @constructor
 * @param {Object} config
 * @platform
 * @export
 */
Aura.Event.Event = function(config) {
    this.source = config["component"];
    this.eventDef = config["eventDef"];
    this.eventDispatcher = config["eventDispatcher"];
    this.eventName = config["name"];
    this.params = {};
    this.fired = false;
    this.eventStopPropagation = false;
    this.componentEvent = false;
};

/**
 * Gets the source component that fired this component event.
 * This method doesn't work for application events.
 *
 * @returns {Object}
 * @platform
 * @export
 */
Aura.Event.Event.prototype.getSource = function() {
    return this.source;
};

/**
 * Gets the Event Definition.
 * Returns an EventDef object.
 * @export
 */
Aura.Event.Event.prototype.getDef = function(){
    return this.eventDef;
};

/**
 * Sets wether the event can bubble or not
 * @param {Boolean} bubble The param wether this event should bubble or not
 * The default is false
 * @export
 */
Aura.Event.Event.prototype.stopPropagation = function() {
    this.eventStopPropagation = true;
};

/**
 * Sets the event as a "componentEvent" (won't bubble)
 * This type of event was used historically as a construct to call an action of a child
 * Since the advent of "methods", this type of event communication is discouraged and a "method" is preferred.
 * NOTE: Calling events on a child is discouraged and will be deprecated
 * @export
 */
Aura.Event.Event.prototype.setComponentEvent = function(){
    this.componentEvent = true;
    return this;
};

/**
 * Gets the name of the Event.
 * Returns a name of type String, the unique identifier that the component can use to call this Action.
 * @platform
 * @export
 */
Aura.Event.Event.prototype.getName = function(){
    return this.eventName;
};

/**
 * Sets parameters for the Event. Does not modify an event that has already been fired.
 * Maps key in config to attributeDefs.
 * @param {Object} config The parameters for the Event.
 * @platform
 * @export
 */
Aura.Event.Event.prototype.setParams = function(config) {
    if (this.fired) {
        $A.assert(false, "Event.setParams(): cannot modify all params in an event that has already been fired.");
    }

    if (config) {
        var attributeDefs = this.eventDef.getAttributeDefs();
        for (var key in config){
            if (config.hasOwnProperty(key)) {
                if (attributeDefs[key]) {
                    this.params[key] = config[key];
                } else {
                    $A.warning("Event.setParams(): '" + key +"'('" + config[key] + "') is not a valid parameter. Valid parameters are '"+ Object.keys(this.eventDef.getAttributeDefs()).join("', '") + "'");
                }
            }
        }
    }
    return this;
};

/**
 * Sets a parameter for the Event. Does not modify an event that has already been fired.
 * @param {String} key The name of the parameter.
 * @param {Object} value The value of the parameter.
 * @platform
 * @export
 */
Aura.Event.Event.prototype.setParam = function(key, value) {
    if (this.fired && this.componentEvent) {
        $A.assert(false, "Event.setParam(): cannot modify a component event that has already been fired.");
    }
    if (this.eventDef.getAttributeDefs()[key]) {
        this.params[key] = value;
    } else {
        $A.warning("Event.setParam(): '"+key+"' is not a valid parameter. Valid parameters are '" + Object.keys(this.eventDef.getAttributeDefs()).join("', '") + "'");
    }
};

/**
 * Gets an Event parameter. Returns the parameters.
 * @param {String} name The name of the Event. For example, <code>event.getParam("button")</code> returns the value of the pressed mouse button (0, 1, or 2).
 * @platform
 * @export
 */
Aura.Event.Event.prototype.getParam = function(name){
    return this.params[name];
};

/**
 * Gets all the Event parameters. Returns the collection of parameters.
 * @platform
 * @export
 */
Aura.Event.Event.prototype.getParams = function(){
    return this.params;
};

//#if {"modes" : ["STATS"]}
Aura.Event.Event.prototype.statsIndex = [];
//#end

Aura.Event.Event.prototype.dispatchNonComponentEventHandlers = function () {
    if (this.eventDispatcher) {
        var def = this.eventDef;
        while (def) {
            var qname = def.getDescriptor().getQualifiedName();
            var handlers = this.eventDispatcher[qname];

            if (handlers) {
                if ($A.util.isArray(handlers)) {
                    //Value handlers on components use arrays, not objects
                    for (var k = 0; k < handlers.length; k++) {
                        handlers[k](this);
                    }
                } else {
                    for (var key in handlers) {
                        var cmpHandlers = handlers[key];
                        for (var j = 0; j < cmpHandlers.length; j++) {
                            var handler = cmpHandlers[j];
                            handler(this);
                        }
                    }
                }
            }
            def = def.getSuperDef();
        }
    }
};

Aura.Event.Event.prototype.dispatchComponentEventHandlers = function () {
    var cmp = this.source;
    while (cmp && cmp.getDef().getEventDef(this.eventName)) {
        var dispatcher = cmp.getEventDispatcher();
        if (dispatcher) {
            var handlers = dispatcher[this.eventName];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i](this);
                    // A handler might have destroyed the component and we need to stop walking the super chain
                    if(!cmp.isValid()){
                        break;
                    }
                }
            }
        }
        cmp = cmp.getSuper();
    }
};

/**
 * Fires the Event. Checks if the Event has already been fired before firing.
 * Returns null if a handler has destroyed the component.
 * Maps the component handlers to the event dispatcher.
 * @param {Object} params Optional A set of parameters for the Event. Any previous parameters of the same name will be overwritten.
 * @platform
 * @export
 */
Aura.Event.Event.prototype.fire = function(params) {
    var self = this;

    if (this.fired) {
        aura.assert(false, "Event.fire(): Unable to fire event. Event has already been fired.");
    }

    if (params) {
        this.setParams(params);
    }
    //#if {"modes" : ["STATS"]}
    var startTime = (new Date()).getTime();
    //#end

    $A.run(function() {
        self.fired = true;
        // if it has an eventName it is not a method or application event
        if (self.eventName) {
            // for legacy reasons, if the event is set as component level event, dispatch it alone (not bubbling)
            if (self.componentEvent) {
                self.dispatchComponentEventHandlers();
            } else {
                $A.eventService.bubbleEvent(self);
            }
        } else {
            self.dispatchNonComponentEventHandlers();
        }
    }, this.eventDef.getDescriptor().getQualifiedName()/*name for the stack*/);

    //#if {"modes" : ["STATS"]}
        Aura.Event.Event.prototype.statsIndex.push({'event': this, 'startTime': startTime, 'endTime': (new Date()).getTime()});
    //#end
};
