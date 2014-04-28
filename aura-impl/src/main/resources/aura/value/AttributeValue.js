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
 * An abstract base class for attribute Value implementations.
 *
 * Attribute values may be simple (String, integer, etc.) or compound (Map or
 * Array).  When an attribute is changed, it fires a single changeEvent for the
 * modification; compound attributes must collect several sub-element
 * changes into one change event.
 *
 * When a change event is fired, the value's "value" property will be the
 * new value, and it will know about the "old" value (as oldValue for a
 * SimpleValue, or as a delta construction for the compound types, so that
 * "large" values do not require double the storage space).
 *
 * Because compound values may change several sub-values, each with its
 * own handlers (and the parent values with their own handlers also), but
 * we want only one event to fire per handler per change operation, attribute
 * change events are made in a prepare/change/fire sequence: during preparation,
 * the PARENT pointers are walked, and an empty changeEvent is created for the
 * changed value and any parents with handlers.  As the change is made, those
 * PENDING events are updated with information about the changes.  Changes may
 * create additional PENDING events deeper in the tree, if they have handlers,
 * and as each sub-level's values are modified they are fired, until the whole
 * change is done and the directly-changed attribute value (and any parents with
 * handlers) are also fired.  Only the attribute value (i.e. layer of the tree)
 * that creates a pending event during its preparation phase may fire it during
 * the fire phase.
 *
 * This class should potentially be promoted to
 * BaseValue, which is today a static utility collection used both by
 * AttributeValues and also by Component.
 *
 * @protected
 * @constructor
 *
 * Several properties are undefined until used:
 * this.eventDispatcher maps qualified event name to handlers firing at "this"
 *     level.
 * this.parent is unset for top-level values, but points to the containing
 *     MapValue or ArrayValue for child values.
 * this.parentKey is set IFF this.parent is set, and contains the key or
 *     index of "this" child in its parent.
 * this.pending contains change events that have been prepared but not fired,
 *     indexed by qualified event name.
 */
$A.ns.AttributeValue = function () {
   /** Containing AttributeValue, either a MapValue or an ArrayValue. */
   this.parent = undefined;

   /** Index in parent to find this value.  Undefined if parent is undefinded. */
   this.parentKey = undefined;

   /** Event dispatcher for handlers registerd to this value (including changes in children). */
   this.eventDispatcher = undefined;

   /**
    * Observers, which track the value of some other "observed" value without
    * the weight of full events.
    */
   this.observers = undefined;
   /** Back reference to an observed value. */
   this.observing = undefined;

   /**
    * If defined, this is a pending event that has been prepared and is accumulating
    * data prior to being fired.
    */
   this.pending = undefined;
};

/** Static to convert simple names to qualified.
 * @param {String} simpleName The simple name to be converted to a qualified name with the format prefix://namespace:name.
 *
 */
$A.ns.AttributeValue.getQName = function (simpleName) {
    var eventDef = BaseValue.getEventDef(simpleName);
    return eventDef.getDescriptor().getQualifiedName();
};

/**
 * Adds new handlers. This is an abstract method and should not be called.
 * @param {Object} config
 * @protected
 */
$A.ns.AttributeValue.prototype.addHandlers = function(config) {
    $A.error("AttributeValue.addHandlers is abstract and should not be called.");
};

/**
 * Initiates observation of a different value by this one, so that future changes
 * will automatically be reflected here also.  Because assignment is type-specific,
 * however, this method does NOT assign any initial value; it should be extended
 * in specific subtypes to do that.
 *
 * @param target the value to observe.  Errors in case of type mismatch.
 * @protected
 */
$A.ns.AttributeValue.prototype.observe = function(target) {
    if (target === this) {
        return;  // Reflexive observation is nonsensical or automatic, your choice.
    }
    if (target.constructor !== this.constructor) {
        $A.error("Type mismatch between " + this.toString() + " and " + target.toString());
    }
    if (this.observing) {
        if (this.observing === target) {
            return;  // No-op, already done
        }
        this.unobserve(this.observing);
    }
    if (target.observers === undefined) {
        target.observers = [];
    }
    for (var i = 0; i < target.observers.length; ++i) {
        if (target.observers[i] === this) {
            return;  // Already observing
        }
    }
    target.observers.push(this);
    this.observing = target;
    this.setValue(target);
};

/**
 * Updates observers for a changed value of the observed.
 *
 * @param newv  The new value, unwrapped, suitable for passing to observer.setValue(newv)
 */
$A.ns.AttributeValue.prototype.informObservers = function (newv) {
    if (this.observers) {
        for (var i = 0; i < this.observers.length; ++i) {
            this.observers[i].setValue(newv);
        }
    }
};

/**
 * Stops tracking a previously-observed value.  The current value remains unchanged,
 * but future changes to the previously-observed one will not cause further changes to
 * this one.
 *
 * @param target the value to stop observing.
 */
$A.ns.AttributeValue.prototype.unobserve = function(target) {
    if (this.observing !== target) {
        $A.warning("Un-observing a previously un-observed value is a sign of confusion.");
        return;
    }
    if (target.observers) {
        for (var i = 0; i < target.observers.length; ++i) {
            if (target.observers[i] === this) {
                target.observers.splice(i, 1);  // remove it
            }
        }
    }
    this.observing = undefined;
};

/**
 * Destroys the handlers. This is an abstract method and should not be called.
 * @protected
 */
$A.ns.AttributeValue.prototype.destroyHandlers = function(globalId) {
    $A.error("AttributeValue.destroyHandlers is abstract and should not be called.");
};

/**
 * Associates with a parent value.
 * @protected
 */
$A.ns.AttributeValue.prototype.setParent = function(parent, key) {
    this.parent = parent;
    this.parentKey = key;
};

/**
 * Fetches the event dispatcher list, creating if needed.
 * @protected
 */
$A.ns.AttributeValue.prototype.getEventDispatcher = function() {
    var ret = this.eventDispatcher;
    if (ret === undefined) {
        ret = {};
        this.eventDispatcher = ret;
    }
    return ret;
};

/**
 * Gets undefined or the event dispatcher for the named event.
 * @protected
 */
$A.ns.AttributeValue.prototype.getEventHandler = function(eventName) {
    if (!this.eventDispatcher) {
        return undefined;
    }
    return this.eventDispatcher[$A.ns.AttributeValue.getQName(eventName)];
};

/**
 * Returns, after creating if needed, a pending event for the supplied
 * qualified event name.
 *
 * @private
 */
$A.ns.AttributeValue.prototype.getOrMakePending = function(eventQName) {
    if (!this.pending) {
        this.pending = {};
    }
    var ret = this.pending[eventQName];
    if (!ret) {
        var eventDef = BaseValue.getEventDef(eventQName);
        ret = new Event({
            "eventDef" : eventDef,
            "eventDispatcher" : this.eventDispatcher
        });
        this.pending[eventQName] = ret;
    }
    return ret;
};

/**
 * Tests for a pending event for the supplied event name.
 * @private
 */
$A.ns.AttributeValue.prototype.hasPending = function(eventQName) {
    if (!this.pending) {
        return false;
    }
    return this.pending[eventQName] !== undefined;
};

/**
 * Adds an entry to the value of pending events, for this attribute and any
 * pending parents.  For parent events, we need to accumulate the intervening
 * keys for the value object.
 * @param {String} eventName
 * @param {Object} value
 *
 * @protected
 */
$A.ns.AttributeValue.prototype.updatePendingValue = function(eventName, value) {
    // JBUCH TODO: TEMPORARY HACK FOR EXTERNAL CHANGE OBSERVERS
    if(value&&value.unwrap){
        value=value.unwrap();
    }
    var eventQName = $A.ns.AttributeValue.getQName(eventName);
    if (this.hasPending(eventQName)) {
        this.getOrMakePending(eventQName).setParams({value: value});
    }
    if (this.parent) {
        var child = this;
        var parent = this.parent;
        while (parent) {
            var newValue;
            var key = child.parentKey;
            if (parent instanceof ArrayValue) {
                newValue = [];
                newValue[key] = value;
            } else {
                newValue = { key : value };
            }
            value = newValue;

            if (parent.hasPending(eventQName)) {
                parent.getOrMakePending(eventQName).setParams({ value: value });
            }
            parent = parent.parent;
        }
    }
};

/**
 * Prepares, and returns a list of, pending events for each AttributeValue for
 * which a given update (the callee of prepare()) will be sending events.  If
 * all levels have handlers registered, that will be this AttributeValue level
 * and all parents up to either the top level or the first level with an
 * already-pending change.  Any layers WITHOUT handlers are skipped from that
 * maximal return list.
 *
 * @param {String} The event name
 *
 * @protected
 */
$A.ns.AttributeValue.prototype.prepare = function(eventName) {
    var eventQName = $A.ns.AttributeValue.getQName(eventName);
    var newEvents = [];
    var pointer = this;
    while (pointer) {
        if (pointer.hasPending(eventQName)) {
            break;  // We're done if we reach a level that's already pending.
        }
        if (pointer.getEventHandler(eventQName)) {
            newEvents.push(pointer.getOrMakePending(eventQName));
        }
        pointer = pointer.parent;
    }
    return newEvents;
};

/**
 * Fires a list of pending events.  The event list should be from prepare(),
 * so it should be sorted from deepest up.  After this is called, none of
 * the events in eventList should be prepared, and pending will have been
 * deleted in any AttributeValue with no pending events after that change.
 * @protected
 * @param {String} The event name
 * @param {Object} eventList The list of events to fire
 */
$A.ns.AttributeValue.prototype.firePending = function(eventName, eventList) {
    if (eventList) {
    	$A.assert($A.util.isArray(eventList), "Expected a list of events, but instead got: " + eventList);

        // Walk up the tree, clearing events, until top or list is empty.  There
        // may be more pending events above this list's scope, but those aren't
        // done yet (we're just firing for some of their subvalues changing).
        var eventQName = $A.ns.AttributeValue.getQName(eventName);
        var pointer = this;
        while (pointer && eventList) {
            if (pointer.pending && pointer.pending[eventQName] === eventList[0]) {
                delete pointer.pending[eventQName];
            }
            pointer = pointer.parent;
        }

        // Now fire all the events:
        for (var i=0; i< eventList.length; i++) {
            eventList[i].fire();
        }
    }
};
