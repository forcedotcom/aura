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
 * @description The Aura Event Service, accessible using $A.eventService. Creates and Manages Events.
 * @constructor AuraEventService
 * @export
 */
function AuraEventService () {
    this.eventDispatcher   = [];
    this.eventDefRegistry  = {};
    this.savedEventConfigs = {};
}

AuraEventService.Phase = {
    CAPTURE: "capture",
    BUBBLE: "bubble",
    DEFAULT: "default"
};

/**
 * Returns qualified event name
 * @param {String} event Event name
 * @returns {String} qualified event name
 */
AuraEventService.prototype.qualifyEventName = function(event) {
    if (event.indexOf("://") === -1) {
        event = "markup://" + event;
    }
    return event;
};

/**
 * Creates a new application event. Set the event parameters using <code>event.setParams()</code> and fire
 * it using <code>event.fire()</code>. For example, <code>$A.eventService.newEvent("app:navError")</code>
 * fires the <code>app:navError</code> event. Set parameters on the new event
 * by using <code>event.setParams()</code>.
 *
 * @param {String} eventDef The event object in the format namespace:component
 * @param {String=} eventName The event name if the event is a "COMPONENT" type event
 * @param {sourceCmp=} eventName The component source if the event is a "COMPONENT" type event
 * @return {Event} new Event
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.newEvent = function(eventDef, eventName, sourceCmp) {
    $A.assert(eventDef, "EventDef is required");
    eventDef = this.getDef(eventDef);

    return this.getNewEvent(eventDef, eventName, sourceCmp);
};

/**
 * Get a new Event instance, but do not do an access check on the event definition. This method is private to 
 * aura and should only be used within trusted portions of the framework.
 *
 * @param {String} eventDef The event object in the format namespace:component
 * @param {String=} eventName The event name if the event is a "COMPONENT" type event
 * @param {sourceCmp=} eventName The component source if the event is a "COMPONENT" type event
 * @return {Event} new Event
 */
AuraEventService.prototype.getNewEvent = function(eventDefinition, eventName, sourceCmp) {
    var eventDef = eventDefinition;
    if(typeof eventDefinition === "string") {
        eventDef = this.getEventDef(eventDefinition);
    }

    if (eventDef) {
        var config = {};
        config["eventDef"] = eventDef;
        if (eventDef.getEventType() === 'COMPONENT') {
            config["name"]      = eventName;
            config["component"] = sourceCmp && sourceCmp.getConcreteComponent();
        } else {
            config["eventDispatcher"] = this.eventDispatcher;
        }
        return new Aura.Event.Event(config);
    }
};

/**
 * Returns an iterator over the sequence of components for a given event 
 * through the "capture" phase then the "bubble" phase.
 * NOTE: Transcluded event handler support could potentially be added here.
 * @return {Object} An object with the form { cmp: Component, phase: String }
 * @private
 * @function
 */
AuraEventService.prototype.getEventPhaseCmpIterator = (function() {

    function EventPhaseCmpIterator(evt) {

        // This is not lazy b/c calculating the next element in "capture"
        // would require iterating from the source to the last return value
        // on each iteration. Can revisit if the need arises.
        var cmpSource = evt.getSource();
        var cmpHierarchyIterator = $A.componentService.getComponentValueProviderHierarchy(cmpSource);
        var bubbleCollection = [];
        var res = null;
        do {
            res = cmpHierarchyIterator.next();
            if(res.value) {
                bubbleCollection.push.apply(bubbleCollection, res.value);
            }
        } while(!res.done);

        var queue = bubbleCollection.slice().reverse().concat(bubbleCollection);
        var queueIndex = 0;
        var phaseSwitchIndex = bubbleCollection.length;
        var phase = AuraEventService.Phase.CAPTURE;
        var currentValue;
        var done = false;

        this.next = function() {
            while(!done) {

                if(queueIndex < queue.length) {
                    if(queueIndex === phaseSwitchIndex) {
                        // reached the middle, switch phases
                        phase = AuraEventService.Phase.BUBBLE;
                    }
                    currentValue = {
                        cmp: queue[queueIndex++],
                        phase: phase
                    };
                    break;
                }
                else {
                    done = true;
                    currentValue = undefined;
                }
            }
            
            return {
                value: currentValue,
                done: done
            };
        };

        this.return = function(value) {
            if(!done) {
                done = true;
                currentValue = value; 
            }
            return {
                value: currentValue,
                done: done
            };
        };

        this.throw = function(e) {
            if(!done) {
                done = true;
            }

            throw e;
        };
    }

    return function(evt) {
        return new EventPhaseCmpIterator(evt);
    };
})();

/**
 * Function that supplies an array of handlers for a given cmp, evt, and phase.
 * @callback handlerSupplier
 * @param {Component} cmp
 * @param {Event} evt
 * @param {String} phase
 * @return {Function[]} array of handler functions whose only parameter is the event
 */

/**
 * A result from a handler iterator
 * @typedef {Object} HandlerIteratorResult
 * @property {Component} cmp - The component with the registered handler
 * @property {String} phase - The phase at which the handler is bound
 * @property {Function} handler - The event handler function
 */

/**
 * Returns an iterator over event handlers for a given event that
 * supports "capture" and "bubble" phases. The HandlerIteratorResult
 * object are returned in the correct order for those two respective phases.
 * If stopPropagation() is called on the event before this iterator 
 * completes, it will terminate, returning a result with done=true and
 * whose value is the last HandlerIteratorResult that it previously returned
 * but with an undefined handler property. This facilitates consumers
 * determining which component is responsible for stopping the event's
 * propagation.
 *
 * @param {Event} evt The event
 * @param {handlerSupplier} The handler supplier function
 * @return {HandlerIteratorResult} A HandlerIteratorResult
 * @private
 * @function
 */
AuraEventService.prototype.getPhasedEventHandlerIterator = (function() {

    function PhasedEventHandlerIterator(evt, eventPhaseCmpIterator, handlerSupplierFn) {

        var done = false;
        var currentValue;
        var currentLocation = null;
        var currentHandlers = null;
        var currentHandlersIndex = 0;

        // moves the cursor to the next component and retrieves the tuple
        // of handlers on that component for the given event
        function moveCmpCursor() {
            currentHandlersIndex = 0;
            var res = eventPhaseCmpIterator.next();
            if(res.done) {
                currentHandlers = currentLocation = null;
            }
            else {
                currentLocation = res.value;
                currentHandlers = handlerSupplierFn(currentLocation.cmp, evt, currentLocation.phase); // an array
                currentHandlersIndex = 0;
            }
        }

        // move to the first location
        moveCmpCursor();

        this.next = function() {
            while(!done) {
                if(!currentLocation) {
                    // no more components to walk
                    done = true;
                    currentValue = undefined;
                }
                else if(currentHandlersIndex < currentHandlers.length) {
                    // flatten the tuple into a single value for each handler
                    // the current level contains more handlers
                    currentValue = {
                        cmp: currentLocation.cmp,
                        phase: currentLocation.phase,
                        handler: currentHandlers[currentHandlersIndex++]
                    };
                    break;
                }
                else {
                    // done with the current level, move the cursor if event
                    // propagation has not been stopped
                    if(evt.eventStopPropagation) {
                        // when stopPropagation() is called, the iterator's return value
                        // is a special object that includes the last cmp and last phase
                        // but no handler
                        return this.return({
                            cmp: currentValue.cmp,
                            phase: currentValue.phase
                        });
                    }
                    else {
                        // get the next component from the iterator
                        moveCmpCursor();
                    }
                }
            }
            
            return {
                value: currentValue,
                done: done
            };
        };

        this.return = function(value) {
            if(!done) {
                done = true;
                currentValue = value; 
            }
            return {
                value: currentValue,
                done: done
            };
        };

        this.throw = function(e) {
            if(!done) {
                done = true;
            }

            throw e;
        };
    }

    return function(evt, handlerSupplierFn) {
        return new PhasedEventHandlerIterator(evt, this.getEventPhaseCmpIterator(evt), handlerSupplierFn);
    };
})();


/**
 * Returns an iterator over component event handlers for a given event.
 * @param {Event} evt The event
 * @return {HandlerIteratorResult} A HandlerIteratorResult
 * @private
 * @function
 */
AuraEventService.prototype.getComponentEventHandlerIterator = (function() {
    return function(evt) {
        return this.getPhasedEventHandlerIterator(evt, this.getComponentEventHandlers.bind(this));
    };
})();

/**
 * A faux handler that may be inserted into an iteration
 * to stop propagation of an event.
 * @private
 */
AuraEventService.prototype.eventStopPropagationHandler = function(evt) {
    evt.stopPropagation();
};

/**
 * A handlerSupplier implementation for phased COMPONENT event handlers
 * that go through capture and bubble phases.
 * @private
 */ 
AuraEventService.prototype.getComponentEventHandlers = function(cmp, evt, phase) {
    var handlers;
    var eventName = evt.getName();
    // just get event handlers for this cmp, not its super(s)
    var dispatcher = cmp.isValid() && cmp.getEventDispatcher();
    if (dispatcher) {

        // Complex component event handling lives here... be wary
        // Some of this is actually kind of wrong, but removing it breaks mess b/c
        // devs have inadvertently counted on it
        var dispatcherHandlers = dispatcher[eventName];
        if(dispatcherHandlers) {
            var phasedHandlers = dispatcherHandlers[phase];
            if(phasedHandlers && phasedHandlers.length) {
                handlers = [];
                var cmpHandlerDefs = cmp.getDef().getCmpHandlerDefs();

                var includedHandlers = false;

                if (cmpHandlerDefs) {
                    // Each handler definition
                    for (var i = 0; i < cmpHandlerDefs.length && !includedHandlers; i++) {
                        // Check for inheritance event def structure
                        for (var evtDef = evt.getDef(); evtDef; evtDef = evtDef.getSuperDef()) {
                            var hDef = cmpHandlerDefs[i]["eventDef"];

                            // If we have the def we guard against it. If we just have name, only check the name
                            // TODO @dval: Refactor this, once we remove all self-events + move parent->child event into methods
                            if (cmpHandlerDefs[i]["name"] === eventName && (!hDef || hDef === evtDef)) {
                                handlers.push.apply(handlers, phasedHandlers);
                                includedHandlers = true;
                                break;
                            }

                            // And if we dont have a def, we are firing an event against ourselves
                            // TODO: Refactor this, once we remove all self-events + move parent->child event into methods
                            
                            // This is from older code but may not be correct. It's forcing a stopPropagation if the first cmpHandlerDef
                            // in the array doesn't define the event type. It may have nothing to do with *THIS* event, but we're
                            // stopping this one anyway. However, this is guarding against an infinite loop in some components with event 
                            // handlers that fire an event on a child that bubbles right back to the same handler handler...!
                            if(!hDef) {
                                // insert a stopPropagation() call at this point in the iteration
                                handlers.push(this.eventStopPropagationHandler);
                            }
                        }
                    }
                }

                // If we need to dispatch here, is a direct parent-children event (no def handler)
                // So we can stopPropagation
                if(!includedHandlers && cmp.getDef().getEventDef(eventName)) {
                    // insert a stopPropagation() call at this point in the iteration
                    handlers.push(this.eventStopPropagationHandler);
                    handlers.push.apply(handlers, phasedHandlers);
                }
            }
        }
    }
    return handlers || [];
};


/**
 * A handlerSupplier implementation for COMPONENT event handlers to
 * use for COMPONENT events that do NOT go through capture or bubble
 * phases.
 * @private
 */ 
AuraEventService.prototype.getNonBubblingComponentEventHandlers = function(cmp, evt, phase) {
    var handlers;
    // just get event handlers for this cmp, not its super(s)
    if(cmp.isValid() && cmp.getDef().getEventDef(evt.getName())) {
        var dispatcher = cmp.getEventDispatcher();
        if (dispatcher) {
            var handlersObj = dispatcher[evt.getName()];
            handlers = handlersObj && handlersObj[phase];
        }
    }
    return handlers || [];
};

/**
 * Returns an iterator over event handler tuples for a COMPONENT event that
 * does not support "capture" or "bubble" phases. The iterator returns HandlerIteratorResult with
 * handlers to invoke in the correct order for those two respective phases.
 * @param {Event} evt The event
 * @param {handlerSupplier} The handler supplier function
 * @return {HandlerIteratorResult} A HandlerIteratorResult
 * @private
 * @function
 */
AuraEventService.prototype.getNonBubblingComponentEventHandlerIterator = (function() {

    // Component event handlers with no phase are coerced to the "bubble" phase for
    // backwards compatibility. Events for this kind of iterator always execute in 
    // the "bubble" phase.
    var PHASE = AuraEventService.Phase.BUBBLE;

    function NonBubblingComponentHandlerIterator(evt, componentEventHandlersSupplierFn) {
        var done = false;
        var currentValue;
        var cmp = evt.getSource();
        var currentCmp = cmp;
        var handlerIndex = 0;
        
        function getHandlers() {
            while(cmp) {
                currentCmp = cmp;
                var evtHandlers = componentEventHandlersSupplierFn(currentCmp, evt, PHASE);
                cmp = cmp.getSuper();
                if (evtHandlers) {
                     // reset handlerIndex
                    handlerIndex = 0;
                    return evtHandlers;
                }
            }
        }

        var handlers = getHandlers();

        this.next = function() {
            while(!done) {
                if(!handlers) {
                    // handlers is undefined completely, we're all done
                    done = true;
                    currentValue = undefined;
                }
                else if(handlerIndex < handlers.length) {
                    // have more handlers to iterate
                    currentValue = {
                        cmp: currentCmp,
                        phase: PHASE,
                        handler: handlers[handlerIndex++]
                    };
                    break;
                }
                else {
                    // get the next set of handlers
                    handlers = getHandlers();
                }
            }

            return {
                value: currentValue,
                done: done
            };
        };

        this.return = function(value) {
            if(!done) {
                done = true;
                currentValue = value; 
            }
            return {
                value: currentValue,
                done: done
            };
        };

        this.throw = function(e) {
            if(!done) {
                done = true;
            }

            throw e;
        };
    }

    return function(evt) {
        return new NonBubblingComponentHandlerIterator(evt, this.getNonBubblingComponentEventHandlers);
    };
})();

/**
 * Returns an iterator over all event handlers for a VALUE event or method call event. 
 * The iterator emits the next handler function to invoke for the event.
 * @param {Event} evt The event
 * @return {HandlerIteratorResult} A HandlerIteratorResult
 * @private
 * @function
 */
AuraEventService.prototype.getValueHandlerIterator = (function() {
    var PHASE = AuraEventService.Phase.DEFAULT; // these events always execute in "default" phase

    function ValueHandlerIterator(evt) {
        var done = false;
        var currentValue;
        var queue = [];
        var queueIndex = 0;
        var cmp = evt.getSource();

        var evtDef = evt.eventDef;
        var eventDispatcher = evt.eventDispatcher;
        while (evtDef) {
            var qname = evtDef.getDescriptor().getQualifiedName();
            var handlers = eventDispatcher[qname] && eventDispatcher[qname][PHASE];

            if (handlers) {
                // This should always be true for value events and method call events
                if ($A.util.isArray(handlers)) {
                    // Value handlers on components and methods use arrays, not objects
                    for (var i = 0; i < handlers.length; i++) {
                        queue.push({
                            cmp: cmp,
                            phase: PHASE,
                            handler: handlers[i]
                        });
                    }
                }
            }
            evtDef = evtDef.getSuperDef();
        }


        this.next = function() {
            while(!done) {
                if(queueIndex < queue.length) {
                    // have more handlers to iterate
                    currentValue = queue[queueIndex++];
                    break;
                }
                else {
                    // we're all done
                    done = true;
                    currentValue = undefined;
                }
            }

            return {
                value: currentValue,
                done: done
            };
        };

        this.return = function(value) {
            if(!done) {
                done = true;
                currentValue = value; 
            }
            return {
                value: currentValue,
                done: done
            };
        };

        this.throw = function(e) {
            if(!done) {
                done = true;
            }

            throw e;
        };
    }

    return function(evt) {
        return new ValueHandlerIterator(evt);
    };
})();

/**
 * A handlerSupplier implementation for APPLICATION event handlers
 * @private
 */ 
AuraEventService.prototype.getPhasedApplicationEventHandlers = function(cmp, evt, phase) {
    var evtDef = evt.eventDef;
    var eventDispatcher = evt.eventDispatcher;
    var globalId = cmp.globalId;
    var phasedEvtHandlers = [];

    if(cmp.isValid()) {
        // collect handlers for the entire event definition hierarchy
        while (evtDef) {
            var qname = evtDef.getDescriptor().getQualifiedName();
            var handlers = eventDispatcher[qname];

            if (handlers && handlers[phase] && handlers[phase][globalId]) {
                phasedEvtHandlers.push.apply(phasedEvtHandlers, handlers[phase][globalId]);
            }
            evtDef = evtDef.getSuperDef();
        }
    }

    return phasedEvtHandlers;
};

/**
 * Returns an iterator over all event handlers for a given APPLICATION event. 
 * The iterator emits the next handler function to invoke for the event.
 * @param {Event} evt The event
 * @return {HandlerIteratorResult} A HandlerIteratorResult
 * @private
 * @function
 */
AuraEventService.prototype.getAppEventHandlerIterator = (function() {

    // returns true if the cmpGen generator emits a component whose global id
    // matches the id
    function hasId(cmpGen, id) {
        var res = null;
        do {
            res = cmpGen.next();
            // res.value is an array of the component hierarchy for a single
            // concrete component; we only need to check the first element in 
            // the array since all the elements in the array will share the same globalId
            if(res.value && id === res.value[0].getGlobalId()) {
                return true;
            }
        } while(!res.done);

        return false;
    }

    // Iterator over all event handlers in the "default" phase 
    function AppEventDefaultPhaseHandlerIterator(evt, rootId) {
        var done = false;

        var queue = null;
        var queueIndex = 0;
        var currentValue;

        // this is lazy in that it's called on the first "next()" call
        // but once called it builds a queue of the entire result set
        // since there's no reason to be completely lazy for default
        // event handlers
        function fillQueue() {
            queue = [];
            var evtDef = evt.eventDef;
            var eventDispatcher = evt.eventDispatcher;
            while(evtDef) {
                var qname = evtDef.getDescriptor().getQualifiedName();
                var handlers = eventDispatcher[qname];
                var defaultHandlersMap = handlers && handlers[AuraEventService.Phase.DEFAULT];
                var cmpHandlers;

                if (defaultHandlersMap) {
                    for(var globalId in defaultHandlersMap) {
                        if(defaultHandlersMap.hasOwnProperty(globalId)) {
                            var cmp = $A.getComponent(globalId);
                            // Some handlers may be added programmatically with a globalId that is
                            // not a valid component id. If the handler is associated with a component, 
                            // make sure the component is still valid.
                            if(cmp && !cmp.isValid()) {
                                continue;
                            }
                            if(rootId) {
                                // check if the cmp is contained within the rootId
                                var cmpHierarchyGen = $A.componentService.getComponentValueProviderHierarchy(cmp);
                                if(!hasId(cmpHierarchyGen, rootId)) {
                                    // the component hierarchy for the cmp does not include the rootId
                                    // so don't include these handlers in the result set for the iterator
                                    continue;
                                }
                            }

                            // push an entry for each handler into the queue
                            cmpHandlers = defaultHandlersMap[globalId];
                            for(var i = 0; i < cmpHandlers.length; i++) {
                                // HandlerIteratorResult
                                queue.push({
                                    cmp: cmp,
                                    phase: AuraEventService.Phase.DEFAULT,
                                    handler: cmpHandlers[i]
                                });
                            }
                        }
                    }
                }
                // move up the event definition hierarchy to look for handlers of super types of the event
                evtDef = evtDef.getSuperDef();
            }
        }

        this.next = function() {
            while(!done) {

                if(!queue) {
                    fillQueue();
                }

                if(queueIndex < queue.length) {
                    currentValue = queue[queueIndex++];
                    break;
                }
                else {
                    done = true;
                    currentValue = null;
                }
            }
            
            return {
                value: currentValue,
                done: done
            };
        };

        this.return = function(value) {
            if(!done) {
                done = true;
                currentValue = value; 
            }
            return {
                value: currentValue,
                done: done
            };
        };

        this.throw = function(e) {
            if(!done) {
                done = true;
            }

            throw e;
        };
    }

    // Iterator over all event handlers in "capture", "bubble", and "default" phase
    function AppEventHandlerIterator(evt, phasedEventHandlerIterator) {

        var defaultEventHandlerIterator = null;
        var currentPhase = AuraEventService.Phase.CAPTURE;
        var bcastRootId = null;
        var currentValue = null; // HandlerIteratorResult
        var done = false;

        this.next = function() {
            while(!done) {

                if(currentPhase === AuraEventService.Phase.CAPTURE || currentPhase === AuraEventService.Phase.BUBBLE) {
                    var phaseRes = phasedEventHandlerIterator.next(); // { value: HandlerIteratorResult, done: Boolean }
                    if(!phaseRes.done) {
                        // When the PhasedEventHandlerIterator is NOT done, then eventStopPropagation has not been invoked
                        currentValue = phaseRes.value;
                        currentPhase = currentValue.phase;
                        break;
                    }
                    else if(evt.defaultPrevented) {
                        // if preventDefault() was called in a previous phase, we're done
                        currentValue = undefined;
                        currentPhase = AuraEventService.Phase.DEFAULT;
                        done = true;
                    }
                    else {
                        // Move directly to the "default" phase
                        // stopPropagation() may have been invoked, so let's check the phaseRes.value
                        // for a defined value which would indicate if the iterator was stopped preemptively.
                        // PhasedEventHandlerIterator will terminate with a defined value if stopPropagation()
                        // was called. 
                        currentPhase = AuraEventService.Phase.DEFAULT;
                        if(evt.eventStopPropagation && phaseRes.value) {
                            // stopPropagation() was called, so we need to establish the broadcast root
                            // to scope the default event handlers
                            bcastRootId = phaseRes.value.cmp.getConcreteComponent().getGlobalId(); // (evt.getSource() && evt.getSource().getGlobalId()) ?
                        }

                        defaultEventHandlerIterator = new AppEventDefaultPhaseHandlerIterator(evt, bcastRootId);
                    }
                }
                else {
                    var defaultRes = defaultEventHandlerIterator.next();

                    if(!defaultRes.done) {
                        currentValue = defaultRes.value;
                        break;
                    }

                    currentValue = undefined;
                    done = true;
                }
            }
            
            return {
                value: currentValue,
                done: done
            };
        };

        this.return = function(value) {
            if(!done) {
                done = true;
                currentValue = value; 
            }
            return {
                value: currentValue,
                done: done
            };
        };

        this.throw = function(e) {
            if(!done) {
                done = true;
            }

            throw e;
        };
    }

    return function(evt) {
        return new AppEventHandlerIterator(evt, this.getPhasedEventHandlerIterator(evt, this.getPhasedApplicationEventHandlers));
    };
})();


/**
 * Returns the new event.
 * @param {String} name The event object in the format namespace:component
 * @param {Function} [callback] The function that gets executed when the get has succeeded. Since this could download the event def if it is not present you need the callback to get the definition.
 * @memberOf AuraEventService
 */
AuraEventService.prototype.get = function(name, callback) {
    var newEvent = this.newEvent(name);
    if(callback) {
        if(newEvent) {
            return callback(newEvent);
        }
        return this.getDefinition(name, callback);
    }
    return newEvent;
};

/**
 * Adds an event handler.
 * @param {Object} config The data for the event handler
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.addHandler = function(config) {
    config["event"] = this.qualifyEventName(config["event"]);

    var handlers = this.eventDispatcher[config["event"]];
    if (!handlers) {
        this.eventDispatcher[config["event"]] = handlers = {};
    }
    var phase = config["phase"] || "default";
    var phaseHandlers = handlers[phase];
    if(!phaseHandlers) {
        handlers[phase] = phaseHandlers = {};
    }

    var cmpHandlers = phaseHandlers[config["globalId"]];
    if (cmpHandlers === undefined) {
        phaseHandlers[config["globalId"]] = cmpHandlers = [];
    }
    cmpHandlers.push(config["handler"]);
};

/**
 * Removes an event handler.
 * @param {Object} config The data for the event
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.removeHandler = function(config) {
    config["event"] = this.qualifyEventName(config["event"]);

    var handlers = this.eventDispatcher[config["event"]];
    if (handlers) {
        var phase = config["phase"] || "default";
        var phaseHandlers = handlers[phase];
        if(phaseHandlers) {
            delete phaseHandlers[config["globalId"]];
        }
    }
};

/**
 * Returns the event definition.
 * Internal method to the framework. To get an event def from the API, use $A.get("e.prefix:name", function(def){});
 * 
 * @param {String} descriptor name of EventDef
 * @return {EventDef} The event definition.
 * @memberOf AuraEventService
 * @private
 */
AuraEventService.prototype.getEventDef = function(config) {
    var descConfig = this.createDescriptorConfig(config);
    var descriptor = this.getDescriptorFromConfig(descConfig);
    var definition = this.eventDefRegistry[descriptor];

    if (!definition && this.savedEventConfigs[descriptor]) {
        definition = this.createFromSavedConfigs(descConfig);
    }

    return definition;
};

/**
 * Get the event definition. 
 * Does access checks.
 * You cannot fire this though, use newEvent() for that.
 * 
 * @param  {String}  descriptor Event descriptor in the pattern prefix:name or markup://prefix:name.
 */
AuraEventService.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No EventDefinition was descriptor specified.");
    var definition = this.getEventDef(descriptor);

    if(definition && !$A.clientService.allowAccess(definition)) {
        var context=$A.getContext();
        var message="Access Check Failed! EventService.getEventDef():'" + definition.getDescriptor().toString() + "' is not visible to '" + (context&&context.getCurrentAccess()) + "'.";
        if(context.enableAccessChecks) {
            if(context.logAccessFailures){
                $A.error(message);
           }
            return null;
        } else {
            if(context.logAccessFailures){
                $A.warning(message);
            }
            // Intentional fallthrough
        }
    }
    
    return definition;
};


/**
 * Checks to see if the definition for the event currently reside on the client.
 * Could still exist on the server, we won't know that till we use a getDefinitiion call to try to retrieve it.
 * This method is private, to use it, use $A.hasDefinition("e.prefix:name");
 * @private
 * @param  {String}  descriptor Event descriptor in the pattern prefix:name or markup://prefix:name.
 * @return {Boolean}            True if the definition is present on the client.
 */
AuraEventService.prototype.hasDefinition = function(descriptor) {
    var definition = this.getEventDef(descriptor);
    if(definition && !$A.clientService.allowAccess(definition)) {
        var context=$A.getContext();
        var message="Access Check Failed! EventService.hasDefinition():'" + definition.getDescriptor().toString() + "' is not visible to '" + (context&&context.getCurrentAccess()) + "'.";
        if(context.enableAccessChecks) {
           if(context.logAccessFailures){
               $A.error(message);
           }
           return false;
        }else{
            if(context.logAccessFailures){
                $A.warning(message);
            }
            //Intentional fallthrough
        }
    }
    return !!definition;
};

/**
 * Gets descriptor from the config object (for normalization)
 * @param {Object} Controller descriptor config
 * @returns {String} Descriptor
 * @private
 */
AuraEventService.prototype.createDescriptorConfig = function(descriptor) {
    descriptor = typeof descriptor === 'string' ? descriptor : descriptor["descriptor"].toString();
    descriptor = descriptor.indexOf("://") < 0 ? "markup://" + descriptor : descriptor;
    return { "descriptor" : descriptor };
};


/**
 * Get the event definition. If it is not available, contact the server to download it.
 *
 * This method is private, to utilize it's functionality you can use $A.getDefinition("e.prefix:name");
 *
 * @private
 *
 * @param  {String}  descriptor Event descriptor in the pattern prefix:name or markup://prefix:name.
 * @param  {Function} callback  The function callback that gets executed with the definition. May go to the server first.
 * @return undefined            Always use the callback to access the definition.
 */
AuraEventService.prototype.getDefinition = function(descriptor, callback) {
    var descriptorName = descriptor.replace('e.', '');
    var def = this.getDef(descriptorName);

    // if def failed the access check, or the event was returned.
    if (def === null || def) {
        callback(def);
        return;
    }

    var action = $A.get("c.aura://ComponentController.getEventDef");
    action.setParams({
        "name": descriptorName
    });
    action.setCallback(this, function (actionReponse) {
        var definition = null;
        if(actionReponse.getState() === "SUCCESS") {
            definition = this.getDef(descriptorName);
        }
        callback(definition);
    });

    $A.enqueueAction(action);
};


/**
 * Gets descriptor from the config object (for normalization)
 * @param {Object} Controller descriptor config
 * @returns {String} Descriptor
 * @private
 */
AuraEventService.prototype.getDescriptorFromConfig = function(descriptorConfig) {
    var descriptor = descriptorConfig && descriptorConfig["descriptor"];
    $A.assert(descriptor, "Event Descriptor for Config required for registration");
    return descriptor;
};


/**
 * Creates and saves EventDef into registry
 * @param {Object} config config for EventDef
 * @returns {EventDef} instance from registry
 */
AuraEventService.prototype.createFromSavedConfigs = function(config) {
    var descriptor = config["descriptor"];
    if (!descriptor && config["getDescriptor"]) {
        descriptor = config.getDescriptor();
    }

    var def = new EventDef(this.savedEventConfigs[descriptor]);
    this.eventDefRegistry[descriptor] = def;
    delete this.savedEventConfigs[descriptor];
    return def;
};



/**
 * Creates and returns EventDef from config
 * @param {Object} config The parameters for the event
 * @return {EventDef} The event definition.
 * @memberOf AuraEventService
 * @private
 */
AuraEventService.prototype.createEventDef = function(config) {
    var descConfig = this.createDescriptorConfig(config);
    var descriptor = this.getDescriptorFromConfig(descConfig);
    var definition = this.eventDefRegistry[descriptor];

    if (!definition) {
        if (this.savedEventConfigs[descriptor]) {
            definition = this.createFromSavedConfigs(descConfig);
        } else {
            definition = new EventDef(config);
            this.eventDefRegistry[descriptor] = definition;
        }
    }

    return definition;
};

/**
 * Saves EventDef config so it can be used later when EventDef is actually used.
 * Allows Aura to only create EventDef when needed
 *
 * @param {Object} config event definition config
 */
AuraEventService.prototype.saveEventConfig = function(config) {
    $A.assert(config && config["descriptor"], "Event config required for registration");
    this.savedEventConfigs[config["descriptor"]] = config;
};

/**
 * Returns true if the event has handlers.
 * @param {String} name The event name
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.hasHandlers = function(name) {
    name = this.qualifyEventName(name);
    return !$A.util.isUndefined(this.eventDispatcher[name]);
};

/**
 * Returns the qualified name of all events known to the registry.
 * @export
 */
AuraEventService.prototype.getRegisteredEvents = function() {
    return Object.keys(this.eventDefRegistry);
};

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
/**
 * Whether there are pending events
 * Available in DEV mode only.
 * @export
 */
AuraEventService.prototype.hasPendingEvents = function() {
    return $A.clientService.inAuraLoop();
};
//#end

Aura.Services.AuraEventService = AuraEventService;
