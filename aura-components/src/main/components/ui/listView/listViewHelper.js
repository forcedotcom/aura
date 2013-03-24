/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    addEvents:function (component, events) {
        if (events != undefined) {
            var dispatcher=component.getEventDispatcher();
            for (var x in events) {
                // TODO: AURA: HACK: Need a way to copy events properly.
                if (events.hasOwnProperty(x))dispatcher[x]=events[x];
            }
        }
    },

    buildColumns:function(component,templates,listHeader){
        if(!templates)templates={};
        var allColumns=[];
        var attributes = null;
        var columns=null;
        var columnCount = 0;
        var columnTemplateRows=templates.columnTemplates||[];
        var columnTemplates=null;
        var dataColumns=[];
        var headerRows = [];
        var rowClass=null;
        var skipMap = {headers:null, tooltip:null};
        var template = null;

        // Loop through identified rows of column headers
        for(var row=0;row<columnTemplateRows.length;row++){
            columns = [];
            columnTemplates=columnTemplateRows[row];
            columnCount = columnTemplates.length;
            rowClass=this.getRowClass(component,row);

            // Loop over columns for the current header row. These are columns that might be rowSpanned into cross-index positions
            for (var column = 0; column < columnCount; column++) {
                // We need to work with the concrete component to get all of the concrete attributes
                template = columnTemplates[column].getConcreteComponent();

                // Take an unwrapped copy of template attributes
                attributes = this.getAttributes(template);

                // Remove irrelevant attributes
                for(var x in skipMap){
                    skipMap[x]=attributes[x];
                    delete attributes[x];
                }

                //  Make modifications befitting header columns
                attributes.body = attributes.title;
                // If no tooltip is specified for the column, use the text content of the title for the header tooltip
                if(!skipMap.tooltip)attributes.tooltip=this.getTextContent(attributes.title);
                else{
                    // If the tooltip is a delayed expression, use the text content of the title for the header tooltip
                    if(this.getExpression(skipMap.tooltip))attributes.tooltip=this.getTextContent(attributes.title);
                    // Otherwise, use the value that was specified for both headers and data cells
                    else attributes.tooltip=skipMap.tooltip;
                }
                attributes.column = {template:template};
                attributes.formatters = this.resolveObjects(attributes.formatters);

                // Allow data columns to span the remainder of the rows
                if(template.isDataColumn){
                    attributes.rowSpan=columnTemplateRows.length-row;
                }

                // Remove column scope from complex headers
                if(skipMap.headers&&skipMap.headers.indexOf(' ')>-1){
                    attributes.scope=null;
                }

                // Generate actual column header cell and preserve the reference for the flattened v.columns and v.dataColumns attributes
                columns[column] = this.generateComponent("ui:listViewColumnHeader", attributes);
                allColumns.push(columns[column]);
                if(template.isDataColumn){
                    dataColumns.push(columns[column]);
                }

                // Restore attributes for use in row fields and preserve unwrapped attributes on template
                for (var x in skipMap){
                    attributes[x]=skipMap[x];
                }
                template.attributes = attributes;

                // Copy template events now to prevent iterating in the build item loop
                template.events = this.getEvents(template);
            }
            var headerRow = this.generateComponent("ui:listViewRow", {body:columns,"class":rowClass});
            headerRows.push(headerRow);
        }
        // Add the columns to the header, save the processed columns and fire the column ready event
        listHeader.getValue("v.body").setValue(headerRows);
        component.getValue("v.columns").setValue(allColumns);
        component.getValue("v.dataColumns").setValue(dataColumns);
        component.getValue("v.dataTemplates").setValue(templates.dataTemplates);
        this.fireEvent(component, component, "oncolumnsready", "ListHeader");
    },

    buildList:function(component){
        // Get defined columns (recursively, if nested)
        var templates = this.getColumnTemplates(component);

        // Or create them from the first row of data
        if (!templates) templates = this.generateColumns(component);

        // Build THEAD component tree with only listViewColumnHeader types
        this.buildColumns(component, templates, component.find("listView:header"));

        // Build TBODY component tree with column types and formatters
        this.buildRows(component, templates, component.find("listView:body"));
    },

    buildRows:function (component, templates, listBody) {
        if(!templates)templates={};
        var blockSize = component.get("v.blockSize");
        var buildRowBlock = buildRowBlock.bind(this);
        var containerSet = false;
        var dataTemplates = templates.dataTemplates||[];
        var dataTemplateCount = dataTemplates.length;
        var index = 0;
        var items = component.getValue("v.items");
        var itemCount = items.getLength();
        var listId = component.get("v.id");
        var rows = [];
        var rowTooltip = component.get("v.rowTooltip");

        if(itemCount==0){
            // Draw Empty Message
            buildEmptyMessage(this);
        }else{
            // DEBUG: Performance Marker
            $A.mark("startBlockRender" + component);
            // Start component chain to build items
            buildRowBlock();
        }

        function buildEmptyMessage(helper){
            var emptyMessage= helper.generateComponent("aura:unescapedHtml",{value:component.get("v.emptyMessage")});
            var emptyCell = helper.generateComponent("aura:html", {body:[emptyMessage], tag:"TD", HTMLAttributes:$A.expressionService.create(component, {"class":"emptyMessage", colSpan:dataTemplateCount || 1})});
            var row = helper.generateComponent("ui:listViewRow", {body:[emptyCell], "class":helper.getRowClass(component,0)});
            listBody.getValue("v.body").setValue([row]);
            helper.fireEvent(component, component, "onitemsready", "EmptyList");
        }

        function buildRowBlock() {
            var item=null;
            var rowClass=null;
            if(index&&!containerSet){
                // Set a rough container height estimate based on the first row of data
                var firstRow= rows[0] && rows[0].getElement();
                if(firstRow){
                    listBody.getElement().style.height= (firstRow.offsetHeight * itemCount) + "px";
                }
                containerSet=true;
            }
            for (var i=0; i<blockSize&&index<itemCount; i++, index++) {
                item = items.getValue(index);
                if(!item)continue;
                rowClass=this.getRowClass(component, index);
                var columns = [];
                for (var c = 0; c < dataTemplateCount; c++) {
                    // We need to work with the concrete component to set all of the concrete attributes
                    var template = dataTemplates[c].getConcreteComponent();
                    if (!template)continue;

                    // Take the unwrapped attributes we stored while building columns and modify them for row field
                    var attributes = template.attributes;
                    var tooltip=attributes.tooltip;
                    if (attributes.title == template.title)delete attributes.title;
                    delete attributes.id;
                    attributes.column = {template:template};
                    attributes.index = index;
                    attributes.item = item;
                    if(template.isInstanceOf("ui:listViewColumnHeader")){
                        // Set row-level headers to the proper scope
                        attributes.scope = "row";
                    }
                    else{
                        // Or remove scope altogether
                        delete attributes.scope;
                        if(!attributes.headers||attributes.headers.indexOf(' ')<0){
                            // And simple (single) headers
                            delete attributes.headers;
                        }
                    }

                    // Run all specified formatters on field and set the content and tooltip of the cell
                    var content = this.formatContent(template, item, attributes.fieldName, items, index, attributes.formatters);
                    if(!attributes.tooltip&&!rowTooltip)attributes.tooltip=this.getTextContent(content);
                    attributes.body=content;

                    // Generate the concrete column type from the template
                    var typeName= template.getDef().getDescriptor().getQualifiedName();
                    columns[c] = this.generateComponent(typeName,attributes,template.events);

                    // Reset the tooltip in case we changed it.
                    attributes.tooltip=tooltip;
                }
                var row= this.generateComponent("ui:listViewRow", {body:columns,"class":rowClass,tooltip:rowTooltip,item:item,index:index});
                rows.push(row);
            }

            // If there are more rows, queue next chunk
            if (index < itemCount)this.setImmediate(buildRowBlock);

            listBody.getValue("v.body").setValue(rows);

            // DEBUG: Performance Marker
            $A.endMark("BlockRender" + component);

            // If the final item/block has been drawn, reset container height to allow proper overflow and fire the items ready event
            if(index>=itemCount-1){
                if (listBody.getElement())listBody.getElement().style.height = 'auto';
                this.fireEvent(component, component, "onitemsready", "PopulatedList");

                // DEBUG: Performance Marker
                $A.endMark("FullRender" + component);
            }
        }
    },

    decodeHtml:function(htmlString){
        // Create a floating node as our translation container
        if(!this.translator)this.translator=document.createElement("div");
        var translator=this.translator;
        translator.innerHTML=htmlString;
        var textContent=translator.textContent||translator.innerText;
        // Remove the node reference after the current UI thread has finished.
        if(this.decodeTimer)clearTimeout(this.decodeTimer);
        this.decodeTimer=setTimeout(function(){this.translator=null}.bind(this),100);
        return textContent;
    },

    fireEvent:function (component, target, eventType, listViewEventType, rawEvent, data) {
        var listViewEvent= component.getEvent(eventType);
        listViewEvent.setParams({
            type:listViewEventType,
            context:{
                source:target,
                event:rawEvent||null,
                helper:this
            },
            data:data||{}
        });
        listViewEvent.fire();
    },

    fireEvents:function(component,type,domEvent, eventParams){
        if(!eventParams)eventParams = {};
        var targets = this.getEventTargets(component, domEvent&&domEvent.target);
        var targetType = this.getEventType(component, targets.column);
        switch (targetType) {
            case "Cell":
            case "Header":
                this.fireEvent(component, targets.column, ["on",targetType.toLowerCase(),type].join(''), targetType, domEvent, eventParams);
                // Intentional fall-through to also fire row events for cells and headers. Thus, no break statement.
            case "Row":
                this.fireEvent(component, targets.row, "onrow" + type, targetType, domEvent, eventParams);
                break;
        }
        this.fireEvent(component, targets.section, "on"+type, targetType, domEvent, eventParams);
    },

    formatColumnName:function(columnName){
        if(!columnName)return '';
        if(columnName.length==1)return columnName.toUpperCase();
        return columnName.charAt(0).toUpperCase()+columnName.substr(1).replace(/\B([A-Z])/g, " $1");
    },

    formatContent:function(columnTemplate,dataItem,fieldName,items,index,formatters){
        if(dataItem.unwrap)dataItem=dataItem.unwrap();
        var content=dataItem[fieldName];
        if(content==null)content=this.resolveObject(dataItem,fieldName);
        if(formatters){
            // Loop over formatters in order, modifying the content each time
            for(var i=0;i<formatters.length;i++) {
                content=formatters[i](content,dataItem,fieldName,items,index);
            }
        }
        if($A.util.isObject(content)){
            // If we have still have an object, return its string representation
            content=$A.util.json.encode(content);
        }
        return content||'';
    },

    generateColumns: function(component) {
        var columns=[];
        var itemWrapper = component.getAttributes().getValue("items").getValue(0);
        if(itemWrapper!=undefined){
            var item=itemWrapper.unwrap?itemWrapper.unwrap():itemWrapper;
            for(var column in item){
                // Only generate columns for first level properties that are not methods
                if(!item.hasOwnProperty(column)||typeof(item[column])=="function")continue;
                var template=this.generateComponent("ui:listViewColumn",{
                    fieldName:column,
                    title:$A.expressionService.create(component,this.formatColumnName(column))
                });
                columns.push(template);
            }
        }
        return {columnTemplates:[columns],dataTemplates:columns};
    },

    generateComponent:function(type,attributes,events){
        var component=$A.componentService.newComponent({
            componentDef:{descriptor:(type.indexOf('://')==-1?"markup://":'')+type},
            attributes:{values:attributes}
        },null,true);
        this.parseExpressions(component,attributes);
        this.addEvents(component,events);
        return component;
    },

    getAttributes:function(component){
        var attributeMap={};
        var attributeSet= component.getAttributes();
        var attributeDelegate=this.getAttribute.bind(this, attributeSet, attributeMap);
        component.getDef().getAttributeDefs().each(attributeDelegate);
        return attributeMap;
    },

    getAttribute:function(attributeSet,attributeMap,value){
        var attribute=value.getDescriptor().getName();
        var attributeValue=attributeSet.getValue(attribute);
        if(attributeValue&&attributeValue.unwrap){
            attributeValue=attributeValue.unwrap();
        }
        attributeMap[attribute] = attributeValue;
    },

    getColumnTemplates:function(component,listId,columnTemplates,dataTemplates,colSpans,headers,depth,nextId){
        // Create recursion pointer constructs for first level call
        if(!columnTemplates)columnTemplates=[];
        if(!colSpans)colSpans=[];
        if(!dataTemplates)dataTemplates=[];
        if(!depth)depth=0;
        if(!nextId)nextId=0;
        if(!headers)headers=[];
        else component.getValue("v.headers").setValue(headers.join(' '));
        if (!listId)listId = component.find("listView:table").getValue("v.HtmlAttributes.id").getValue(component).getValue();

        var id=null;
        var column = null;
        var colSpan=component.getValue("v.colSpan");
        var listViewColumns=component.find({instancesOf:"ui:listViewColumn"});

        if (listViewColumns.length){
            // Iterate over child templates at the current depth
            if (!columnTemplates[depth])columnTemplates[depth] = [];
            var childColumns = [];
            var currentHeaders=headers.length;
            for(var i=0;i<listViewColumns.length;i++){
                // We have to work with the concrete component to get access to all attributes
                column=listViewColumns[i].getConcreteComponent();

                // Reset accessibility headers
                headers.length = currentHeaders;

                // Reset column spans
                childColumns.length=0;

                // Generate header ids and add them to columns and accessibility headers
                id = [listId,"header", depth, nextId++].join(':');
                column.getValue("v.id").setValue(id);
                headers.push(id);

                // Look for nested column templates recursively, then add our columns to the row
                this.getColumnTemplates(column,listId,columnTemplates, dataTemplates,childColumns,headers,depth+1,nextId);
                columnTemplates[depth].push(column);

                // And update the column span with the current count of the lowest level columns
                colSpans.length+=childColumns.length;
            }
            colSpan.setValue(colSpans.length);
        }else{
            // No child columns, so add this column to the list of data columns, mark it, and count it for parent column spans
            dataTemplates.push(component);
            component.isDataColumn = true;
            colSpans.length++;
        }

        return columnTemplates.length?{columnTemplates:columnTemplates,dataTemplates:dataTemplates}:null;
    },

    getEvents:function(component){
        // TODO: AURA: HACK: Need a way to copy events properly.
        var eventMap={};
        var events=component.getDef().getAllEvents();
        var dispatcher= component.getEventDispatcher();
        for(var i=0;i<events.length;i++){
            eventMap[events[i]]= dispatcher[events[i]];
        }
        return eventMap;
    },

    getEventTargets:function(component, target){
        var listViewElement = component.getElement();
        var targets={column:null,row:null,section:null};

        // Get HTML target elements from the bottom up
        targets.column=this.getTarget(target, listViewElement, {TH:1,TD:1});
        // prevent events from firing on the empty message
        if($A.util.hasClass(targets.column,"emptyMessage"))targets.column=null;
        targets.row=this.getTarget(targets.column, listViewElement, {TR:1});
        targets.section=this.getTarget(targets.row, listViewElement, {THEAD:1,TBODY:1,TFOOT:1});

        // Convert them to aura components from the top down
        if(targets.section){
            targets.section=$A.componentService.getRenderingComponentForElement(targets.section)||null;
        }
        if(targets.section&&targets.row){
            targets.row=targets.section.get("v.body")[targets.row.sectionRowIndex]||null;
        }
        if(targets.section&&targets.row&&targets.column){
            targets.column=targets.row.get("v.body")[targets.column.cellIndex]||null;
        }

        return targets;
    },

    getEventType:function (component, target) {
        var typeMap = {TD:"Cell", TH:"Header", TR:"Row", THEAD:"Head", TBODY:"Body", TFOOT:"Foot", TABLE:"List"};
        if (target && target.getElement)target = target.getElement();
        var type = target && target.tagName;
        type = typeMap[type] || type;
        return type;
    },

    getExpression:function (value) {
        var isExpression = value && aura.util.isString(value) && value.indexOf("{#") == 0 && value.lastIndexOf("}") == value.length - 1;
        if (isExpression) {
            return value.substring(2, value.length - 1);
        }
        return null;
    },

    getParams:function(component){
        var params={};
        var paramDefs=component.getDef().getAttributeDefs();
        for(var def in paramDefs){
            if(paramDefs.hasOwnProperty(def))params[def]=component.getParam(def);
        }
        return params;
    },

    getRowClass:function(component,index){
        var rowClass=component.get("v.rowClass")||'';
        var rowClassAlternate=component.get("v.alternateRowClass")||rowClass;
        return (index%2)==1?rowClassAlternate:rowClass;
    },

    getTarget:function (target, limit, matches) {
        while (target && target != limit) {
            if (matches[target.tagName])return target;
            target = target.parentNode;
        }
        return null;
    },

    getTextContent:function(facet){
        // Crude recursive attempt to build literal strings from the lowest level components
        var text='';
        if(facet){
            if($A.util.isString(facet))text=this.decodeHtml(facet);
            else{
                var body = null;
                if ($A.util.isArray(facet))body = facet;
                else body = facet.get&&facet.get("v.body");
                if (body && body.length) {
                    for (var i = 0; i < body.length; i++) {
                        text += this.getTextContent(body[i]);
                    }
                } else {
                    text += this.decodeHtml(facet.get && facet.get("v.value") || facet || '');
                }
            }
        }
        return text;
    },

    parseExpressions:function(component,attributes){
        if(!component||!attributes)return;
        var attributeMap=component.getAttributes();
        for (var field in attributes) {
            if (attributes.hasOwnProperty(field)) {
                var value=attributes[field];
                var expression=this.getExpression(value);
                if(expression) {
                    value=$A.expressionService.getValue(component, expression);
                    if(value)attributeMap.getValue(field).setValue(value.getValue());
                }
            }
        }
    },

    resolveObject:function(base,qualifiedPath){
        var target=null;
        if(qualifiedPath&&qualifiedPath.split){
            var paths = qualifiedPath.split('.');
            var target = base;
            while (target && paths.length) {
                target = target[paths.shift()];
            }
        }
        return target;
    },

    resolveObjects:function(qualifiedPaths){
        var objects = [];
        if(qualifiedPaths){
            var target = null;
            qualifiedPaths = qualifiedPaths.split(",");
            for(var i=0;i<qualifiedPaths.length;i++){
                target=this.resolveObject(window,qualifiedPaths[i]);
                if (typeof(target) == "function") {
                    objects.push(target);
                }
            }
        }
        return objects;
    },

    setImmediate:function(callback) {
        var global=Function("return this")();
        this.setImmediate=(global.requestAnimationFrame||global.webkitRequestAnimationFrame||global.mozRequestAnimationFrame||global.oRequestAnimationFrame||global.msRequestAnimationFrame||function(callback){setTimeout(callback,13)}).bind(global);
        this.setImmediate(callback);
    },

    // IObserver Members
    addObservers:function (component, actionDelegate, propertyList) {
        component = component.getConcreteComponent();
        var attributes = propertyList.join(',');
        var attribute = null;
        for (var i = 0; i < propertyList.length; i++) {
            attribute = component.getValue("v." + propertyList[i]);
            attribute.setValue = this.setValueObserver.bind(this, component, attributes, attribute, attribute.setValue.bind(attribute), actionDelegate);
        }
    },

    setValueObserver:function (component, attributes, attribute, setValueDelegate, actionDelegate, value, skipObserver) {
        if(attribute.unwrap()===value)return;
        setValueDelegate(value);
        if(!component.observerTimers)component.observerTimers = [];
        if(component.observerTimers[attributes])clearTimeout(component.observerTimers[attributes]);
        if(!skipObserver)component.observerTimers[attributes] = setTimeout(actionDelegate.bind(this, component), 13);
    }

})
