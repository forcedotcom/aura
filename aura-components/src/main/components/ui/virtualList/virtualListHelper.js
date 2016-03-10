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
        { type: 'dragstart', useCapture: false },
        { type: 'dragend', useCapture: false },
        { type: 'dragenter', useCapture: false },
        { type: 'dragleave', useCapture: false },
        { type: 'focus', useCapture: true },
        { type: 'blur', useCapture: true }
    ],
    initialize: function (cmp) {
        // Internal variables we use
        cmp._template          = null;
        cmp._virtualItems      = [];
        cmp._ptv               = null;
        cmp._dirtyFlag         = 0;
        cmp.set('v._dirty', 0, true);
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
        cmp._ptv.sync = ignore;
        cmp._ptv.ignoreChanges = ignore;
    },
    _initializeItemTemplate: function (cmpTemplate) {
        var container = document.createDocumentFragment();
        $A.render(cmpTemplate, container);
        return container;
    },
    initializeTemplate: function (cmp) {
        var tmpl  = cmp.get('v.itemTemplate')[0];
        var ref   = cmp.get('v.itemVar');
        var ptv   = this._createPassthroughValue(cmp, ref);
        tmpl["attributes"]["valueProvider"] = ptv;
        var shape = $A.createComponentFromConfig(tmpl);

        // Initialize internal setup
        cmp._shape             = shape;
        cmp._ptv               = ptv;
        cmp._template          = this._initializeItemTemplate(shape);
        ptv.ignoreChanges      = true;
        ptv.dirty              = false;

        cmp.addValueHandler({
            event  : 'change',
            value  : ref,
            method : this.onItemChange.bind(this, cmp, ptv)
        });
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
        var rowTmpl = cmp._template,
            ptv     = cmp._ptv,
            itemVar = cmp.get('v.itemVar'),
            clonedItem;

        // Change the PTV -> dirty whatever is needed
        ptv.set(itemVar, item);

        cmp.markClean('v.items'); // Mark ourselves clean before rerender (avoid calling rerender on ourselves)
        $A.renderingService.rerenderDirty('virtualRendering');

        // Snapshot the DOM
        clonedItem = rowTmpl.firstChild.cloneNode(true);

        // Attach the data to the element
        this._attachItemToElement(clonedItem, item);

        return clonedItem;
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
    getListBody: function (cmp, dom) {
        var node = dom ? dom[0] : cmp.getElement();
        return  node;
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
        container.appendChild(fragment);
        cmp.set('v.items', (cmp.get('v.items') || []).concat(items), true);
        this.ignorePTVChanges(cmp, false);
        $A.metricsService.markEnd(this.NS, this.NAME + ".appendVirtualRows");
    },
    updateItem: function (cmp, item, index) {
        this._rerenderDirtyElement(cmp, item, null, index);
    },
    getComponentByIndex: function(cmp, index, callback) {
        var items = cmp._virtualItems;
        if (index<0 || index>=items.length) {
            callback(null);
            return;
        }

        var shape  = cmp._shape,
            ptv    = cmp._ptv,
            ref    = cmp.get('v.itemVar'),
            target = cmp._virtualItems[index],
            item   = this._getItemAttached(target);

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

        if (!$A.util.isUndefinedOrNull(listRoot) && !$A.util.isUndefined(position) && position>=0 && position<items.length) {
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

    // NOTE: Do not rename this function not change its signature(instrumentation reliying on it)
    _dispatchAction: function (action, event /*cmp*/) {
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
            ref       = cmp.get('v.itemVar'),
            handlers  = [],
            shape     = cmp._shape,
            ptv       = cmp._ptv,
            getElmt   = function (t) { return t; },
            item, targetCmp, actionHandler, actionHandlerScope;

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
            // Seting up the event with some custom properties
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
            isExtended = superCmp.getDef().getDescriptor().getName() !== 'component';

        if (isExtended) {
            cmp = superCmp;
        }
        return cmp;
    }
})// eslint-disable-line semi