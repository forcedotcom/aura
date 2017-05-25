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
({
    DELEGATED_EVENTS: [
        { type: 'click', useCapture: false },
        { type: 'mouseover', useCapture: false },
        { type: 'mouseout', useCapture: false },
        { type: 'keypress', useCapture: false },
        { type: 'keydown', useCapture: false },
        { type: 'dragstart', useCapture: false },
        { type: 'dragend', useCapture: false },
        { type: 'dragenter', useCapture: false },
        { type: 'dragleave', useCapture: false },
        { type: 'focus', useCapture: true },
        { type: 'blur', useCapture: true }
    ],
    
    DEFAULT_TEMPLATE_KEY: 'TEMPLATE',
    DEFAULT_ITEM_ELEMENT: 'DIV',
    
    initialize: function (cmp) {
        // Internal variables we use
        cmp._templateMap       = {};
        cmp._virtualItems      = [];
        cmp._dirtyFlag         = 0;
        cmp.set('v._dirty', 0, true);
    },
    reset: function (cmp) {
        this.initialize(cmp);
    },
    initializeBody: function (cmp) {
        var body = cmp.get('v.body');
        if (!body.length) {
            var bodyCmp = $A.createComponentFromConfig({
                componentDef: {
                    descriptor: 'markup://aura:html'
                },
                attributes: {
                    valueProvider: cmp,
                    values: {
                        tag: 'section'
                    }
                }
            });
            cmp.set('v.body', [bodyCmp]);
        }
    },
    initializeDataModel: function(cmp) {
        var dataModel = cmp.get("v.dataProvider")[0];
        if (dataModel) {
            dataModel.addHandler("onchange", cmp, "c.handleDataChange");
        }
    },
     _createPassthroughValue: function(cmp, itemVar, item) {
        var context = {};
        context[itemVar] = item;
        return $A.expressionService.createPassthroughValue(context, cmp);
    },
    onItemChange: function (cmp, ptv, evt) {
        if (!ptv.ignoreChanges) {
            ptv.dirty = true;
        }

        if (!ptv.sync && cmp.isRendered()) { // Some component has updated asyncronously the item, rerender it
            ptv.sync = true; // at this point the action becomes sync
            var item = evt.getParam('value');
            this._rerenderDirtyElement(cmp, item);
        }
    },
    ignorePTVChanges: function (cmp, ignore) {
        var templateMap = cmp._templateMap;
        
        for (var key in templateMap) {
            var templateData = templateMap[key];
            if (templateData.ptv) {
                templateData.ptv.sync = ignore;
                templateData.ptv.ignoreChanges = ignore;
            }
        }
    },
    _initializeItemTemplate: function (cmpTemplate) {
        var container = document.createDocumentFragment();
        $A.render(cmpTemplate, container);
        $A.afterRender(cmpTemplate);
        return container;
    },
    initializeTemplate: function (cmp) { 
        var tmpl        = cmp.get('v.itemTemplate')[0];
        var templateMap = cmp.get('v.templateMap');
        var ref         = cmp.get('v.itemVar');
        
        if (templateMap) {
            // ignore itemTemplate if we have a template map
            for (var key in templateMap) {
                this._setTemplateCache(cmp, key, this.createTemplateData(cmp, templateMap[key], ref));
            }
        } else {
            this._setTemplateCache(cmp, this.DEFAULT_TEMPLATE_KEY, this.createTemplateData(cmp, tmpl, ref));
        }
    },

    addTemplate: function(cmp, key, template) {
        var ref = cmp.get('v.itemVar');
        
        // Check validity of key
        if (!this._templateCacheContains(cmp, key)) {
            this._setTemplateCache(cmp, key, this.createTemplateData(cmp, template, ref));
        }
    },
    
    createTemplateData: function(cmp, template, ref) {
        var templateData = {};
        
        templateData.ptv = this._createPassthroughValue(cmp, ref);
        template["attributes"]["valueProvider"] = templateData.ptv;
        
        var shape = $A.createComponentFromConfig(template);
        templateData.shape = shape;
        templateData.template = this._initializeItemTemplate(shape);
        
        templateData.ptv.ignoreChanges = true;
        templateData.ptv.dirty = false;
        
        cmp.addValueHandler({
            event   : 'change',
            value   : ref,
            method  : this.onItemChange.bind(this, cmp, templateData.ptv)
        });
    
        return templateData;
    },
    
    handleTemplateChange: function(cmp, templateAttribute) {
        this.reset(cmp);
        this.initializeTemplate(cmp);

        this.markClean(cmp, 'v.' + templateAttribute);
        this.createVirtualList(cmp);
        this.markDirty(cmp); // So we go into the rerender
    },

    initializeItems: function (cmp) {
        var dataModel = cmp.get("v.dataProvider")[0],
            model     = dataModel && dataModel.getModel(),
            items     = model && model.get('items');

        if (items) {
            cmp.set("v.items", items, true);
        } else if (dataModel) {
            dataModel.getEvent('provide').fire();
        }
    },
    _attachItemToElement: function (dom, item) {
        dom._data = item;
    },
    _generateVirtualItem: function (cmp, item) {
        var templateData = this._getTemplateData(cmp, item);
        if (templateData) {
            var rowTmpl = templateData.template,
                ptv     = templateData.ptv,
                itemVar = cmp.get('v.itemVar'),
                clonedItem;
            
            ptv.set(itemVar, item);
            
            cmp.markClean('v.items');
            $A.renderingService.rerenderDirty('virtualRendering');

            if (rowTmpl && rowTmpl.firstChild) {
                clonedItem = rowTmpl.firstChild.cloneNode(true);
            } else {
                $A.warning("Template data its invalid. Defaulting to " + this.DEFAULT_ITEM_ELEMENT);
                return document.createElement(this.DEFAULT_ITEM_ELEMENT);
            }
            
            // SVG IE11 workaround
            if ($A.get("$Browser.isIE11")) {
                var svgElements = clonedItem.querySelectorAll('svg');
                for (var i = 0; i < svgElements.length; i++) {
                    this.svgLib.stamper.stamp(svgElements[i]);
                }
            }
            
            // Attach the data to the element
            this._attachItemToElement(clonedItem, item);
            
            return clonedItem;
        } else {
            $A.warning("No template data found. Defaulting to " + this.DEFAULT_ITEM_ELEMENT);
            return document.createElement(this.DEFAULT_ITEM_ELEMENT);
        }
    },
    createVirtualList: function (cmp) {
        var items = cmp.get('v.items');
        cmp._virtualItems = [];
        if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
                cmp._virtualItems.push(this._generateVirtualItem(cmp, items[i]));
            } 
        }
    },
    
    appendVirtualRows: function (cmp, items) {
        $A.metricsService.markStart(this.NS, this.NAME + ".appendVirtualRows", {auraid : cmp.getGlobalId()});
        this.ignorePTVChanges(cmp, true);
        var fragment  = document.createDocumentFragment(),
            container = this.getListBody(cmp);

        for (var i = 0; i < items.length; i++) {
            var virtualItem = this._generateVirtualItem(cmp, items[i]);
            cmp._virtualItems.push(virtualItem);
            fragment.appendChild(virtualItem);
        }
        if (container) {
            container.appendChild(fragment);
        }
        cmp.set('v.items', (cmp.get('v.items') || []).concat(items), true);
        this.ignorePTVChanges(cmp, false);
        $A.metricsService.markEnd(this.NS, this.NAME + ".appendVirtualRows");
    },

    getListBody: function (cmp, dom) {
        var node = dom ? dom[0] : cmp.getElement();
        return node;
    },
    markClean: function (cmp, value) {
        var concreteCmp = cmp.getConcreteComponent();
        concreteCmp.markClean(value);
    },
    markDirty: function (cmp) {
        var concreteCmp = cmp.getConcreteComponent();
        concreteCmp.set('v._dirty', ++cmp._dirtyFlag);
    },
    createEventDelegates: function (cmp, container) {
        var self     = this,
            events   = this.DELEGATED_EVENTS,
            delegate = function (e) {
                self._eventDelegator(cmp, e);
            };
        
        for (var i = 0; i < events.length; i++) {
            container.addEventListener(events[i].type, delegate, events[i].useCapture);
        }
    },

    updateItem: function (cmp, item, index) {
        this._rerenderDirtyElement(cmp, item, null, index);
    },
    // TODO: Test TemplateMap
    getComponentByIndex: function(cmp, index, callback) {
        var items = cmp._virtualItems;
        if (index<0 || index>=items.length) {
            callback(null);
            return;
        }

        var target = cmp._virtualItems[index];
        var item = this._getItemAttached(target);
        
        var templateData = this._getTemplateData(cmp, item);
        
        var shape  = templateData.shape,
            ptv    = templateData.ptv,
            ref    = cmp.get('v.itemVar');

        // Setting up the component with the current item
        shape.getElement = function () { return target; };
        ptv.sync  = true;
        ptv.set(ref, item, true);
        ptv.ignoreChanges = false;
        ptv.dirty = false;

        callback(shape);
    },
    _findVirtualElementPosition: function (virtualElements, item, element) {
        for (var i = 0; i < virtualElements.length; i++) {
            var ve = virtualElements[i];
            if (element && ve === element || ve._data === item) {
                return i;
            }
        }
        return null;
    },
    _replaceDOMElement: function (parent, newChild, oldChild) {
        parent.replaceChild(newChild, oldChild);
    },
    // oldElement or index may be null
    _rerenderDirtyElement: function (cmp, item, oldElement, index) {
        var listRoot   = this.getListBody(cmp),
            items      = cmp._virtualItems,
            // if the index is passed in, then we take it, otherwise we try to find it
            position   = (!$A.util.isUndefined(index))?index:this._findVirtualElementPosition(items, item, oldElement),
            newElement = this._generateVirtualItem(cmp, item);

        if (!$A.util.isUndefinedOrNull(listRoot) && !$A.util.isUndefinedOrNull(position) && position>=0 && position<items.length) {
            if (!oldElement) {
                oldElement = items[position];
            }

            items[position] = newElement;
            this._replaceDOMElement(listRoot, newElement, oldElement);
        }
    },
    _getRenderingComponentForElement: function (domElement) {
        var id  = $A.util.getDataAttribute(domElement, 'auraRenderedBy');
        return id && $A.componentService.get(id);
    },

    // NOTE: Do not rename this function nor change its signature(instrumentation relying on it)
    _dispatchAction: function (action, event /*, cmp*/) {
        action.runDeprecated(event);
    },
    _getItemAttached: function (dom) {
        return dom._data;
    },
    _getActionHandler: function (htmlCmp, eventType) {
        var eventTypeAttribute = 'on' + eventType,
            htmlAttr = htmlCmp.isInstanceOf('aura:html') && htmlCmp.get('v.HTMLAttributes');
        return htmlAttr && htmlAttr[eventTypeAttribute];
    },

    _eventDelegator: function (cmp, e) {
        var type     = e.type,
            target    = e.target,
            handlers  = [],
            item, targetCmp, actionHandler;

        while (target) {
            targetCmp = this._getRenderingComponentForElement(target);
            // Guard for existance since there are cases like container components 
            // that might not have elements associated with them.
            if (targetCmp) { 
                actionHandler = this._getActionHandler(targetCmp, type);
                if (actionHandler) {
                    handlers.push({
                        "handler"   : actionHandler,
                        "target"    : target,
                        "targetCmp" : targetCmp
                    });
                }
            }

            if ((item = this._getItemAttached(target))) {
                break;
            }
            target = target.parentElement;
        }

        if (!handlers.length > 0) {
            return;
        }
        
        if (item) {
            var templateData = this._getTemplateData(cmp, item),
                shape = templateData.shape,
                ptv = templateData.ptv,
                ref = cmp.get('v.itemVar'),
                getElmt   = function (t) { return t; },
                actionHandlerScope;
                
            // Setting up the event with some custom properties
            e.templateItem = item;
            e.templateElement = target;
            shape.getElement = getElmt.bind(null, target);

            // Setting up the component with the current item
            ptv.sync  = true;
            ptv.set(ref, item, true);
            ptv.ignoreChanges = false;
            ptv.dirty = false;

            // Execute the collected handlers in order
            while ((actionHandlerScope = handlers.shift())) {
                actionHandler = actionHandlerScope.handler;
                if ($A.util.isExpression(actionHandler)) {
                    actionHandlerScope.targetCmp.getElement = getElmt.bind(null, actionHandlerScope.target);
                    this._dispatchAction(actionHandler.evaluate(), e, actionHandlerScope.targetCmp);
                    delete actionHandlerScope.targetCmp.getElement;
                }
            }
            
            // TODO: Being smarter when to rerender: 
            // If there is an internal change (no ptv), 
            // content wont update automatically:
            if (ptv.dirty || cmp.get('v.forceRender')) { 
                this._rerenderDirtyElement(cmp, item, target);
            }

            delete shape.getElement;
            ptv.ignoreChanges = true;
            ptv.sync = false;
        }
    },
    _getRootComponent: function (cmp) {
        var superCmp   = cmp.getSuper(),
            isExtended = superCmp.getType() !== 'aura:component';

        if (isExtended) {
            cmp = superCmp;
        }
        return cmp;
    },
    
    _setTemplateCache: function(cmp, key, value) {
        cmp._templateMap[key] = value;
    },
    
    _getTemplateData: function(cmp, item) {
        var templateMap = cmp._templateMap;
        var template = templateMap[item.key];
        
        if (!template) {
            template = templateMap[this.DEFAULT_TEMPLATE_KEY];
        }
        
        return template;
    },
    
    _templateCacheContains: function(cmp, key) {
        return !!cmp._templateMap[key];
    },
    
    _destroyShapes: function(cmp) {
        var templateMap = cmp._templateMap;
        
        for (var key in templateMap) {
            var shape = templateMap[key].shape;
            if (shape) {
                shape.destroy();
            }
        }
    }
})// eslint-disable-line semi