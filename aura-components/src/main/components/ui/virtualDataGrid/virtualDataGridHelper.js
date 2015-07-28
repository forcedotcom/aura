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
    NAME: "ui:virtualDataGrid",
    
    DELEGATED_EVENTS: [
        'click',
        'keydown'
    ],
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
    initializeTemplates: function (cmp) {
        var columnsDefs = cmp.get('v.columns');
        if (!columnsDefs) {
            return;
        }

        var itemVar     = cmp.get('v.itemVar'),
            templates   = cmp._templates,
            ptv         = this._createPassthroughValue(cmp, itemVar);

        for (var i = 0; i < columnsDefs.length; i++) {
            templates.push($A.newCmp(columnsDefs[i], ptv));
        }

        cmp._ptv = ptv;
        cmp._rowTemplate = this._initializeRowTemplate(templates, cmp.get("v.useRowHeaders"));
        ptv.ignoreChanges = true;
        ptv.dirty = false;

        // Add handler for itemvar
        cmp.addValueHandler({
            event  : 'change',
            value  : itemVar,
            method : this.onItemChange.bind(this, ptv)
        });
    },
    initializeFixedHeader: function (cmp) {
        if (cmp.get("v.fixedHeader")) {
            $A.util.toggleClass(cmp, "fixedHeaderTable", true);
            this.updateSizesForFixedHeader(cmp);
        }
    },
    updateSizesForFixedHeader: function (cmp) {
        var table = cmp.getElement(),
            header = cmp.find("thead").getElement(),
            body = cmp.find("tbody").getElement();
    
        body.style.height = (table.clientHeight - header.clientHeight) + "px";
    },
    virtualRerender: function (cmp) {
        this.bootstrapVirtualGrid(cmp);
    },
    onItemChange: function (ptv, evt) {
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
    _initializeRowTemplate: function (templates, useRowHeader) {
        var row = document.createElement(this.DEFAULT_TEMPLATES.row),
        	startIndex = 0,
        	column;
        
        // Make the first column a header column
        if (useRowHeader) {
        	column = this._createColumn(this.DEFAULT_TEMPLATES.header, templates[0]);
        	column.setAttribute("scope", "row");
        	row.appendChild(column);
        	startIndex = 1;
        }
        
        for (var i = startIndex; i < templates.length; i++) {
        	column = this._createColumn(this.DEFAULT_TEMPLATES.column, templates[i]);
            row.appendChild(column);
        }
        return row;
    },
    
    _createColumn: function (elementTemplate, columnTemplate) {
    	var column = document.createElement(elementTemplate);
    	$A.render(columnTemplate, column);
    	return column;
    },
    _createPassthroughValue: function(cmp, itemVar, item, rowIndex) {
        var rowContext = {
            index : rowIndex || 0,
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
            events   = this.DELEGATED_EVENTS,
            delegate = function (e) {
                self._eventDelegator(cmp, e);
            };
        
        for (var i = 0; i < events.length; i++) {
            container.addEventListener(events[i], delegate, false);
        }
    },
    _getRenderingComponentForElement: function (domElement) {
        var id  = $A.util.getDataAttribute(domElement, 'auraRenderedBy');
        return id && $A.componentService.get(id);
    },
    _dispatchAction: function (actionHandler, event) {
        actionHandler.evaluate().runDeprecated(event);
    },
    _getActionHandler: function (htmlCmp, eventType) {
        var eventTypeAttribute = 'on' + eventType,
            htmlAttr = htmlCmp.get('v.HTMLAttributes');
        return htmlAttr && htmlAttr[eventTypeAttribute];
    },
    _eventDelegator: function (cmp, e) {
         var type     = e.type,
            target    = e.target,
            child     = e.target,
            ref       = cmp.get('v.itemVar'),
            templates = cmp._templates,
            handlers  = [],
            ptv       = cmp._ptv,
            position,
            item;

        while (target) {
            targetCmp = this._getRenderingComponentForElement(target);
            // Guard for existance since there are cases like container components 
            // that might not have elements associated with them.
            if (targetCmp) { 
                actionHandler = this._getActionHandler(targetCmp, type);
                if (actionHandler) {
                    handlers.push(actionHandler);
                }
            }

            if ((item = this._getItemAttached(target))) {
                position = Array.prototype.indexOf.call(target.childNodes, child);
                break;
            }

            child  = target;
            target = target.parentElement;
        }

        if (!handlers.length > 0) {
            return;
        }

         if (item) {
            // Seting up the event with some custom properties
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
            while ((actionHandler = handlers.shift())) {
                if ($A.util.isExpression(actionHandler)) {
                    this._dispatchAction(actionHandler, e);
                }
            }
            
            if (ptv.dirty) {
                this._rerenderDirtyElement(cmp, item, target);
            }
        }
    },
    _findVirtualElementPosition: function (items, elmt) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === elmt) {
                return i;
            }
        }
    },
    _replaceDOMElement: function (parent, newChild, oldChild) {
        parent.replaceChild(newChild, oldChild);
    },
    _rerenderDirtyElement: function (cmp, item, oldElement) {
        var container = cmp._templateContainer,
            listRoot  = this.getGridBody(cmp),
            items     = cmp._virtualItems,
            position  = this._findVirtualElementPosition(items, oldElement),
            rendered  = this._generateVirtualRow(cmp, item);

        items[position] = rendered;
        this._replaceDOMElement(listRoot, rendered, oldElement);
    },
    _generateVirtualRow: function (cmp, item) {
        var rowTmpl = cmp._rowTemplate,
            itemVar = cmp.get('v.itemVar'),
            ptv     = cmp._ptv,
            clonedRow;

        // Change the PTV -> dirty whatever is needed
        ptv.set(itemVar, item);

        cmp.markClean('v.items'); // Mark ourselves clean before rerender (avoid calling rerender on ourselves)
        $A.renderingService.rerenderDirty('virtualRendering');

        // Snapshot the DOM
        clonedRow = rowTmpl.cloneNode(true);

        // Attach the data to the element
        this._attachItemToElement(clonedRow, item);

        return clonedRow;
    },
    _getItemAttached: function (dom) {
        return dom._data;
    },
     _attachItemToElement: function (dom, item) {
        dom._data = item;
    },
    appendVirtualRows: function (cmp, items) {
        $A.metricsService.markStart(this.NS, this.NAME + ".appendVirtualRows", {auraid : cmp.getGlobalId()});
        var fragment  = document.createDocumentFragment(),
            container = this.getGridBody(cmp);

        for (var i = 0; i < items.length; i++) {
            var virtualItem = this._generateVirtualRow(cmp, items[i]);
            cmp._virtualItems.push(virtualItem);
            fragment.appendChild(virtualItem);
        }
        container.appendChild(fragment);
        cmp.set('v.items', (cmp.get('v.items') || []).concat(items), true);
        $A.metricsService.markEnd(this.NS, this.NAME + ".appendVirtualRows");
    },
    createVirtualRows: function (cmp) {
        var items = cmp.get('v.items');
        cmp._virtualItems = [];
        if (items && items.length) {
            $A.metricsService.markStart(this.NS, this.NAME + ".createVirtualRows", {auraid : cmp.getGlobalId()});
            for (var i = 0; i < items.length; i++) {
                cmp._virtualItems.push(this._generateVirtualRow(cmp, items[i]));
            }
            $A.metricsService.markEnd(this.NS, this.NAME + ".createVirtualRows");
        }        
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
            var headerColumn = headers[i],
                name = headerColumn.get('v.name');
            
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
            if (response.state === 'SUCCESS') {
                var data   = response.data || [];
                var sortBy = response.sortBy || '';
                
                cmp.set('v.items', data);
                this.updateSortData(cmp, sortBy);
            }
        }
    },
    destroyTemplates: function (cmp) {
        var tmpls = cmp._templates;
        for (var i = 0; i < tmpls.length; ++i) {
            tmpls[i].destroy();
        }
    }
})