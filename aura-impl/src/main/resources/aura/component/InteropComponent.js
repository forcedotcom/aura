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
    this.componentDef = cmpDef;
    this.interopClass = cmpDef.interopClass;
    this.interopDef = window["Engine"]['getComponentDef'](cmpDef.interopClass);
    
    this.rendered = false;
    this.inUnrender = false;
    this.shouldAutoDestroy = true;
    this.localIndex = {};
    this.valueProviders = {};
    this.localId = config['localId'];
    this.attributeValueProvider = config['attributes']['valueProvider'];

    this.setupGlobalId(config['globalId']);

    $A.componentService.index(this);

    if (this.localId) {
        this.doIndex(this);
    }

    this.attributes = this.setupAttributes(config['attributes']);
    this.setupMethods();
    
}

// Prototype chain (instanceOf)
InteropComponent.prototype = Object.create(Component.prototype);
InteropComponent.prototype.constructor = InteropComponent;


InteropComponent.prototype.bridgeAction = function (prv, isEvent) {
    var self = this;
    return $A.getCallback(function callbackBridge(params) {
        var action = prv.evaluate();
        var evt = new Aura.Event.Event({ 'component' : self , 'sourceEvent': isEvent && params });
        // TODO: If there is more than one argument, pass it as argument expando?
        evt.params = isEvent ? { "detail" : params["detail"] } : params;
        $A.run(function () {
            action.runDeprecated(evt);
        });
    });

};

InteropComponent.prototype.setupAttributes = function(config) {
    var configValues = config && config['values'] || {};
    var attributes = {};
    var self = this;
    var changeHandlerPRVFactory = function(ctx) {
        return function (event) {
            ctx.attributeChange(this.handler.key, event.getParam('value'));
        };
    };
    var changeHandlerFCV = function (attr, fcv /*, event*/) {
        this.attributeChange(attr, fcv.evaluate());
    };

    for (var attribute in configValues) {
        var isEvent = false;
        var value = configValues[attribute];
        var valueConfig = value;

        if ($A.componentService.isConfigDescriptor(value)) {
            valueConfig = value["value"];
        }

        valueConfig = valueFactory.create(valueConfig, config['valueProvider'] || this);

        // Check typeof PRV | FCV
        if ($A.util.isExpression(valueConfig)) {
            // PRV type
            if (valueConfig.getExpression) { // Fastest typeof for PRV
                var key = $A.expressionService.normalize(valueConfig.getExpression());
                var provider = key.split('.')[0];
                $A.assert(provider === 'c' || provider === 'v', 'Provider type not supported');

                // For "v" add change handler, for "c" add bridging
                if (provider === 'v') {
                    valueConfig.addChangeHandler(this, attribute, changeHandlerPRVFactory(this));
                } else {
                    isEvent = value['descriptor'].indexOf('on') === 0;
                    valueConfig = this.bridgeAction(valueConfig, isEvent);
                }
            // FCV attribute
            } else {
                valueConfig.addChangeHandler(this, attribute, changeHandlerFCV.bind(self, attribute, valueConfig));
            }
        }

        // Check is on the definition and assign it as an attribute
        $A.assert(isEvent || attribute in this.interopDef["props"]);
        attributes[attribute] = valueConfig;
    }

    return attributes;
};

InteropComponent.prototype.setupMethods = function () {
    var interopDef = this.interopDef;
    var self = this;
    Object.keys(interopDef['methods']).forEach(function (m) {
        self[m] = function () {
            if (!self.rendered) {
                return $A.warning('Methods are not available until the component is rendered');
            }
            var elmt = this.getElement();
            elmt[m].apply(null, arguments);
        };
    });
};

InteropComponent.prototype.attributeChange = function (key, value) {
    if (this.rendered) {
        var elmt = this.getElement();
        elmt[key] = value;
    }
};

/**
 * Returns the value referenced using property syntax.
 * For example, <code>cmp.get('v.attr')</code> returns the value of the attr aura:attribute.
 *
 * @param {String}
 *            key - The data key to look up on the Component.
 * @public
 * @platform
 * @export
 */
InteropComponent.prototype.get = function (key) {
    key = $A.expressionService.normalize(key);
    var path = key.split('.');
    path.shift();
    var prop = $A.expressionService.resolve(path.join('.'), this.attributes);

    if (prop) {
        return $A.util.isExpression(prop.value) ? prop.value.evaluate() : prop;
    }
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.set = function (key, value) {
    key = $A.expressionService.normalize(key);
    var path = key.split('.');
    var provider = path.shift();

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
    } else {
        this.attributes[expr] = value;
        if (this.rendered) {
            var elmt = this.getElement();
            elmt[expr] = value;
        }
    }
};

/**
 * Invoke the render method defined on the component.
 * @export
 */
InteropComponent.prototype.render = function () {
    var Ctor = this.interopClass;
    var elmt = window["Engine"]['createElement'](this.componentDef.elementName, { 'is': Ctor });
    var cmp = this;

    Object.keys(this.attributes).forEach(function (p) {
        var attr = cmp.get('v.' + p);
        if (attr !== undefined) {
            if (p.indexOf('on') === 0) {
                elmt.addEventListener(p.substring(2), attr, false);
            } else {
                elmt[p] = attr;
            }
        }
    });

    return [elmt];
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
        if ($A.util.isExpression(attrValue.value)) {
            attrValue.value.removeChangeHandler(cmp, attrName);
        }
    });

    this.doDeIndex();
    $A.renderingService.unrender(this);
    $A.componentService.deIndex(this.globalId);
};

/**
 * @protected
 * @export
 */
InteropComponent.prototype.index = function() {
    this.raiseInvalidComponentError('index', arguments);
};

/**
 * @protected
 * @export
 */
InteropComponent.prototype.deIndex = function(){};

/**
 * @public
 * @export
 */
InteropComponent.prototype.find = function(){
    this.raiseInvalidComponentError('find', arguments);
};

/**
 * @private
 */
InteropComponent.prototype.findInstancesOf = function(){
    this.raiseInvalidComponentError('findInstancesOf', arguments);
};

/**
 * @private
 */
InteropComponent.prototype.getSuperest = function(){
    this.raiseInvalidComponentError('getSuperest', arguments);
};

/**
 *
 * @private
 */
InteropComponent.prototype.findInstanceOf = function(){
    this.raiseInvalidComponentError('findInstanceOf', arguments);
};

/**
 * @param {Object} type Applies the type to its definition.
 * @private
 */
InteropComponent.prototype.implementsDirectly = function(){
    this.raiseInvalidComponentError('implementsDirectly', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.addHandler = function(){
    this.raiseInvalidComponentError('addHandler', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.addValueHandler = function(){
    this.raiseInvalidComponentError('addValueHandler', arguments);
};

InteropComponent.prototype.removeValueHandler = function() {};



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
InteropComponent.prototype.getLocalId = function() {
    this.raiseInvalidComponentError('getLocalId', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getRendering = function(){
    this.raiseInvalidComponentError('getRendering', arguments);
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
    this.raiseInvalidComponentError('getEventDispatcher', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getModel = function(){
    this.raiseInvalidComponentError('getModel', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.getEvent = function() {
    this.raiseInvalidComponentError('getEvent', arguments);
};

/**
 * @protected
 */
InteropComponent.prototype.getEventByDescriptor = function() {
    this.raiseInvalidComponentError('getEventByDescriptor', arguments);
};

/**
 * @public
 * @export
 */
InteropComponent.prototype.toString = function(){
    return 'InteropComponent';
};

/**
 * @export
 */
InteropComponent.prototype.getFacets = function() {
    this.raiseInvalidComponentError('getFacets', arguments);
};

/**
 * @private
 */
InteropComponent.prototype.raiseInvalidComponentError = function(func, args) {
    var error = 'Interop component tried calling function [' + func + ']';
    var argsArr = Array.prototype.slice.call(args);
    if (argsArr.length) {
        error += ' with arguments [' + argsArr.join(',') + ']';
    }
    if (this._globalId && this._componentDef) {
        error += ', ' + this._componentDef + ' [' + this._globalId + ']';
    }

    var ae = new $A.auraError(error, null, $A.severity.QUIET);
    ae.component = this.toString();
    throw ae;
};

Aura.Component.InteropComponent = InteropComponent;
