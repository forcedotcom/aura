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
    NS: "UIPERF",
    NAME: "ui:virtualDataTable",
    
    DELEGATED_EVENTS : [],
    USE_CAPTURE : ['focus', 'blur'],
    
    DEFAULT_TEMPLATES : {
        row    : 'tr',
        column : 'td',
        header : 'th'
    },
    
    initialize: function (cmp) {
        // Internal variables we use
        cmp._templates        = [];
        cmp._virtualItems     = [];
        cmp._ptv              = null;
        cmp._dirtyFlag        = 0;
        cmp.set('v._dirty', 0, true);
    },
    reset: function (cmp) {
        this.initialize(cmp);
    },
    verifyInterfaces: function (cmp) {
        // TODO
        
        // Verify rowHeaders attributes
        if (cmp.get("v.useRowHeaders") && (cmp.get("v.rowHeaderIndex") < 0)) {
            cmp.set("v.rowHeaderIndex", 0);
        }
    },
    initializeDataModel: function(cmp) {
        var dataModel = cmp.get("v.dataModel")[0];
        if (dataModel) {
            dataModel.addHandler("onchange", cmp, "c.handleDataChange");
        }
    },
    initializeItems: function (cmp) {
        var dataModel = cmp.get("v.dataModel")[0],
            model     = dataModel && dataModel.getModel(),
            items     = model && model.get('items');

        if (items) {
            cmp.set("v.items", items, true);
        } else if (dataModel) {
            dataModel.getEvent('provide').fire();
        }
    },
    initializeHeaderColumns: function (cmp) {
        var headerDefs = cmp.get('v.headerColumns');
        if (!headerDefs) {
            return;
        }

        for (var i = 0; i < headerDefs.length; i++) {
            if (headerDefs[i].isInstanceOf("ui:hasGridEvents")) {
                headerDefs[i].addHandler("gridAction", cmp, "c.handleGridAction");
            }
        }
    },     
    initializeTemplates: function (cmp) {
        var columnsDefs = cmp.get('v.columns');
        if (!columnsDefs) {
            return;
        }
        var itemVar     = cmp.get('v.itemVar'),
            templates   = cmp._templates,
            ptv         = this._createPassthroughValue(cmp, itemVar);

        for (var i = 0; i < columnsDefs.length; i++) {
            columnsDefs[i]["attributes"]["valueProvider"] = ptv;
            templates.push($A.createComponentFromConfig(columnsDefs[i]));

            if (templates[i].isInstanceOf("ui:hasGridEvents")) {
                templates[i].addHandler("gridAction", cmp, "c.handleGridAction");
            }
        }

        cmp._ptv = ptv;
        cmp._rowTemplate = this._initializeRowTemplate(templates, cmp.get("v.rowHeaderIndex"));
        ptv.ignoreChanges = true;
        ptv.dirty = false;

        // Add handler for itemvar
        cmp.addValueHandler({
            event  : 'change',
            value  : itemVar,
            method : this.onItemChange.bind(this, ptv)
        });
    },
    virtualRerender: function (cmp) {
        this.bootstrapVirtualGrid(cmp);
    },
    onItemChange: function (ptv) {
        if (!ptv.ignoreChanges) {
            ptv.dirty = true;
        }
    },
    getGridBody: function (cmp) {
        return cmp.find('tbody').getElement();
    },
    markClean: function (cmp, value) {
        var concreteCmp = cmp.getConcreteComponent();
        concreteCmp.markClean(value);
    },
    markDirty: function (cmp) {
        var concreteCmp = cmp.getConcreteComponent();
        concreteCmp.set('v._dirty', ++cmp._dirtyFlag);
    },
    _initializeRowTemplate: function (templates, rowHeaderIndex) {
        var row = document.createElement(this.DEFAULT_TEMPLATES.row),
            startIndex = 0,
            column;
        
        for (var i = startIndex; i < templates.length; i++) {
            var isRowHeader = (i === rowHeaderIndex);
            if (templates[i].isInstanceOf("ui:tableCell")) {
                if (isRowHeader) {
                    templates[i].set("v.rowHeader", true);
                }
                column = $A.render(templates[i])[0];
            } else {
                column = this._wrapColumn(templates[i], isRowHeader);
            }
            row.appendChild(column);
        }
        $A.afterRender(templates);
        return row;
    },
    
    _wrapColumn: function(template, isRowHeader) {
        var column;
        
        if (isRowHeader) {
            column = this._createColumn(this.DEFAULT_TEMPLATES.header, template);
            column.setAttribute("scope", "row");
        } else {
            column = this._createColumn(this.DEFAULT_TEMPLATES.column, template);
        }
        
        return column;
    },
    
    _createColumn: function (elementTemplate, columnTemplate) {
        var column = document.createElement(elementTemplate);
        $A.render(columnTemplate, column);
        return column;
    },
    _createPassthroughValue: function(cmp, itemVar, item, rowIndex) {
        var rowContext = {
            index : rowIndex || 0
        };
        rowContext[itemVar] = item;
        return $A.expressionService.createPassthroughValue(rowContext, cmp);
    },
    /* 
    * Event delegation logic
    * Called at rendering time.
    */
    createEventDelegates: function (cmp, container) {
        var self     = this,
            events   = cmp.get("v.delegatedEvents"),
            delegate = function (e) {
                self._eventDelegator(cmp, e);
            };
        
        if (!$A.util.isEmpty(events)) {
            events = events.split(',');
            for (var i = 0; i < events.length; i++) {
                var useCapture = this.USE_CAPTURE.indexOf(events[i]) !== -1;
                container.addEventListener(events[i], delegate, useCapture);
            }
        }
    },
    _getRenderingComponentForElement: function (domElement) {
        var id  = $A.util.getDataAttribute(domElement, 'auraRenderedBy');
        return id && $A.componentService.get(id);
    },
    // NOTE: Do not rename this function nor change its signature(instrumentation relying on it)
    _dispatchAction: function (actionHandler, event /*,cmp*/) {
        actionHandler.runDeprecated(event);
    },
    _getActionHandler: function (htmlCmp, eventType) {
        if (htmlCmp.isInstanceOf("aura:html")) {
            var attributes = htmlCmp.get("v.HTMLAttributes");
            if (attributes) {
                return attributes["on"+eventType];
            }
        }
        return null;
    },
    _eventDelegator: function (cmp, e) {

        if(!cmp.isValid()) {
            return;
        }

         var type     = e.type,
            target    = e.target,
            child     = e.target,
            ref       = cmp.get('v.itemVar'),
            templates = cmp._templates,
            handlers  = [],
            ptv       = cmp._ptv,
            getElmt   = function (t) { return t; },
            position,
            item, targetCmp, actionHandler, actionHandlerScope;
            
        // target = target.parentNode, it may reach the root document which doesn't have the getAttribute method
        while (target && target.getAttribute) {
            
            if (target.getAttribute("data-virtualDataTable-skipEventDelegation")) {
                // only clear out the handlers but continue in case there are more event handlers to be executed
                handlers  = [];
            }

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
                position = Array.prototype.indexOf.call(target.childNodes, child);
                break;
            }

            child  = target;
            target = target.parentNode;
        }

        if (!handlers.length > 0) {
            return;
        }

         if (item) {
            // Setting up the event with some custom properties
            e.templateItem = item;
            e.templateElement = target;
            if (child && position !== -1) {
                // we try to put the right html on the virtual component
                templates[position].getElement = function () { return child.firstChild; };
            }

            // Setting up the component with the current item
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

            if (ptv.dirty) {
                this._rerenderDirtyElement(cmp, item, target, null); // (cmp, item, target, index)
            }
            
            delete templates[position].getElement;
            ptv.ignoreChanges = true;
        }
    },
    _findVirtualElementPosition: function (items, target) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === target) {
                return i;
            }
        }
        return null;
    },
    _replaceDOMElement: function (parent, newChild, oldChild) {
        if (parent.hasChildNodes()) {
            parent.replaceChild(newChild, oldChild);
        }
    },
    _rerenderDirtyElement: function (cmp, item, target, index) {
        var gridBody     = this.getGridBody(cmp),
            virtualItems = cmp._virtualItems;
        
        index = (!$A.util.isUndefinedOrNull(index)) ? index : this._findVirtualElementPosition(virtualItems, target);

        if (!$A.util.isUndefinedOrNull(gridBody) && !$A.util.isUndefinedOrNull(index) &&
            index >= 0 && index < virtualItems.length) {
            
            var updatedRow = this._generateVirtualRow(cmp, item, index);
            if (!target) {
                target = virtualItems[index];
            }

            virtualItems[index] = updatedRow;
            this._replaceDOMElement(gridBody, updatedRow, target);
            this.fireRenderEvent(cmp, "update", index);
        }
    },
    
    _generateVirtualRow: function (cmp, item, index) {
        var rowTmpl = cmp._rowTemplate,
            itemVar = cmp.get('v.itemVar'),
            ptv     = cmp._ptv,
            clonedRow;

        // Change the PTV -> dirty whatever is needed
        if ($A.util.isString(itemVar)) {
            ptv.set(itemVar, item);
        }

        cmp.markClean('v.items'); // Mark ourselves clean before rerender (avoid calling rerender on ourselves)
        $A.renderingService.rerenderDirty('virtualRendering');

        // Snapshot the DOM
        clonedRow = rowTmpl.cloneNode(true);
        
        // SVG IE11 workaround
        if ($A.get("$Browser.isIE11")) {
            var svgElements = clonedRow.querySelectorAll('svg');
            for (var i = 0; i < svgElements.length; i++) {
                this.svgLib.stamper.stamp(svgElements[i]);
            }
        }
        
        // Attach the data to the element
        this._attachItemToElement(clonedRow, item);
        this._attachIndexToElement(clonedRow, index);

        return clonedRow;
    },
    _getItemAttached: function (dom) {
        return dom._data;
    },
     _attachItemToElement: function (dom, item) {
        dom._data = item;
    },
    _attachIndexToElement: function (dom, index) {
        dom._index = index;
    },
    _getRowIndex: function(el) {
        while (el) {
            var index = parseInt(el._index, 10);
            
            if (index > -1) {
                return parseInt(index, 10);
            }
            el = el.parentNode;
        }
        return -1;
    },
    appendVirtualRows: function (cmp, items) {
        $A.metricsService.markStart(this.NS, this.NAME + ".appendVirtualRows", {auraid : cmp.getGlobalId()});
        var fragment  = document.createDocumentFragment(),
            container = this.getGridBody(cmp),
            offset = cmp.get("v.items").length;

        for (var i = 0; i < items.length; i++) {
            var virtualItem = this._generateVirtualRow(cmp, items[i], offset + i);
            cmp._virtualItems.push(virtualItem);
            fragment.appendChild(virtualItem);
        }
        container.appendChild(fragment);
        this.fireRenderEvent(cmp, "append", offset);
        
        cmp.set("v.renderInfo", { type : "append" });
        cmp.set('v.items', (cmp.get('v.items') || []).concat(items), true);
        $A.metricsService.markEnd(this.NS, this.NAME + ".appendVirtualRows");
    },
    createVirtualRows: function (cmp) {
        var items = cmp.get('v.items');
        cmp._virtualItems = [];
        if (items && items.length) {
            $A.metricsService.markStart(this.NS, this.NAME + ".createVirtualRows", {auraid : cmp.getGlobalId()});
            for (var i = 0; i < items.length; i++) {
                cmp._virtualItems.push(this._generateVirtualRow(cmp, items[i], i));
            }
            $A.metricsService.markEnd(this.NS, this.NAME + ".createVirtualRows");
        }
        cmp.set("v.renderInfo", {});          
    },
    selectRow: function(cmp, index, value) {
        var row = cmp._virtualItems[index];
        
        var op = value ? 'add' : 'remove';
        row.classList[op]('selected');
        row.classList[op]('slds-is-selected');
    },

    updateItem: function (cmp, item, index) {
        // Update the item in the DOM
        this._rerenderDirtyElement(cmp, item, null, index); // (cmp, item, target, index)
        
        // Update the item in v.items
        var updatedItems = cmp.get('v.items');
        updatedItems[index] = item;
        
        cmp.set("v.renderInfo", { type : "update", index : index });
        cmp.set('v.items', updatedItems, true);
    },
    _getRootComponent: function (cmp) {
        var superCmp   = cmp.getSuper(),
            isExtended = superCmp.getType() !== 'aura:component';

        if (isExtended) {
            cmp = superCmp;
        }
        return cmp;
    },

    _selectiveRerender: function(cmp) {
        var renderInfo = cmp.get("v.renderInfo") || {};
        
        // Rerender the entire grid by default
        if ($A.util.isEmpty(renderInfo)) {
            this._rerender(cmp);
        } else {
            switch (renderInfo.type) {
                case "append":
                    // Currently doesn't need to do anything since elements are directly appended
                    // into the DOM when the items are appended.
                    // TODO: Evaluate whether DOM manipulation should be moved to rendering lifecycle
                    break;
                case "update":
                    // Currently doesn't need to do anything since elements are directly updated
                    // in the DOM when the items are updated.
                    // TODO: Evaluate whether DOM manipulation should be moved to rendering lifecycle
                    break;
                default:
                    this._rerender(cmp);
            }
        }
        
        cmp.set("v.renderInfo", {});
    },
    
    _rerender: function(cmp) {
        var container = this.getGridBody(cmp);
        var items = cmp._virtualItems;
        var fragment = document.createDocumentFragment();
        
        for (var i = 0; i < items.length; i++) {
            fragment.appendChild(items[i]);
        }

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(fragment);
        this.fireRenderEvent(cmp, "rerender", 0);
    },
    
    fireRenderEvent: function(cmp, type, index) {
        cmp.getEvent("gridAction").setParams({
            action: type,
            index: index,
            payload: {}
        }).fire();
    },
    
    /*
     * =========================
     * SORTING
     * =========================
     */
    
    initializeSorting: function (cmp) {
        var headers = cmp.get('v.headerColumns'),
            handleSortTrigger = cmp.get('c.handleSortTrigger');
        
        if (!headers) {
            return;
        }
        
        for (var i = 0; i < headers.length; i++) {
            var headerColumn = headers[i];
            
            if (headerColumn.get('v.sortable')) {
                headerColumn.set('v.onsortchange', handleSortTrigger);
            }
        }
    },
    
    updateSortData: function (cmp, sortBy) {
        var headers  = cmp.get('v.headerColumns'),
            isDesc   = (sortBy[0] === '-'),
            name      = isDesc ? sortBy.slice(1, sortBy.length) : sortBy,
            sortText = isDesc ? 'descending' : 'ascending';
            
            for (var i = 0; i < headers.length; i++) {
                var header       = headers[i],
                    direction = (header.get('v.name') === name) ? sortText : '';
                header.set('v.direction', direction);
            }
            
        cmp.set('v._sortBy', sortBy);
    },
    
    /**
     * Default callback to handle the results of a sort.
     * When this callback is sent through the onsort event, the virtualDataGrid
     * component object is bound to the first parameter. If the callback is
     * then retrieved from the event, it can simply be called with callback(response)
     * 
     * @param {Component} cmp virtualDataGrid component bound to the function.
     * @param {Object} response Response from the sort. Can either be an Array or an Object
     */
    sortCallback: function(cmp, response) {
        if (response && Array.isArray(response)) {
            cmp.set('v.items', response);
            
            this.updateSortData(cmp, '');
        } else if (response) {
            // TODO: handle responses of the following object signature
            // { data : Array, sortBy : String, state : String, error : Object }
        	var resposeState = response.state;
        	if (resposeState === 'SUCCESS') {
                var data   = response.data || [];
                var sortBy = response.sortBy || '';
                
                cmp.set('v.items', data);
                this.updateSortData(cmp, sortBy);
        	} else if(resposeState === "INCOMPLETE" || resposeState === "ERROR") {
                throw new Error("Failed to get response from server");
            }
        }
    },
    
    /*
     * Column Resizer Plugin
     */
    
    enableColumnResizer : function(cmp) {
        var configs = cmp.get("v.resizableColumnsConfig") || {};
        configs.indicatorClasses = configs.indicatorClasses ? configs.indicatorClasses += ' uiVirtualDataTable' : 'uiVirtualDataTable';
        
        var resizer = this.lib.columnResize.initializeColumnResizer(cmp.getElement(), configs);
        
        this.attachColResizerHandlers(cmp, resizer);
        
        cmp.getConcreteComponent()._colResizer = resizer;
        this.updateResizerAccessibilityLabels(cmp);
    },
    
    getResizer : function(cmp) {
        return cmp.getConcreteComponent()._colResizer;
    },
    
    updateColumnResizer : function(cmp) {
        this.getResizer(cmp).updateColumns();
        this.updateResizerAccessibilityLabels(cmp);
    },
    
    updateResizerAccessibilityLabels : function(cmp) {
        var resizer = this.getResizer(cmp);
        if (resizer) {
            var columns = cmp.get("v.headerColumns");
            
            var labels = [];
            for (var i = 0; i < columns.length; i++) {
                labels[i] = columns[i].get("v.label");
            }
            
            resizer.updateAccessibilityLabels(labels);
        }
    },
    
    /**
     * Configures the resizer after it's been created
     */
    attachColResizerHandlers: function(cmp, resizer) {  
        
        // Attach event handlers
        resizer.on('resize', $A.getCallback(function(resizeData) {
            if (cmp.isValid()) {
                var header = cmp.get("v.headerColumns")[resizeData.index];
                if (header) {
                    header.set("v.width", resizeData.width);
                }
            }
        }));
        
        resizer.on('resize', $A.getCallback(function () {
            if (cmp.isValid()) {
                var resizeData = arguments[0];
                cmp.getEvent("onColumnResize").setParams({
                    src : {
                        colIndex : resizeData.index,
                        column : cmp.get("v.headerColumns")[resizeData.index]
                    },
                    newSize : resizeData.width
                }).fire();
            }
        }));
    },
    
    resizeColumns : function(cmp, widths) {
        if (widths && widths.length > 0) {
            cmp._colResizer.resizeAll(widths);
        }
    },
    
    /**
     * Checks if all column headers have resize handles.
     * 
     * We hopefully won't need to do this anymore once dataGridColumn is refactored and we can let Aura
     * rerender the resizer handles natively. 
     */
    hasResizerHandles : function(cmp) {
        // TODO: Use getHandles from the resizer instead of grabbing the elements ourselves
        var handles = cmp.getElement().querySelectorAll(".slds-resizable").length;
        var headers = cmp.get("v.headerColumns").length;
        return handles === headers;
    },
    
    destroyTemplates: function (cmp) {
        var tmpls = cmp._templates;
        for (var i = 0; i < tmpls.length; ++i) {
            tmpls[i].destroy();
        }
    }
})// eslint-disable-line semi