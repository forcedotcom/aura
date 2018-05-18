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

/**
 * @class InteropComponent
 * @constructor
 * @private
 * @export
 */
function InteropComponent(config) {
    var cmpDef = $A.componentService.getDef(config['componentDef']);
    this.concreteComponentId = config["concreteComponentId"];
    this.containerComponentId = config["containerComponentId"];
    this.componentDef = cmpDef;
    this.interopClass = cmpDef.interopClass;
    this.interopDef = cmpDef.interopDef;
    this._customElement = null;

    this.rendered = false;
    this.inUnrender = false;
    this.shouldAutoDestroy = true;
    this.localIndex = {};
    this.valueProviders = {};
    this.handlers = {};
    this.localId = config['localId'];
    this.attributeValueProvider = config['attributes']['valueProvider'];
    this.owner = $A.clientService.getCurrentAccessGlobalId();
    this.currentClassMap = {};

    this.attrNameToPropMap = this.componentDef.attrNameToPropMap;
    this.propNameToAttrMap = this.componentDef.propNameToAttrMap;

    this.setupGlobalId(config['globalId']);

    $A.componentService.indexComponent(this);
    // Make locker service aware of interop component instance, transfer key from sanitized def
    $A.lockerService.trust(cmpDef.definition, this);
    if (this.localId) {
        this.doIndex(this);
    }

    this.attributes = this.setupAttributes(config['attributes']);
    this.updateReadOnlyBoundProps = [];
    this.setupMethods();

    this.HTML_ATTRS_TO_DOM_PROPS = this.componentDef.HTML_ATTRS_TO_DOM_PROPS;
}

// Prototype chain (instanceOf)
InteropComponent.prototype = Object.create(Component.prototype);
InteropComponent.prototype.constructor = InteropComponent;

InteropComponent.prototype.bridgeAction = function (prv, isEvent, hasNativeAPIExposed, action) {
    var component = this;

    return $A.getCallback(function callbackBridge(params) {
        var targetAction = (prv && prv.evaluate()) || action;
        var event = new Aura.Event.InteropEvent(component, {
            'isEvent': isEvent,
            'params': params,
            'exposeNativeAPI': !!hasNativeAPIExposed
        });

        $A.run(function () {
            targetAction.runDeprecated(event);
        });
    });

};

InteropComponent.prototype.hasNativeAPIExposed = function (eventName) {
    var interopMap = this.interopClass['interopMap'];
    var exposeNativeAPI = interopMap && interopMap['exposeNativeEvent'];

    return exposeNativeAPI && exposeNativeAPI[eventName];
};


InteropComponent.prototype.setupAttributes = function(config) {
    var configValues = config && config['values'] || {};
    var attributes = {};
    var self = this;

    var changeHandlerPRVFactory = function(ctx, attr) {
        return function (/*event*/) {
            ctx.attributeChange(attr || this.handler.key, ctx.get('v.' + (attr ? attr : this.handler.key)));
        };
    };

    var changeHandlerFCV = function (attr, fcv /*, event*/) {
        this.attributeChange(attr, fcv.evaluate());
    };

    for (var attribute in configValues) {
        if (attribute.indexOf('aura:') === 0) {
            // Ignore aura:id, aura:flavor, etc
            continue;
        }

        var isEvent = false;
        var value = configValues[attribute];
        var valueConfig = value;

        if ($A.componentService.isConfigDescriptor(value)) {
            valueConfig = value["value"];
        }

        var valueProvider = config['valueProvider'];

        valueConfig = valueFactory.create(valueConfig, valueProvider || this);

        var isExpression = $A.util.isExpression(valueConfig);

        /*
        This is just a close approximation and does not exactly emulate the
        behavior of Aura because we don't yet have attribute type metadata in
        LWC. Some notes for if/when we need to work on this again:
        1) For type=boolean attributes, Aura coerces strings into booleans.
        2) Aura only does the coercion initially. Coercion does not happen
           after the initial set().
        3) Aura only coerces to the boolean value `true` for the string "true".
           It coerces all other string values to the boolean value `false`. See
           the commented tests in interopBooleanAttributeCoercion.
        */
        if (!isExpression) {
            if (valueConfig === 'true') {
                valueConfig = true;
            }
            if (valueConfig === 'false') {
                valueConfig = false;
            }
        }

        // Check typeof PRV | FCV
        if (isExpression) {
            // GVP
            if (valueConfig.getIsGlobal && valueConfig.getIsGlobal()) {
                valueConfig = valueConfig.evaluate();
                // PRV typeconfigValues.callbackaction
            } else if (valueConfig.getExpression) {  // Fastest typeof for PRV
                var key = $A.expressionService.normalize(valueConfig.getExpression());
                var provider = key.split('.')[0];
                var isPTV = valueProvider instanceof PassthroughValue;
                $A.assert(isPTV || provider === 'c' || provider === 'v', 'Provider type not supported');

                var valueDescriptor = value['descriptor'] || attribute;
                var startsWithOn = valueDescriptor && valueDescriptor.indexOf('on') === 0;
                var hasNativeAPIExposed = startsWithOn && this.hasNativeAPIExposed(valueDescriptor.substr(2));
                // For "v" add change handler, for "v.[Aura.Action attribute]" and "c" add bridging
                if (provider === 'v') {
                    if (hasNativeAPIExposed) {
                        isEvent = true;
                        valueConfig = this.bridgeAction(valueConfig, isEvent, hasNativeAPIExposed);
                    } else {
                        valueConfig.addChangeHandler(this, attribute, changeHandlerPRVFactory(this));
                    }
                } else if (provider === 'c') {
                    var definedAttribute = !!this.interopDef['props'][valueDescriptor];
                    $A.assert(definedAttribute || startsWithOn, 'Attribute not defined in the component');
                    isEvent = !definedAttribute;
                    valueConfig = this.bridgeAction(valueConfig, isEvent, hasNativeAPIExposed);
                } else {
                    valueConfig.addChangeHandler(this, attribute, changeHandlerPRVFactory(this, attribute));
                }
                // FCV attribute
            } else {
                valueConfig.addChangeHandler(this, attribute, changeHandlerFCV.bind(self, attribute, valueConfig));
            }
        } else if ($A.util.isAction(valueConfig)) {
            isEvent = true;
            valueConfig = this.bridgeAction(undefined, isEvent, attribute.indexOf('on') === 0 && this.hasNativeAPIExposed(attribute.substr(2)), valueConfig);
        }

        // The mapping will have all public properties
        var isAttrInDefinition = !!this.attrNameToPropMap[attribute];
        var assertionMessage = '"' + attribute  + '" must either be a public property of ' + this.getName() + ' or a global HTML attribute';
        if (isEvent || isAttrInDefinition || this.isHtmlGlobalAttr(attribute)) {
            attributes[attribute] = valueConfig;
        } else {
            $A.warning(assertionMessage);
        }

    }

    return attributes;
};


InteropComponent.prototype.isHtmlGlobalAttr = function (attrName) {
    return InteropComponent.HTML_GLOBAL_ATTRS[attrName] || false;
};

InteropComponent.prototype.isReadOnlyProperty = function (propName) {
    return this.interopDef['props'][propName]['config'] === 1;
};

InteropComponent.HTML_GLOBAL_ATTRS = {
    'accesskey': true,
    'class': true,
    'contenteditable': true,
    'contextmenu': true,
    'dir': true,
    'draggable': true,
    'dropzone': true,
    'hidden': true,
    'id': true,
    'lang' : true,
    'spellcheck': true,
    'style': true,
    'tabindex': true,
    'title': true,
    'translate': true,
    'role': true
};

/**
 * Returns a list public methods names available on the component
 * @returns {string[]}
 * @export
 */
InteropComponent.prototype.getPublicMethodNames = function() {
    return Object.keys(this.interopDef['methods']);
};

InteropComponent.prototype.setupMethods = function () {
    var self = this;
    this.getPublicMethodNames().forEach(function (m) {
        self[m] = function () {
            if (!self.rendered) {
                return $A.warning('Methods are not available until the component is rendered');
            }
            var elmt = this.getElement();
            var rv = elmt[m].apply(elmt, arguments);
            return $A.componentService.moduleEngine['unwrap'](rv);
        };
    });
};

/**
 * Function called when an attribute changed in Aura land
 * @param key - { String }
 * @param value - { String }
 */
InteropComponent.prototype.attributeChange = function (key, value) {
    if (this.rendered) {
        var element = this.getElement();
        var propName = this.attrNameToPropMap[key];

        // we should first ask about propName, usually we have aura versions using a global attr, like style.
        if (!propName && this.isHtmlGlobalAttr(key)) {
            this.setGlobalAttribute(element, key, value);
        } else if (!this.isReadOnlyProperty(propName)) { // we ignore changes on read only properties
            element[propName] =  value;
            this.rehydrateBoundReadOnlyProps();
        }
    }
};

/**
 * re-hydrate each read-only prop that is bound to an attribute (expression)
 */
InteropComponent.prototype.rehydrateBoundReadOnlyProps = function() {
    this.updateReadOnlyBoundProps.forEach(function (func) {
        func();
    });
};


InteropComponent._classNameCacheMap = {};

/**
 * Creates a hash map for a given className string
 * e.g. `slds-grid slds-col` => { 'slds-grid': true, 'slds-col': true }
 * @param className
 * @returns {Object}
 */
InteropComponent.prototype.getMapFromClassName = function (className) {

    if (className === undefined || className == null || className === '') {
        return {};
    }

    var SPACE_CHAR = 32;
    var map = InteropComponent._classNameCacheMap[className];

    if (map) {
        return map;
    }

    map = {};

    var start = 0;
    var i, len = className.length;

    for (i = 0; i < len; i++) {
        if (className.charCodeAt(i) === SPACE_CHAR) {
            if (i > start) {
                map[className.slice(start, i)] = true;
            }
            start = i + 1;
        }
    }

    if (i > start) {
        map[className.slice(start, i)] = true;
    }

    InteropComponent._classNameCacheMap[className] = map;
    return map;
};

/**
 * Update the class attribute in the custom element, it makes a diff in between the previous class names
 * @param element
 * @param value
 */
InteropComponent.prototype.updateClassAttribute = function (element, value) {
    var currentClassMap = this.currentClassMap;
    $A.assert(currentClassMap !== null && (typeof currentClassMap === 'object'), 'Current Class Map must be an object.');

    var classMap = this.getMapFromClassName(value);

    Object.keys(currentClassMap).forEach(function (className) {
        if (!classMap[className]) {
            element.classList.remove(className);
        }
    });

    Object.keys(classMap).forEach(function (className) {
        if (!currentClassMap[className]) {
            element.classList.add(className);
        }
    });

    this.currentClassMap = classMap;
};

/**
 * Implement special logic for set HTML Global Attributes
 * @param element {node}
 * @param attrName { string }
 * @param value { any }
 */
InteropComponent.prototype.setGlobalAttribute = function (element, attrName, value) {
    if (attrName === 'class') {
        this.updateClassAttribute(element, value);
        return;
    }

    // data- attributes go through setAttribute
    if (
        attrName.charCodeAt(0) === 100 /* "d" character */ &&
        attrName.indexOf('data-') === 0
    ) {
        element.setAttribute(attrName, value);
        return;
    }

    // Map lower-case HTML global attributes to their camel-case DOM property
    // equivalent (e.g., readonly => readOnly, tabindex => tabIndex, etc).
    var propName = this.HTML_ATTRS_TO_DOM_PROPS[attrName] || attrName;

    element[propName] = value;
};



/**
 * Returns the value referenced using property syntax.
 * For example, <code>cmp.get('v.attr')</code> returns the value of the attr aura:attribute.
 *
 * @param {String} key - The data key to look up on the Component.
 * @public
 * @platform
 * @export
 */
InteropComponent.prototype.get = function (key) {
    key = $A.expressionService.normalize(key);
    var path = key.split('.');
    path.shift(); // remove provider
    $A.assert(path.length === 1, 'This component does not allow to get nested properties');
    var propValue = $A.expressionService.resolve(path.join('.'), this.attributes);

    if (propValue !== undefined
            && propValue !== null
            && $A.util.isExpression(propValue.value)) {
            propValue = propValue.value.evaluate();
    } else if (!$A.util.isExpression(this.attributes[path[0]])) {
        // when an attribute is unbound, it would not be in this.attributes
        // however, we should call interop module getter instead
        var propName = this.attrNameToPropMap[path[0]];
        var element = this.getElement();
        if (propName && element) {
            propValue = element[propName];
        }
    }

    return $A.componentService.moduleEngine['unwrap'](propValue);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.set = function (key, value) {
    var normalizedKey  = $A.expressionService.normalize(key);
    var path = normalizedKey.split('.');
    var provider = path.shift();
    var oldValue;

    $A.assert(provider === 'v', 'This component does not allow mutations on controller actions');
    $A.assert(path.length === 1, 'This component does not allow set on nested properties');

    var expr = path.join('.');
    var attrValue = this.attributes[expr];

    if (attrValue && $A.util.isExpression(attrValue.value)) {
        $A.warning('Component ' + this.componentDef.interopClassName
            + ' is not the owner of property "' + expr
            + '" and should not change it directly'
        );
        attrValue.value.set(value);
    } else if (attrValue && attrValue.getExpression) { // PRV
        oldValue = attrValue.evaluate();
        attrValue.set(value);

    } else { // set in case attribute was not explicitly set in markup
        oldValue = this.attributes[expr];
        this.attributes[expr] = value;
        this.attributeChange(expr, value);
    }

    var changed = $A.util.isArray(value) || $A.util.isObject(value) || oldValue !== value;
    if (changed) {
        this.fireChangeEvent(key, oldValue, value);
    }

};

InteropComponent.prototype.attachOnChangeToElement = function (element) {
    var self = this;
    function handleInteropChange(event) {
        var detail = event.detail;
        if (detail && event.target === element) {
            Object.keys(detail).forEach(function (propName) {
                var attrName = self.propNameToAttrMap[propName];
                if (attrName in self.attributes) {
                    self.set('v.' + attrName, detail[propName]);
                }
            });
        }
    }

    element.addEventListener('change', handleInteropChange);
};

/**
 * Render method for Interop components
 * In order to match the lifecycles in Aura and Interop, we need to create a dummy element
 * so the hook for DOM insertion do not get called yet.
 * On the after render we will swap the original version
 *
 * @export
 */
InteropComponent.prototype.render = function () {
    var element = document.createElement(this.componentDef.elementName);
    this._customElement = this.setupInteropInstance();
    $A.lockerService.trust(this, this._customElement);
    return [element];
};

InteropComponent.prototype.setupInteropInstance = function () {
    // W-4708703 This cache needs to be init/reset whenever we setup an interop instance
    this.currentClassMap = {};

    var Ctor = this.interopClass;
    var element = $A.componentService.moduleEngine['createElement'](this.componentDef.elementName, { 'is': Ctor });
    var cmp = this;
    element.__customElement = 1;
    this.attachOnChangeToElement(element);

    Object.keys(this.attributes).forEach(function (attrName) {
        var value = cmp.get('v.' + attrName);
        var propName = this.attrNameToPropMap[attrName];

        if (attrName.indexOf('on') === 0 && !propName) {
            element.addEventListener(attrName.substring(2), value, false);
        } else if (!propName && this.isHtmlGlobalAttr(attrName)) { // first check we are not overriding this attrName
            this.setGlobalAttribute(element, attrName, value);
        } else {
            if (!cmp.isReadOnlyProperty(propName)) { // Don't throw when they set value on the template to some read only prop
                if (value !== undefined) {
                    element[propName] = value;
                }
            } else {
                // bookkeeping readonly bound properties so that we can rehydrate them when attribute changed
                var attribute = this.propNameToAttrMap[propName];
                if ($A.util.isExpression(this.attributes[attribute])) {
                    this.updateReadOnlyBoundProps.push(function () {
                        cmp.set("v." + attribute, element[propName]);
                    });
                }
            }
        }
    }.bind(this));

    return element;
};

/*
 * In order to make lifecycle events match we need to swap the element in the afterRender
 * so the insertion hooks get called once the element is on the DOM.
*/
InteropComponent.prototype.swapInteropElement = function (currentElement, newElement) {
    if (currentElement === newElement) {
        return;
    }

    this.disassociateElements();
    // moveReferencesToMarker calls $A.util.insertBefore however we want to control dom connected here
    // so we check for swap existence in moveReferencesToMarker and skip insertBefore call
    $A.renderingService.moveReferencesToMarker(currentElement, newElement);
    this.associateElement(newElement);
    currentElement.parentElement.replaceChild(newElement, currentElement);

    this.updateContainerElement(this.getContainer(), currentElement, newElement);

    // only for components, not libraries
    if (typeof this.interopClass === 'function') {
        var cmp = this;
        var lwcCmp = this.getElement();

        // Set public accessors in attribute bag so aura land can get it.
        Object.keys(this.interopDef['props']).forEach(function (propName) {
            if (cmp.isReadOnlyProperty(propName)) {
                cmp.set('v.' + cmp.propNameToAttrMap[propName], lwcCmp[propName]);
            }
        });
    }
};

InteropComponent.prototype.updateContainerElement = function (container, currentElement, newElement) {
    if (!container) {
        return;
    }

    // AuraRenderingService.associateElements is called in finishRender
    // and that would add the temporary element (currentElement) to owner.elements
    // so when swap, we need to replace the instance in parent.elements
    var concrete = container.getConcreteComponent();
    if (concrete.getType() === "aura:html") {
        return;
    }

    var parentGetElements = concrete.getElements();
    if (parentGetElements) {
        if (parentGetElements.indexOf(currentElement) >= 0) {
            concrete.disassociateElements();

            for (var i = 0, len = parentGetElements.length; i < len; i++) {
                var element = parentGetElements[i];
                if (element === currentElement) {
                    concrete.associateElement(newElement);
                    $A.renderingService.addAuraClass(concrete, newElement);
                } else {
                    concrete.associateElement(element);
                }
            }
        } else if (parentGetElements.indexOf(newElement) >= 0) {
            $A.renderingService.addAuraClass(concrete, newElement);
        }
    }

    this.updateContainerElement(concrete.getContainer(), currentElement, newElement);
};

/**
 * Invoke the afterRender method
 * @export
 */
InteropComponent.prototype.afterRender = function () {
    if (this.destroyed || this.elements === undefined) {
        return;
    }

    var element = this.elements[0];

    // This used to be a document.body.contains(element) check but that breaks
    // when the element renders in a non-attached document fragment. This
    // check assumes that we can safely swap when we have a parent element.
    // It's not clear that this check is necessary as there were no comments
    // talking about any specific scenarios. Leaving it in to be safe.
    if (element && element.parentElement) {
        this.swapInteropElement(element, this._customElement);
        return;
    }

    var owner = $A.getCmp(this.owner);
    if (owner) {
        var handleValueRenderOnce = function () {
            owner.removeEventHandler('markup://aura:valueRender', handleValueRenderOnce);
            var el = this.elements[0];
            if (el && el.parentElement) {
                this.swapInteropElement(el, this._customElement);
            } else {
                $A.warning(
                    'Unexpected situation encountered where the interop component ' +
                    this.getGlobalId() +
                    ' never swapped in its custom element due to it missing its parentElement.'
                );
            }
        }.bind(this);
        owner.addEventHandler('markup://aura:valueRender', handleValueRenderOnce, 'default');
    }
};

/**
 * Invoke the unrender method
 * @export
 */
 InteropComponent.prototype.getElement = function () {
    return this._customElement;
 };


/**
 * Invoke the unrender method
 * @export
 */
InteropComponent.prototype.unrender = function () {
    $A.renderingService.cleanComponent(this.globalId);
    var elements = this.getElements();

    if (elements) {
        while (elements.length) {
            $A.util.removeElement(elements.pop());
        }
    }

    this.disassociateElements();
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.destroy = function(){
    var cmp = this;
    var attrs = this.attributes;

    Object.keys(attrs).forEach(function (attrName) {
        var attrValue = attrs[attrName];
        if (attrValue && $A.util.isExpression(attrValue.value)) {
            attrValue.value.removeChangeHandler(cmp, attrName);
        }
    });

    this.doDeIndex();
    $A.renderingService.unrender(this);
    $A.componentService.deIndex(this.globalId);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.find = function(){
    return null;
};

/**
 * @private
 */
InteropComponent.prototype.findInstancesOf = function(){
    return [];
};

/**
 * @private
 */
InteropComponent.prototype.findInstanceOf = function(){
    return null;
};

/**
 *
 * @private
 */
InteropComponent.prototype.getSuperest = function(){
    this.raiseInvalidInteropApi('getSuperest', arguments);
};

/**
 * @param {Object} type Applies the type to its definition.
 * @private
 */
InteropComponent.prototype.implementsDirectly = function(){
    this.raiseInvalidInteropApi('implementsDirectly', arguments);
};

/**
 * @protected
 */
InteropComponent.prototype.getRenderer = function() {};

InteropComponent.prototype.getReference = function() {};

/**
 * @private
 */
InteropComponent.prototype.fire = function() {};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getRendering = function(){
    this.raiseInvalidInteropApi('getRendering', arguments);
};

/**
 * @protected
 * @export
 */
InteropComponent.prototype.getSuper = function(){ return null; };
/**
 * @public
 * @export
 */
InteropComponent.prototype.getConcreteComponent = function(){
    return this;
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.isConcrete = function() {
    return true;
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getEventDispatcher = function(){
    this.raiseInvalidInteropApi('getEventDispatcher', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getModel = function(){
    this.raiseInvalidInteropApi('getModel', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getEvent = function() {
    this.raiseInvalidInteropApi('getEvent', arguments);
};

/**
 * @protected
 */
InteropComponent.prototype.getEventByDescriptor = function() {
    this.raiseInvalidInteropApi('getEventByDescriptor', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.toString = function(){
    return 'InteropComponent: ' + this.componentDef.getDescriptor().toString();
};

/**
 * @export
 */
InteropComponent.prototype.getFacets = function() {
    this.raiseInvalidInteropApi('getFacets', arguments);
};

/**
 * @private
 */
InteropComponent.prototype.raiseInvalidInteropApi = function(func, args) {
    var error = 'Interop component tried calling function [' + func + ']';
    var argsArr = Array.prototype.slice.call(args);
    if (argsArr.length) {
        error += ' with arguments [' + argsArr.join(',') + ']';
    }
    if (this.globalId && this.componentDef) {
        error += ', ' + this.componentDef + ' [' + this.globalId + ']';
    }

    var ae = new $A.auraError(error, null, $A.severity.QUIET);
    ae.component = this.toString();
    throw ae;
};

Aura.Component.InteropComponent = InteropComponent;
