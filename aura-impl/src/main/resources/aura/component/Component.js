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
/*jslint sub: true*/
//#include aura.component.Component_private
/**
 * Construct a new Component.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            config - component configuration
 * @param {Boolean}
 *            [localCreation] - local creation
 */
function Component(config, localCreation) {
	this.priv = new ComponentPriv(config, this, localCreation);
	this._destroying =false;

	// #if {"modes" : ["TESTING","AUTOTESTING", "TESTINGDEBUG",
	// "AUTOTESTINGDEBUG"]}
	this["creationPath"] = this.priv.creationPath;
	// #end

    this.fire("init");
}

/**
 * The Component type.
 * <p>
 * Examples:
 * </p>
 * <p>
 * <code>//Checks if the component value is of this type<br />obj.auraType === "Component"</code>
 * </p>
 * <p>
 * <code>//Checks if the elements in the body is of this type<br />
 * var body = cmp.get("v.body");<br />
 * var child = body[i];<br />
 * if (child.auraType === "Component") { //do something }
 * </code>
 * </p>
 *
 * @public
 */
Component.prototype.auraType = "Component";

/**
 * Gets the ComponentDef Shorthand: <code>get("def")</code>
 *
 * @public
 */
Component.prototype.getDef = function() {
	return this.priv.componentDef;
};

/**
 * Indexes the given <code>globalId</code> based on the given
 * <code>localId</code>. Allows <code>cmp.find(localId)</code> to look up
 * the given <code>globalId</code>, look up the component, and return it.
 *
 * @param {String}
 *            localId The id set using the aura:id attribute.
 * @param {String}
 *            globalId The globally unique id which is generated on pageload.
 * @protected
 */
Component.prototype.index = function(localId, globalId) {
	var priv = this.priv;

	var index = priv.index;
	if (!index) {
		index = {};
		priv.index = index;
	}

	var existing = index[localId];
	if (existing) {
		if (!$A.util.isArray(existing)) {
			index[localId] = [ existing, globalId ];
		} else {
			existing.push(globalId);
		}
	} else {
		index[localId] = globalId;
	}
	return null;
};

/**
 * Removes data from the index. If both <code>globalId</code> and
 * <code>localId</code> are provided, only the given pair is removed from the
 * index. If only <code>localId</code> is provided, every mapping for that
 * <code>localId</code> is removed from the index.
 *
 * This might be called after component destroy in some corner cases, be careful
 * to check for priv before accessing.
 *
 * @param {String}
 *            localId The id set using the aura:id attribute.
 * @param {String}
 *            globalId The globally unique id which is generated on pageload.
 * @protected
 */
Component.prototype.deIndex = function(localId, globalId) {
	var priv = this.priv;

	//
	// Unfortunately, there are some bizarre loops with deIndex and destroy.
	// For the moment, we don't enforce that this is a valid component until
	// we can track down _why_ it is being called on already destroyed
	// components
	if (!this.priv) {
		return null;
	}

	if (priv.index) {
		if (globalId) {
			var index = priv.index[localId];
			if (index) {
				if ($A.util.isArray(index)) {
					for (var i = 0; i < index.length; i++) {
						if (index[i] === globalId) {
							index.splice(i, 1);
							//
							// If we have removed an index, we need to back up
							// our counter to process the same index.
							//
							i -= 1;
						}
					}
					if (index.length === 0) {
						delete priv.index[localId];
					}
				} else {
					if (index === globalId) {
						delete priv.index[localId];
					}
				}
			}
		} else {
			delete priv.index[localId];
		}
	}
	return null;
};

/**
 * Locates a component using the localId. Shorthand: <code>get("asdf")</code>,
 * where "asdf" is the <code>aura:id</code> of the component to look for. See
 * <a href="#help?topic=findById">Finding Components by ID</a> for more
 * information. Returns instances of a component using the format
 * <code>cmp.find({ instancesOf : "auradocs:sampleComponent" })</code>.
 *
 * @param {String|Object}
 *            name If name is an object, return instances of it. Otherwise,
 *            finds a component using its index.
 * @public
 */
Component.prototype.find = function(name) {
    //JBUCH: HALO: TODO: I WANT TO SEPARATE THESE CONCEPTS, AND EXPOSE cmp.findInstances("foo:bar","foo:baz");
	if ($A.util.isObject(name)) {
		var type = name["instancesOf"];
		var instances = [];
		this.findInstancesOf(type, instances, this);
		return instances;
	} else {
		var index = this.priv.index;
		if (index) {
			var globalId = index[name];
			if (globalId) {
				if ($A.util.isArray(globalId)) {
					var ret = [];
					for (var i = 0; i < globalId.length; i++) {
						ret.push(componentService.get(globalId[i]));
					}
					return ret;
				}
				return componentService.get(globalId);
			}
		}
	}

	// For non-existent objects, we return undefined so that
	// we can distinguish between not existing and null.
	return undefined;
};

/**
 * Find instances of a Component type, in this component's hierarchy, and in
 * its body, recursively.
 *
 * @param {Object}
 *            type The object type.
 * @param {Array}
 *            ret The array of instances to add the located Components to.
 * @param {Object}
 *            cmp The component to search for.
 * @private
 */
Component.prototype.findInstancesOf = function(type, ret, cmp) {
    // JBUCH: HALO: TODO: CAN WE MAKE THIS PUBLIC, INSTEAD OF THE cmp.find({instancesOf:"ui:something"}) DANCE?
	cmp = cmp || this.getSuperest();

    var body = cmp.get("v.body");
	if (body) {
		for (var i = 0; i < body.length; i++) {
			cmp = body[i];
			if (cmp.findInstanceOf) {
				var inst = cmp.findInstanceOf(type);
				if (inst) {
					ret.push(inst);
				} else {
					cmp.findInstancesOf(type, ret);
				}
			}
		}
	}
};

/**
 * @private
 */
Component.prototype.getSuperest = function() {
	var superComponent = this.getSuper();
	if (superComponent) {
		return superComponent.getSuperest() || superComponent;
	} else {
		return this;
	}
};

/**
 *
 * @private
 */
Component.prototype.findInstanceOf = function(type) {
	var descriptor = this.getDef().getDescriptor();
	if ((descriptor.getNamespace() + ":" + descriptor.getName()) === type) {
		return this;
	} else {
		var superComponent = this.getSuper();
		if (superComponent) {
			return superComponent.findInstanceOf(type);
		} else {
			return null;
		}
	}
};

/**
 * Checks whether the component is an instance of the given component name (or
 * interface name).
 *
 * @param {String}
 *            name The name of the component (or interface), with a format of
 *            <code>namespace:componentName</code>.
 * @returns {Boolean} true if the component is an instance, or false otherwise.
 */
Component.prototype.isInstanceOf = function(name) {
	return this.getDef().isInstanceOf(name);
};

/**
 * @param {Object}
 *            type Applies the type to its definition.
 * @private
 */
Component.prototype.implementsDirectly = function(type) {
	return this.getDef().implementsDirectly(type);
};

/**
 * Adds an event handler. Resolving the handler Action happens at Event-handling
 * time, so the Action reference may be altered at runtime, and that change is
 * reflected in the handler. See <a
 * href="#help?topic=dynamicHandler">Dynamically Adding Event Handlers</a> for
 * more information.
 *
 * @param {String}
 *            eventName The event name
 * @param {Object}
 *            valueProvider The value provider to use for resolving the
 *            actionExpression.
 * @param {Object}
 *            actionExpression The expression to use for resolving the handler
 *            Action against the given valueProvider.
 * @param {boolean}
 *            insert The flag to indicate if we should put the handler at the
 *            beginning instead of the end of handlers array.
 * @public
 */
Component.prototype.addHandler = function(eventName, valueProvider, actionExpression, insert) {
	var dispatcher = this.priv.getEventDispatcher(this);

	var handlers = dispatcher[eventName];
	if (!handlers) {
		handlers = [];
		dispatcher[eventName] = handlers;
	}

	if (insert === true) {
		handlers.unshift(this.priv.getActionCaller(valueProvider, actionExpression));
	} else {
		handlers.push(this.priv.getActionCaller(valueProvider, actionExpression));
	}
};

/**
 * Adds handlers to Values owned by the Component.
 *
 * @param {Object}
 *            config Passes in the value, event (e.g. "change"), and action
 *            (e.g. "c.myAction").
 * @public
 */
Component.prototype.addValueHandler = function(config) {
	var value = config["value"];
	if ($A.util.isExpression(value)&&value.getExpression()==="this") {
        var eventQName = this.priv.componentDef.getEventDef(config["event"], true).getDescriptor().getQualifiedName();
        this.addHandler(eventQName, this, config["action"]);
        return;
	}
    if(config["action"]&&!config["method"]){
        config["method"]=this.priv.getActionCaller(this, config["action"].getExpression());
    }
	this.priv.addValueHandler(this,config);
};

Component.prototype.removeValueHandler = function(config) {
    this.priv.removeValueHandler(this,config);
};

/**
 * Add a document level event handler that auto-cleans.
 *
 * When called, this will create and return a handler that can be enabled and
 * disabled at will, and will be cleaned up on destroy.
 *
 * @public
 * @param {String}
 *            eventName the event name to attach.
 * @param {Function}
 *            callback the callback (only called when enabled, and component is
 *            valid & rendered)
 * @param {Boolean}
 *            autoEnable (truthy) enable the handler when created.
 * @return {Object} an object with a single visible call of setEnabled(Boolean)
 */
Component.prototype.addDocumentLevelHandler = function(eventName, callback, autoEnable) {
	var dlh = new $A.ns.DocLevelHandler(eventName, callback, this);
	if (!this.priv.docLevelHandlers) {
		this.priv.docLevelHandlers = {};
	}
	$A.assert(this.priv.docLevelHandlers[eventName] === undefined, "Same doc level event set twice");
	this.priv.docLevelHandlers[eventName] = dlh;
	dlh.setEnabled(autoEnable);
	return dlh;
};

/**
 * Remove a document level handler.
 *
 * You need only call this if the document level handler should be destroyed, it
 * is not generally needed.
 *
 * @public
 * @param {Object}
 *            the object returned by addDocumentHandler.
 */
Component.prototype.removeDocumentLevelHandler = function(dlh) {
	if (dlh && dlh.setEnabled) {
		dlh.setEnabled(false);
		this.priv.docLevelHandlers[dlh.eventName] = undefined;
	}
};

/**
 * Forces the final destroy of a component (after async).
 */
Component.prototype.finishDestroy = function() {
	this.destroy(false);
};

/**
 * Destroys the component and cleans up memory.
 *
 * <code>destroy()</code> destroys the component immediately while
 * <code>destroy(true)</code> destroys it asynchronously. See <a
 * href="#help?topic=dynamicCmp"/>Dynamically Creating Components</a> for more
 * information.
 * <p>
 * Note that when this is called with async = true, it makes a specific race
 * condition (i.e. calling functions after destroy) harder to trigger. this
 * means that we really would like to be able to for synchronous behaviour here,
 * or do something to make the destroy function appear much more like it is
 * doing a synchronous destroy (e.g. removing this.priv). Unfortunately, the act
 * of doing an asynchronous destroy creates false 'races' because it leaves all
 * of the events wired up.
 * </p>
 *
 * @param {Boolean}
 *            async Set to true if component should be destroyed asynchronously.
 *            The default value is true.
 * @public
 */
Component.prototype.destroy = function(async) {
    this.fire("destroy");

	// #if {"modes" : ["TESTING", "TESTINGDEBUG", "AUTOTESTING",
	// "AUTOTESTINGDEBUG"]}
	async = false; // Force synchronous destroy when in testing modes
	// #end

	if (this.priv && !this._destroying) {
		// DCHASMAN TODO W-1879487 Reverted in 188 because of hard to diagnose
		// rerendering weirdness in a couple of tests and one:'s mru/lists view
		// Default to async destroy
		/*
		 * if (async === undefined) { async = true; }
		 */

		var key;

		if (this.priv.docLevelHandlers !== undefined) {
			for (key in this.priv.docLevelHandlers) {
				var dlh = this.priv.docLevelHandlers[key];
				if (dlh && dlh.setEnabled) {
					dlh.setEnabled(false);
				}
			}
		}

		if (async) {
			this._scheduledForAsyncDestruction = true;

			for (var i=0;i<this.priv.elements.length;i++) {
				var element = this.priv.elements[i];
				if (element && element.style) {
					element.style.display = "none";
				}
			}

			$A.util.destroyAsync(this);

			return null;
		}

		var priv = this.priv;

		this._destroying = true;

		var componentDef = this.getDef();
		var superComponent = this.getSuper();

		var globalId = priv.globalId;

		$A.renderingService.unrender(this);

		// Track some useful debugging information for InvalidComponent's use
		// #if {"excludeModes" : ["PRODUCTION"]}
		this._globalId = globalId;
		this._componentDef = componentDef;
        if(!this._description){this.toString();}
		// #end
        if (priv.attributes) {
            var expressions=priv.attributes.destroy(async);
            for(var x in expressions){
                expressions[x].removeChangeHandler(this,"v."+x);
            }
        }

		priv.elements = undefined;

		priv.deIndex(this);
		$A.componentService.deIndex(globalId);

		var vp = priv.valueProviders;
		if (vp) {
			for ( var k in vp) {
				var v = vp[k];
				if (v) {
					if ($A.util.isFunction(v.destroy)) {
						v.destroy(async);
					}
					delete vp[k];
				}
			}
		}

       // Swap in InvalidComponent prototype to keep us from having to add
        // validity checks all over the place
        $A.util.apply(this, InvalidComponent.prototype, true);

		if (priv.model) {
			priv.model.destroy(async);
		}

		var ar = priv.actionRefs;
		if (ar) {
			for (k in ar) {
				ar[k].destroy(async);
			}
		}

		if (componentDef) {
			var handlerDefs = componentDef.getAppHandlerDefs();
			if (handlerDefs) {
				for (i = 0; i < handlerDefs.length; i++) {
					var handlerDef = handlerDefs[i];
					var handlerConfig = {};
					handlerConfig["globalId"] = globalId;
					handlerConfig["event"] = handlerDef["eventDef"].getDescriptor().getQualifiedName();
					$A.eventService.removeHandler(handlerConfig);
				}
			}
		}

		if (superComponent) {
            superComponent.destroy(async);
        }

// JBUCH: HALO: TODO: FIXME
//        var references=priv.references;
//        if(references){
//            for(var reference in references){
//                references[reference].destroy();
//            }
//        }

		var eventDispatcher = priv.getEventDispatcher();
		if (eventDispatcher) {
			for (key in eventDispatcher) {
				var vals = eventDispatcher[key];
				if (vals) {
					for (var j = 0; j < vals.length; j++) {
						delete vals[j];
					}

					delete eventDispatcher[key];
				}
			}
		}

        this._marker=null;
        priv.superComponent = null;
        priv.model = null;
        priv.attributes = null;
        priv.valueProviders = null;
        priv.renderer = null;
        priv.actionRefs = null;
        priv.handlers=null;
        priv.eventDispatcher = null;
        priv.index = null;
        priv.componentDef = null;
        this.priv = null;

        this._destroying = false;

		return globalId;
	}

	return null;
};

/**
 * Returns true if this component has been rendered and valid.
 *
 * @protected
 */
Component.prototype.isRenderedAndValid = function() {
	return this.priv && !this._destroying && this.priv.rendered;
};

/**
 * Render this component
 *
 * @protected
 */
Component.prototype.render = function() {
	var renderer = this.priv.renderer;
	return renderer.def.render(renderer.renderable) || [];
};

/**
 * Returns true if this component has been rendered but not unrendered (does not
 * necessarily mean component is in the dom tree).
 *
 * @protected
 */
Component.prototype.isRendered = function() {
	return this.priv.rendered;
};

/**
 * Returns true if this component has been rendered but not unrendered (does not
 * necessarily mean component is in the dom tree).
 *
 * @private
 */
Component.prototype.setUnrendering = function(unrendering) {
	this.priv.inUnrender = unrendering;
};

/**
 * Returns true if this component has been rendered but not unrendered (does not
 * necessarily mean component is in the dom tree).
 *
 * @private
 */
Component.prototype.isUnrendering = function() {
	return this.priv.inUnrender;
};

/**
 * Sets the rendered flag.
 *
 * @param {Boolean}
 *            rendered Set to true if component is rendered, or false otherwise.
 * @protected
 */
Component.prototype.setRendered = function(rendered) {
	this.priv.rendered = rendered;
};

/**
 * Returns the renderer instance for this component.
 *
 * @protected
 */
Component.prototype.getRenderer = function() {
	return this.priv.renderer;
};

/**
 * Gets the globalId. This is the generated globally unique id of the component.
 * It can be used to locate the instance later, but will change across
 * pageloads.
 *
 * @public
 */
Component.prototype.getGlobalId = function() {
	return this.priv.globalId;
};

/**
 * Get the id set using the <code>aura:id</code> attribute. Can be passed into
 * <code>find()</code> on the parent to locate this child.
 *
 * @public
 */
Component.prototype.getLocalId = function() {
	return this.priv.localId;
};

/**
 * If the server provided a rendering of this component, return it.
 *
 * @public
 */
Component.prototype.getRendering = function() {
	var concrete = this.getConcreteComponent();

	if (this !== concrete) {
		return concrete.getRendering();
	} else {
		return this.priv.rendering;
	}
};

/**
 * Returns the super component.
 *
 * @protected
 */
Component.prototype.getSuper = function() {
	return this.priv.superComponent;
};

/* jslint sub: true */
/**
 * Associates a rendered element with the component that rendered it for later
 * lookup. Also adds the rendering component's global Id as an attribute to the
 * rendered element. Primarily called by RenderingService.
 *
 * @param {Object}
 *            config
 * @protected
 */
Component.prototype.associateElement = function(element) {
	if (!this.isConcrete()) {
		var concrete = this.getConcreteComponent();
		concrete.associateElement(element);
	} else {
		var priv = this.priv;
		if (!priv.elements) {
			priv.elements = [];
		}

		priv.elements.push(element);

		priv.associateRenderedBy(this, element);
	}
};

/**
 * Disassociates a rendered element with the component that rendered it for later
 * lookup.
 *
 * @param {Object}
 *            config
 * @protected
 */
Component.prototype.disassociateElements = function() {
    if (!this.isConcrete()) {
        var concrete = this.getConcreteComponent();
        concrete.disassociateElements();
    } else {
        if(this.priv.elements){
            this.priv.elements.length=0;
        }
    }
};

/**
 * Returns a map of the elements previously rendered by this component.
 *
 * @public
 */
Component.prototype.getElements = function() {
	if (!this.isConcrete()) {
		var concrete = this.getConcreteComponent();
		return concrete.getElements();
	} else {
		return (this.priv.elements && this.priv.elements.slice(0)) || [];
	}
};

/**
 * If the component only rendered a single element, return it. Otherwise, you
 * should use <code>getElements()</code>.
 *
 * @public
 */
Component.prototype.getElement = function() {
	var elements = this.getElements();
	if (elements) {
        for (var i = 0; i<elements.length; i++) {
			if (elements[i]){
				return elements[i];
			}
		}
	}
	return null;
};

/**
 * Returns a live reference to the value indicated using property syntax.
 *
 * @param {String}
 *            key The data key for which to return a reference.
 * @return {PropertyReferenceValue}
 * @public
 */
Component.prototype.getReference = function(key) {
    key = $A.expressionService.normalize(key);
    if(!this.priv.references.hasOwnProperty(key)){
        this.priv.references[key]=new PropertyReferenceValue(key, this);
    }
    return this.priv.references[key];
};

/**
 * Clears a live reference to the value indicated using property syntax.
 *
 * @param {String}
 *            key The data key for which to clear the reference.
 * @public
 */
Component.prototype.clearReference = function(key) {
    key = $A.expressionService.normalize(key);
    $A.assert(key.indexOf('.') > -1, "Unable to clear reference for key '" + key + "'. No value provider was specified. Did you mean 'v." + key + "'?");
    var path = key.split('.');
    var valueProvider = this.priv.getValueProvider(path.shift(), this);
    $A.assert(valueProvider, "Unknown value provider for key '" + key + "'.");
    $A.assert(valueProvider.clearReference, "Value provider does not implement clearReference() method.");
    var subPath=path.join('.');
    var value=valueProvider.clearReference(subPath);
    if($A.util.isExpression(value)){
        value.removeChangeHandler(this,key);
    }
};

/**
 * Returns the value referenced using property syntax.
 *
 * @param {String}
 *            key The data key to look up on the Component.
 * @public
 */
Component.prototype.get = function(key) {
    key = $A.expressionService.normalize(key).replace(/^v\.body\b/g,"v.body."+this.priv.globalId);
	var path = key.split('.');
	var root = path.shift();
	var valueProvider = this.priv.getValueProvider(root, this);
	if (path.length) {
        $A.assert(valueProvider, "Unable to get value for key '" + key + "'. No value provider was found for '" + root + "'.");
        return valueProvider.get(path.join('.'));
	} else {
		return valueProvider;
	}
};

/**
 * Returns a shadow value. Used for programmatically adding values after FCVs.
 * THIS IS NOT FOR YOU. DO NOT USE.
 *
 * @param {String}
 *            key The data key to look up on the Component.
 * @private
 */
Component.prototype.getShadowAttribute = function(key) {
    if(key.indexOf('v.')!==0){
        return null;
    }
    return this.priv.attributes.getShadowValue(key.substr(2));
};

/**
 * Sets the value referenced using property syntax.
 *
 * @param {String}
 *            key The data key to set on the Component. E.g.
 *            <code>cmp.set("v.key","value")</code>
 * @param {Object}
 *            value The value to set
 *
 * @public
 */
Component.prototype.set = function(key, value, ignoreChanges) {
    key = $A.expressionService.normalize(key).replace(/^v\.body\b/g,"v.body."+this.priv.globalId);
    $A.assert(key.indexOf('.') > -1, "Unable to set value for key '" + key + "'. No value provider was specified. Did you mean 'v." + key + "'?");

	var path = key.split('.');
	var valueProvider = this.priv.getValueProvider(path.shift(), this);

    $A.assert(valueProvider, "Unknown value provider for key '" + key + "'.");
    $A.assert(valueProvider.set, "Value provider does not implement set() method.");
    var subPath=path.join('.');

    var oldValue=valueProvider.get(subPath);

	var returnValue=valueProvider.set(subPath, value, ignoreChanges);
    if($A.util.isExpression(value)){
        value.addChangeHandler(this,key);
        if(!ignoreChanges){
            value=value.evaluate();
        }
    }

    var changed=$A.util.isArray(value)||$A.util.isObject(value)||oldValue!==value;
    if(changed&&!ignoreChanges) {
        $A.renderingService.addDirtyValue(key, this);
        var index=path.length>1?path[path.length-1]:undefined;
        this.priv.fireChangeEvent(this,key,oldValue,value,index);
    }
    return returnValue;
};

/**
 * Sets a shadow attribute. Used for programmatically adding values after FCVs.
 * THIS IS NOT FOR YOU. DO NOT USE.
 *
 * @param {String}
 *            key The data key to set on the Component.
 * @private
 */
Component.prototype.setShadowAttribute = function(key,value) {
    if(key.indexOf('v.')===0) {
        var oldValue = this.get(key);
        var attribute = key.substr(2);
        this.priv.attributes.setShadowValue(attribute, value);
        var newValue=this.get(key);
        if(oldValue!==newValue) {
            $A.renderingService.addDirtyValue(key, this);
            this.priv.fireChangeEvent(this, key, oldValue, newValue);
        }
    }
};


Component.prototype.markDirty=function(reason){
    $A.renderingService.addDirtyValue(reason||"Component.markDirty()",this);
};

Component.prototype.fireChangeEvent=function(key,oldValue,newValue,index){
    // JBUCH: HALO: FIXME: CAT 5: WE SEEM TO BE LEAKING VALUE CHANGE EVENTHANDLERS;
    // FIND THE REAL REASON AND REMOVE THE EVENT HANDLER, AS WELL AS THIS SHORTSTOP NPE FIX
    if(this.priv){
        this.priv.fireChangeEvent(this,key,oldValue,newValue,index);
    }
};

/**
 * Sets a flag to tell the rendering service whether or not to destroy this component when it is removed
 * from it's rendering facet. Set to false if you plan to keep a reference to a component after it has
 * been unrendered or removed from a parent facet. Default is true: destroy once orphaned.
 * @param {Boolean} destroy The flag to specify whether or not to destroy this component automatically.
 *
 * @public
 */
Component.prototype.autoDestroy = function(destroy) {
    if(!$A.util.isUndefinedOrNull(destroy)) {
        this.priv.autoDestroy = !!destroy;
    }else{
        return this.priv.autoDestroy;
    }
};

/**
 * Gets the concrete implementation of a component. If the component is
 * concrete, the method returns the component itself. For example, call this
 * method to get the concrete component of a super component.
 *
 * @public
 */
Component.prototype.getConcreteComponent = function() {
	var priv = this.priv;
	return priv.concreteComponentId ? componentService.get(priv.concreteComponentId) : this;
};

/**
 * Returns true if the component is concrete, or false otherwise.
 *
 * @public
 */
Component.prototype.isConcrete = function() {
	return !this.priv.concreteComponentId;
};

/**
 * Returns the value provider.
 *
 * @return {Object} value provider
 * @public
 */
Component.prototype.getAttributeValueProvider = function() {
	return this.priv.attributeValueProvider||this;
};

/**
 * Returns the value provider of the component.
 *
 * @return {Object} component or value provider
 * @public
 */
Component.prototype.getComponentValueProvider = function() {
    var valueProvider = this.priv.attributeValueProvider||this.priv.facetValueProvider;
    if (!valueProvider) {
        return undefined;
    }

    return valueProvider.auraType !== Component.prototype.auraType && $A.util.isFunction(valueProvider.getComponent) ?
        valueProvider.getComponent() : valueProvider;
};

/**
 * Gets the event dispatcher.
 *
 * @public
 */
Component.prototype.getEventDispatcher = function() {
	return this.priv.getEventDispatcher();
};

/**
 * Returns the model for this instance, if one exists. Shorthand :
 * <code>get("m")</code>
 *
 * @public
 */
Component.prototype.getModel = function() {
	return this.priv.model;
};

/**
 * Return a new Event instance of the named component event. Shorthand:
 * <code>get("e.foo")</code>, where e is the name of the event.
 *
 * @param {String}
 *            name The name of the Event.
 * @public
 */
Component.prototype.getEvent = function(name) {
	var eventDef = this.getDef().getEventDef(name);
	if (!eventDef) {
        return null;
	}
	return new Event({
		"name" : name,
		"eventDef" : eventDef,
		"component" : this.getConcreteComponent()
	});
};

/**
 * Get an event by descriptor qualified name.
 *
 * This is only used by action for firing of component events. It is a bit of a
 * hack (reversing the map).
 *
 * @param {String}
 *            descriptor a descriptor qualified name.
 * @return {String} null, or the component event.
 * @protected
 */
Component.prototype.getEventByDescriptor = function(descriptor) {
	var name = this.getDef().getEventNameByDescriptor(descriptor);
	if (name === null) {
		return null;
	}
	return this.getEvent(name);
};

/**
 * @private
 */
Component.prototype.fire = function(name) {
    var dispatcher=this.priv.getEventDispatcher();
    if(!dispatcher){
        return;
    }
    var eventDef = this.priv.componentDef.getEventDef(name,true);
    var eventQName = eventDef.getDescriptor().getQualifiedName();
    var handlers = dispatcher[eventQName];
    if(handlers){
        var event = new Event({
            "eventDef" : eventDef,
            "eventDispatcher" : dispatcher
        });
        event.setParams({
            value : this
        });
        event.fire();
    }
};

/**
 * Looks up the specified value and checks if it is currently dirty.
 *
 * @returns true if the value is dirty, and false if it is clean or does not
 *          exist.
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.isDirty = function(expression) {
    if(!expression){
        return $A.renderingService.hasDirtyValue(this);
    }
    return $A.renderingService.isDirtyValue(expression, this);
};

/**
 * Returns true if the component has not been destroyed.
 *
 * @public
 */
Component.prototype.isValid = function(expression) {
	if (!expression) {
		return !this._scheduledForAsyncDestruction && this.priv !== undefined;
	}
    return this.callOnExpression(Component.prototype.isValidCallback, expression);
};

/**
 * Looks up the specified value and sets it to valid or invalid.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.setValid = function(expression, valid) {
    if(valid != this.callOnExpression(Component.prototype.isValidCallback, expression)) {
        $A.renderingService.addDirtyValue(expression, this);
    }
    this.callOnExpression(Component.prototype.setValidCallback, expression, valid);
};

/**
 * Looks up the specified value and adds errors to it.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.addErrors = function(expression, errors) {
    if($A.util.isUndefinedOrNull(errors)){
        return;
    }
    this.callOnExpression(Component.prototype.addErrorsCallback, expression, errors);
    $A.renderingService.addDirtyValue(expression, this);
    this.priv.fireChangeEvent(this,expression,undefined,undefined,undefined);
};

/**
 * Looks up the specified value and clears errors on it.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.clearErrors = function(expression) {
    this.setValid(expression,true);
    $A.renderingService.addDirtyValue(expression, this);
    this.priv.fireChangeEvent(this,expression,undefined,undefined,undefined);
};

/**
 * Looks up the specified value and gets errors on it.
 *
 * @public
 * @deprecated TEMPORARY WORKAROUND
 */
Component.prototype.getErrors = function(expression) {
    return this.callOnExpression(Component.prototype.getErrorsCallback, expression);
};

Component.prototype.callOnExpression = function(callback, expression, option) {
    expression = $A.expressionService.normalize(expression);

    var path = expression.split('.');
    var root = path.shift();
    var valueProvider = this.priv.getValueProvider(root, this);

    $A.assert(valueProvider, "Unable to get value for expression '" + expression + "'. No value provider was found for '" + root + "'.");

    var subPath = path.join('.');
    return callback.call(this, valueProvider, root, subPath, option);
};

Component.prototype.isValidCallback = function(valueProvider, root, subPath) {
    $A.assert(valueProvider.isValid, "Value provider '" + root + "' doesn't implement isValid().");
    return valueProvider.isValid(subPath);
};

Component.prototype.setValidCallback = function(valueProvider, root, path, subPath) {
    $A.assert(valueProvider.setValid, "Value provider '" + root + "' doesn't implement setValid().");
    valueProvider.setValid(path, subPath);
};

Component.prototype.addErrorsCallback = function(valueProvider, root, subPath, errors) {
    $A.assert(valueProvider.addErrors, "Value provider '" + root + "' doesn't implement addErrors().");
    valueProvider.addErrors(subPath, errors);
};

Component.prototype.getErrorsCallback = function(valueProvider, root, subPath) {
    $A.assert(valueProvider.getErrors, "Value provider '" + root + "' doesn't implement getErrors().");
    return valueProvider.getErrors(subPath);
};

/**
 * Returns a string representation of the component for logging.
 *
 * @public
 */
Component.prototype.toString = function() {
	if(!this._description){
        this._description=this.getDef() + ' {' + this.getGlobalId() + '}' + (this.getLocalId() ? ' {' + this.getLocalId() + '}' : '');
    }
    var attributesOutput = [];
	// Debug Info
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    var attributes = this.get("v");
	if(attributes){
        for(var key in attributes.values) {
            attributesOutput.push(" "+ key + " = \"" + attributes.values[key] +"\"");
        }
    }
    //#end
    return this._description + attributesOutput.join(",");
};

/**
 * Returns component serialized as Json string
 *
 * @private
 */
Component.prototype.toJSON = function() {

	return $A.util.json.encode(this.priv.output(this));
};

/**
 * Returns an object whose keys are the lower-case names of Aura events for
 * which this component currently has handlers.
 */
Component.prototype.getHandledEvents = function() {
	var ret = {};
	var concrete = this.getConcreteComponent();
	var eventDispatcher = concrete.getEventDispatcher();
	if (eventDispatcher) {
		for ( var name in eventDispatcher) {
			if (eventDispatcher.hasOwnProperty(name) && eventDispatcher[name].length) {
				ret[name.toLowerCase()] = true;
			}
		}
	}

	return ret;
};

/**
 * Check if we have an event handler attached.
 *
 * @param {String}
 *            eventName The event name associated with this component.
 */
Component.prototype.hasEventHandler = function(eventName) {
	if (eventName) {
		var handledEvents = this.getHandledEvents();
		return handledEvents[eventName.toLowerCase()];
	}
	return false;
};

/**
 * Returns an array of this component's facets, i.e., attributes of type
 * <code>aura://Aura.Component[]</code>
 */
Component.prototype.getFacets = function() {
	if (!this.getFacets.cachedFacetNames) {
		// grab the names of each of the facets from the ComponentDef
		var facetNames = [];
		var attributeDefs = this.getDef().getAttributeDefs();

        //JBUCH: HALO: TODO: UNNECESSARY PERF HIT WITH .each() USING NEW STACKFRAME ON *EVERY* COMPONENT THAT HAS ATTRIBUTES (MOST COMPONENTS)
		attributeDefs.each(function(attrDef) {
			if (attrDef.getTypeDefDescriptor() === "aura://Aura.Component[]") {
				facetNames.push(attrDef.getDescriptor().getName());
			}
		});

		// cache the names--they're not going to change
		this.getFacets.cachedFacetNames = facetNames;
	}

	// then grab each of the facets themselves
	var names = this.getFacets.cachedFacetNames;
	var facets = [];

	for (var i = 0, len = names.length; i < len; i++) {
		facets.push(this.get("v." + names[i]));
	}

	return facets;
};

/**
 * Constructor for a doc level handler.
 *
 * @param {String}
 *            eventName the name of the event (must be valid dom event)
 * @param {Function}
 *            callback the callback function for the event (will be wrapped)
 * @param {Component}
 *            component the component attached to the handler.
 *
 * @constructor
 * @private
 */
$A.ns.DocLevelHandler = function DocLevelHandler(eventName, callback, component) {
	this.eventName = eventName;
	this.component = component;
	this.enabled = false;
	var that = this;
	this.callback = function(eventObj) {
		if (that.component.isRenderedAndValid()) {
			callback(eventObj);
		}
	};
};

/**
 * Set whether the handler is enabled.
 *
 * This function will enable or disable the handler as necessary. Note that the
 * callback will be called only if the component is rendered.
 *
 * @param {Boolean}
 *            enable if truthy, the handler is enabled, otherwise disabled.
 */
$A.ns.DocLevelHandler.prototype.setEnabled = function(enable) {
	if (enable) {
		if (!this.enabled) {
			this.enabled = true;
			$A.util.on(document.body, this.eventName, this.callback);
		}
	} else {
		if (this.enabled) {
			this.enabled = false;
			$A.util.removeOn(document.body, this.eventName, this.callback);
		}
	}
};

var dlp = $A.ns.DocLevelHandler.prototype;
exp(dlp, "setEnabled", dlp.setEnabled);

// #include aura.component.Component_export
