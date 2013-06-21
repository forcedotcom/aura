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
/*jslint sub: true, evil : true  */
/**
 * @namespace The Aura Dev Tool Service, accessible using $A.devToolServices.
 * Use mostly in non-production modes.
 * @constructor
 * @protected
 */
var AuraDevToolService = function() {
    var port = document.createElement("span");
    port.id = "AuraDevToolServicePort";
    port.style.display = "none";
    document.body.appendChild(port);

    $A.ns.Util.prototype.on(document.body,'getComponentTreeEvent', function() {
        var root = $A.getRoot();
        if(root){
            port.innerText = $A.getRoot().toJSON();
        }else{
            port.innerText = "";
        }
    });

    var highlightedElements = [];

    var appliedHighlightStyle = false;

    $A.ns.Util.prototype.on(document.body,'highlightElementsEvent', function(event) {

        if(!appliedHighlightStyle){
            aura.util.style.apply(".auraDevToolServiceHighlight:before{position:absolute;display:block;width:100%;height:100%;" +
                    "background-color:#006699;opacity:.3;content:' ';border : 2px dashed white;}");
            appliedHighlightStyle = true;
        }

        while(highlightedElements.length > 0){
            var el = highlightedElements.pop();
            $A.util.removeClass(el, "auraDevToolServiceHighlight");
        }

        if(event.data){
            var cmp = $A.getCmp(event.data);

            var elements = cmp.getElements();
            for(var key in elements){
                var element = elements[key];
                if(element && element["style"]){
                    highlightedElements.push(element);
                    $A.util.addClass(element, "auraDevToolServiceHighlight");
                }
            }
        }
    });


    /**
     * Mostly used by select.
     * @private
     * @param reg
     * @returns {Array}
     */

    function flattenRegistry(reg){
        var ret = [];
        for(var k in reg){
            ret.push(reg[k]);
        }
        return ret;
    }

    /**
     * @constructor
     * @private
     */
    function Statement(){
        this.criteria = {};
    }

    /**
     * @constructor
     * @private
     */
    function ResultSet(config, privConfig){

        var priv = {};

        for(var k in config){
            this[k] = config[k];
        }
        for(var j in privConfig){
            priv[j] = privConfig[j];
        }
        this._priv = priv;
    }

    var s = {

        "views" : {
            "component" : function(){
                return flattenRegistry($A.services.component.priv.indexes.globalId);
            },
            "componentDef" : function(){
                return flattenRegistry($A.services.component.priv.registry.componentDefs);
            },
            "controllerDef" : function(){
                return flattenRegistry($A.services.component.priv.controllerDefRegistry.controllerDefs);
            },
            "modelDef" : function(){
                return flattenRegistry($A.services.component.priv.modelDefRegistry.modelDefs);
            },
            "providerDef" : function(){
                return flattenRegistry($A.services.component.priv.providerDefRegistry.providerDefs);
            },
            "rendererDef" : function(){
                return flattenRegistry($A.services.component.priv.rendererDefRegistry.rendererDefs);
            },
            "helperDef" : function(){
                return flattenRegistry($A.services.component.priv.helperDefRegistry.helperDefs);
            }
//#if {"modes" : ["STATS"]}
            ,
            "actionReferenceValue" : function(){
                return flattenRegistry(valueFactory.getIndex("ActionReferenceValue"));
            },
            "arrayValue" : function(){
                return flattenRegistry(valueFactory.getIndex("ArrayValue"));
            },
            "functionCallValue" : function(){
                return flattenRegistry(valueFactory.getIndex("FunctionCallValue"));
            },
            "mapValue" : function(){
                return flattenRegistry(valueFactory.getIndex("MapValue"));
            },
            "passthroughValue" : function(){
                return flattenRegistry(valueFactory.getIndex("PassthroughValue"));
            },
            "propertyReferenceValue" : function(){
                return flattenRegistry(valueFactory.getIndex("PropertyReferenceValue"));
            },
            "simpleValue" : function(){
                return flattenRegistry(valueFactory.getIndex("SimpleValue"));
            },
            "value" : function(){
                var ret = {};
                var index = valueFactory.getIndex();
                for(var i in index){
                    var subIndex = index[i];
                    for(var j in subIndex){
                        var value = subIndex[j];
                        ret[value.id] = value;
                    }
                }
                return flattenRegistry(ret);
            }
//#end
        },

        "filters" : {
            "noop" : function(row){
                return true;
            }
        },

        /**
         * Returns the number of filtered rows and groups.
         * @public
         * @param {Object} config
         */
        select : function(config){
            config = config || {};
            var view;
            var from = config["from"];
            if(from){
                view = this["views"][from];
                $A.assert(view, "Invalid view : "+from);
            }else{
                view = this.defaultView;
            }
            var fields = config["fields"] || this.defaultFields;
            var derivedFields = config["derivedFields"] || this.defaultDerivedFields;
            var filter = config["where"] || this.defaultFilter;

            if($A.util.isString(filter)){
                filter = new Function("row","with(row){return "+filter+";}");
            }

            for(var der in derivedFields){
                var derField = derivedFields[der];
                if($A.util.isString(derField)){
                    derivedFields[der] = new Function("row","with(row){return "+derField+";}");
                }
            }

            var groupBy = config["groupBy"] || this.defaultGroupBy;

            var rawRows = view();
            var rows = this.filterFields(fields, derivedFields, rawRows);
            rows = this.applyFilter(filter, rows, rawRows);
            ret = this.applyGroupBy(groupBy, rows.rows, rows.rawRows);

            return ret;
        },

        applyGroupBy : function(groupBy, rows, rawRows){
            if(groupBy === undefined || groupBy === null){
                return new ResultSet({"rows" : rows, "rowCount" : rows.length},{"rawRows" : rawRows});
            }
            var ret = {};
            var groupCount = 0;
            for(var i=0;i<rows.length;i++){
                var row = rows[i];
                var key = row[groupBy];
                var group = ret[key];
                if(group === undefined){
                    group = [];
                    ret[key] = group;
                    groupCount++;
                }
                group.push(row);
            }
            return new ResultSet({"rowCount" : rows.length, "groupCount" : groupCount, "groups" : ret},{"rawRows" : rawRows, "rows" : rows});
        },

        filterFields : function(fields, derivedFields, rows){
            fields = $A.util.trim(fields);
            if(fields === this.defaultFields && derivedFields === this.defaultDerivedFields){
                return rows;
            }

            if(fields === this.defaultFields){
                fields = [];
            }

            if(!$A.util.isArray(fields)){
                var fieldSplit = fields.split(",");
                fields = [];
                for(var k=0;k<fieldSplit.length;k++){
                    var field = $A.util.trim(fieldSplit[k]);
                    var fieldConfig = {};
                    fields[k] = fieldConfig;
                    var splitField = field.match(/^(\S+)(?: as (\w+))?$/i);
                    fieldConfig.alias = splitField[2] || field;
                    fieldConfig.name = splitField[1].split(".");
                }
            }

            var ret = [];
            for(var j=0;j<rows.length;j++){
                var row = rows[j];
                if(row){
                    var newRow = {};
                    for(var i=0;i<fields.length;i++){
                        newRow[fields[i].alias] = this.processField(row, fields[i].name, 0);
                    }

                    var uberRow = {};
                    $A.util.apply(uberRow, row, true);
                    $A.util.apply(uberRow, newRow, true);
                    for(var key in derivedFields){
                        var derivedField = derivedFields[key];
                        var val = derivedField(uberRow);
                        newRow[key] = val;
                    }

                    ret.push(newRow);
                }
            }
            return ret;
        },

        processField : function(root, fields, place){
            var field = fields[place];
            var val;


            val = root[field];

            if(val === undefined){
                var func = root["get"+this.initCap(field)];
                if(func === undefined){
                    func = root["is"+this.initCap(field)];
                }
                if(func !== undefined){
                    val = func.call(root);
                }else{
                    if(root.getValue){
                        var f = "";
                        for(var i=place;i<fields.length;i++){
                            if(i !== place){
                                f += ".";
                            }
                            f += fields[i];
                        }
                        place = i;
                        val = root.getValue(f);
                        if(val && val.unwrap){
                            val = val.unwrap();
                        }
                    }
                }
            }else if($A.util.isFunction(val)){
                val = val.call(root);
            }
            place++;
            if(val !== undefined &&  fields.length > place){
                val = this.processField(val, fields, place);
            }
            return val;
        },

        initCap : function(str) {
             return str.substring(0,1).toUpperCase() + str.substring(1,str.length);

        },

        applyFilter : function(filter, rows, rawRows){
            var ret = [];
            var rawRet = [];
            for(var i=0;i<rows.length;i++){
                var row = rows[i];
                var rawRow = rawRows[i];
                if(filter(row, rawRow)){
                    ret.push(row);
                    rawRet.push(rawRow);
                }
            }
            return {rows : ret, rawRows : rawRet};
        },

        newStatement : function(){
            return new Statement();
        },

        output : function(cmp) {
            return cmp.output();
        },
        accessbilityAide:{
            /**
             * Goes up the tree (until it reaches the body tag) and finds whether the initial tag param is in another sent up tag
             * @param  tag       - The starting tag that we are going to use to go up the tree
             * @param  nameOfTag - Name of the tag that we should find should the the starting tags parent
             * @returns boolean   - Signifies whether or not the tag we want was found or not (found: true, else: false)
             */
            checkForParentMatchesTag : function(tag, parentTag){
        	while(tag.tagName !== null && tag.tagName !== "BODY"){
	        	 if(tag.tagName.toUpperCase() === parentTag){
	        	       return true;
	        	 }	
	        	 tag = tag.parentNode;  
	        }
	        return false;
            },
            /**
             * Function that goes through all labels and looks for a matching tag, returning true when found
             * @param labels    - All the labels that we want to go through
             * @param attribute - The attribute that is being sought (for, id, title, etc)
             * @param val       - the val that the attribute should be set to
             * @returns boolen   - Signifies whether or not the tag we want was found or not (found: true, else: false)
             */
            checkLabelForAttrb : function(labels, attribute, val){
        	var atrib = null;
        	
                for(var j =0; j<labels.length; j++){
                    atrib = labels[j].getAttribute(attribute);
            	    if(!aura.util.isUndefinedOrNull(atrib) && atrib === val){
            	       return true;
            	    }
                 }
                 return false;
            },
            
            inputLabelAid : function(lbls, inputTags){
        	var errorArray = [];
	        var lblIsPres = true;
  	        var accessAideFuncs = aura.devToolService.accessbilityAide;
  	        
  	        for (var index = 0; index < inputTags.length; index++){
  	            lblIsPres = (accessAideFuncs.checkLabelForAttrb(lbls, "for" ,inputTags[index].id)) || (accessAideFuncs.checkForParentMatchesTag(inputTags[index], "LABEL"));
  	            if(!lblIsPres){
  	        	errorArray.push(inputTags[index]);
  	            }
  	        }
  	        return errorArray;
            },
            /**
             * Function that goes finds all given tags and makes sure that they all have an attribute set
             * Note: This and the above function are very similar. The main difference is that this function is making sure that if a specific value 
             *       shows up, it is counted as an error
             * @param  tagName   - Name of the tag to find all instances of 
             * @param  attribute - The attribute that is being sought (for, id, title, etc)
             * @param  errorVal  - Value that this attribute should not be set to
             * @returns array     - All errornous tags
             */
            checkForAttrib : function(tagName, attribute, errorVal){
        	var tags = document.getElementsByTagName(tagName);
	        var errorArray = [];
	        var atrib ="";
	        
	        for(var i=0; i<tags.length; i++){
	                atrib = tags[i].getAttribute(attribute);
	        	if(aura.util.isUndefinedOrNull(atrib) || (atrib === errorVal && taName.toLowerCase() !== "IMG")){
	        	    errorArray.push(tags[i]);
	        	}
	        }
	        return errorArray;
            },
            
            /**
             * This method grabs all attributes of a tag and turns them into strings 
             * @param  attribs - All of the attributes in a tag
             * @returns string  - String value of all of the tag attributes
             */
            attribStringVal : function(attribs){
        	var strAttrib ="";
        	var attrib=null;
        	
        	for(var i = 0; i<attribs.length; i++){
        	    attrib = attribs.item(i);
        	    strAttrib = strAttrib + " " +attrib.nodeName+ "=\""+attrib.nodeValue+"\""; 
        	}
        	return strAttrib;
            },
            
            /**
             * Method grabs everything from the given array and prints out the error and the tag(s) that are the issue
             * @param tagError - The error message for the given tag
             * @param errArray - The array of errors
             * @returns String  - Either the empty string or a string representation of the error
             */
            formatOutput : function(tagError, errArray){
        	if(errArray.length === 0){
        	    return "";
        	}
        	
        	var len = errArray.length;
        	var data_aura_rendered_by = "";
        	var errStr = "\nTotal Errors: "+len+"\nIssue: "+tagError+"\n";
        	var nodeName = "";
        	var cmp = "";
        	var accessAideFuncs = aura.devToolService.accessbilityAide;
        	
        	for(var i = 0; i<len; i++){
        	    nodeName = errArray[i].nodeName.toLowerCase();
        	    data_aura_rendered_by = errArray[i].getAttribute("data-aura-rendered-by");
        	    
        	    //Make sure it has a rendered by value
        	    if(data_aura_rendered_by === null || data_aura_rendered_by === "" ){
        		cmp = "No component information Available, did you forget to use an Aura based component?";
        	    }
        	    else{
        		//Making sure that the cmp is rendered by Aura and a normal HTML tag
        		//Making sure to grab the correct $A. Depending if you are using the debuggertool or not, $A will be different
        		var cmpDesc = $A.getCmp(data_aura_rendered_by);
        		
        		if(!aura.util.isUndefinedOrNull(cmpDesc)){
        		    //If he component exists grab it descriptor
        		    cmpDesc = cmpDesc.getAttributes().getValueProvider().getDef().getDescriptor();
        		    //Grab the namespace and name so that it is not viewed as a hyperlink
        		    cmp = cmpDesc.getNamespace()+":"+cmpDesc.getName();
        		}
        		else{
        		    cmp = "There was an error finding this component. Please rerender or fix the issue";
        		}
        	    }
        	    
        	    errStr = errStr+"Component markup: //"+cmp+"\nRendered Tag:   <"+nodeName+""+accessAideFuncs.attribStringVal(errArray[i].attributes)+">...</"+nodeName+">\n";     	    
        	}
                return errStr;
            }
        },
        verifyAccessibility : {
                     /**
                      * Function that will find all IFrames and make sure that they have titles in them
                      * @returns Sring - Returns a string representation of the errors
                      */
        	     checkIFrameHasTitle : function(){
        		var iFrameTitleMsg = "Each frame and iframe element must have non-empty title attribute. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/ensure-compat.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		
        		return accessAideFuncs.formatOutput(iFrameTitleMsg,accessAideFuncs.checkForAttrib("iframe","title", ""));
        	    },
        	    /**
                     * Grabs all images tags and makes sure they have titles
                     * @returns Sring - Returns a string representation of the errors
                     * 
                     * Temporarily disabling this until code collab goes through
                     */
        	    checkImageTagForAlt : function(){
        		var imgAltMsg = "IMG tag must have alt attribute. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/text-equiv.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		
       		        return "";//accessAideFuncs.formatOutput(imgAltMsg, accessAideFuncs.checkForAttrib("img","alt",""));
        	    },
        	    /**
                     * Goes through all of the fieldsets tags and makes sure that each on has a legend
                     * @returns Sring - Returns a string representation of the errors
                     */
        	    checkFieldSetForLegend : function(){
        		var fieldsetLegnedMsg = "Fieldset element must include legend element. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		var fieldSets = document.getElementsByTagName('fieldset');
        		var legends = "";
        		var errorArray = [];
        		
        		for(var i=0; i<fieldSets.length; i++){
        		        legends = fieldSets[i].getElementsByTagName('legend');
        	        	if(legends.length === 0){
        	        	    errorArray.push(fieldSets[i]);
        	        	}
        	         }
        		return accessAideFuncs.formatOutput(fieldsetLegnedMsg, errorArray);
        	    }, 
        	    /**
                     * Gets all radio buttons, then traverses up the tree to find if they are in a fieldset
                     * @returns Sring - Returns a string representation of the errors
                     */
        	    checkRadioButtonsInFieldSet : function(){
        		 var radioButtonFieldSetMsg = "Radio button and checkbox should group by fieldset and legend elements. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/content-structure-separation.html.";
        		 var accessAideFuncs = aura.devToolService.accessbilityAide;
        		 var inputTags = document.getElementsByTagName('input');
        		 var errorArray = [];
        		 var inputTag = null;
        		 
         		 for(var i =0; i<inputTags.length; i++){ 
        		     inputTag = inputTags[i];
        		     if(inputTag.getAttribute('type').toLowerCase() == "radio"){
        		          if(!accessAideFuncs.checkForParentMatchesTag(inputTag, "FIELDSET")){
        		              errorArray.push(inputTag);
        		          }
        		     }
        		  }

        	         return accessAideFuncs.formatOutput(radioButtonFieldSetMsg, errorArray);
        	    },
        	    /**
                     * Verifys that all inputs have a label
                     * @returns Sring - Returns a string representation of the errors
                     */
        	    checkInputHasLabel : function() {
        		var inputLabelMsg   = "A label element must be directly before or after the input controls, and the for attribute of label must match the id attribute of the input controls. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		var inputTextTags   = document.getElementsByTagName('input');
         		var textAreaTags    = document.getElementsByTagName('textarea');
                        var selectTags      = document.getElementsByTagName('select');
                        var lbls = document.getElementsByTagName("LABEL");  
                        var errorArray = [];
                        
                        errorArray = errorArray.concat(accessAideFuncs.inputLabelAid(lbls, inputTextTags));
                        errorArray = errorArray.concat(accessAideFuncs.inputLabelAid(lbls, textAreaTags));
                        errorArray = errorArray.concat(accessAideFuncs.inputLabelAid(lbls, selectTags));
                                  	        
        	        return accessAideFuncs.formatOutput(inputLabelMsg, errorArray);
        	    }
        },
        checkAccessibility : function(){
            var functions = aura.devToolService.verifyAccessibility;
            var result = [];
            
            for(var funcNames in functions){
        	result.push(functions[funcNames]());
            }
            return result.join("");
        },
        help : function(){
            var ret = [];
            ret.push("\n COQL Usage");
            var txt = this.helpText;
            for(var i=0;i<txt.length;i++){
                var item = txt[i];
                ret.push("\n\n"+(i+1)+") ");
                ret.push(item.title);
                ret.push("\n\t============\n\t");
                ret.push(item.code);
                ret.push("\n\t============\n\n\t");
                ret.push(item.description);
            }
            return ret.join("");
        }

    };

    s.helpText = [
        {
            title : 'Query all components',
            code : '$A.getQueryStatement().query()',
            description : '"component" is the default view, and "*" is the default field'
        },
        {
            title : 'Choose a view to query',
            code : '$A.getQueryStatement().from("componentDef").query()',
            description : 'Available views are : '+function(views){
                var ret = [];
                for(var i in views){
                    ret.push(i);
                }
                return ret.toString();
            }(s["views"])
        },
        {
            title : 'Choose fields to query',
            code : '$A.getQueryStatement().from("component").field("toString").field("globalId").fields("def, super").query()',
            description : 'Any property or method on the view, any expression that can be resolved against the view may be specified. "get" and "is" are also tried as prefixes for resolving function names.  Multiple fields can be comma separated or multiple calls to field() can be used.'
        },
        {
            title : 'Group results',
            code : '$A.getQueryStatement().from("value").field("toString").groupBy("toString").query()',
            description : 'The value of groupBy must be a selected field.  Note : The "value" view is only visible in stats mode.'
        },
        {
            title : 'Define derived fields',
            code : '$A.getQueryStatement().from("component").field("descriptor", "getDef().getDescriptor().toString()").query()',
            description : 'You can create a derived field, such as getDef().getDescriptor().toString(), and refer to it as a real field called "descriptor" .'
        },
        {
            title : 'Diff the results of running a query twice',
            code : 'var before = $A.getQueryStatement().query(); var after = $A.getQueryStatement().query(); after.diff(before);',
            description : 'This is useful if you want to do something between running the before and after query.  Any options for queries can be used (fields, groupBy, etc...)'
        }
    ];

    Statement.prototype.query = function(){
        var ret = s.select(this.criteria);
        ret._priv["statement"] = this;
        return ret;
    };

    ResultSet.prototype.diff = function(from){

        var origFromRawRows = from._priv["rawRows"];
        var fromRawRows = [];
        var k;
        for(k=0;k<origFromRawRows.length;k++){
            fromRawRows[k] = origFromRawRows[k];
        }
        var origFromRows = from["rows"];
        if(!origFromRows){
            origFromRows = from._priv["rows"];
        }
        var fromRows = [];
        for(k=0;k<origFromRows.length;k++){
            fromRows[k] = origFromRows[k];
        }
        var toRawRows = this._priv["rawRows"];
        var toRows = this["rows"];
        if(!toRows){
            toRows = this._priv["rows"];
        }

        var added = [];
        var addedRaw = [];
        var existing = [];
        var existingRaw = [];

        for(var i=0;i<toRawRows.length;i++){
            var rawRow = toRawRows[i];
            var row = toRows[i];
            var fromRawRow = null;
            for(var j=0;fromRawRow === null && j<fromRows.length;j++){
                fromRawRow = fromRawRows[j];

                if(rawRow !== fromRawRow){
                    fromRawRow = null;
                }else{
                    fromRawRows.splice(j,1);
                    fromRows.splice(j,1);
                }
            }
            if(fromRawRow !== null){
                existing.push(row);
                existingRaw.push(rawRow);
            }else{
                added.push(row);
                addedRaw.push(rawRow);
            }
        }
        var groupBy = this._priv["statement"].criteria["groupBy"];
        var ret = new ResultSet({
            "added" : s.applyGroupBy(groupBy, added, addedRaw),
            "existing" : s.applyGroupBy(groupBy, existing, existingRaw),
            "removed" : s.applyGroupBy(groupBy, fromRows, fromRawRows)
        },
        {
            "from" : from,
            "to" : this,
            "statement" : this._priv["statement"]
        });
        return ret;
    };

    Statement.prototype.from = function(from){
        this.criteria["from"] = from;
        return this;
    };

    Statement.prototype.field = function(field, func){
        if(func){
            //derived field
            var derivedFields = this.criteria["derivedFields"];
            if(!derivedFields){
                derivedFields = {};
                this.criteria["derivedFields"] = derivedFields;
            }
            derivedFields[field] = func;
        }else{
            var fields = this.criteria["fields"];
            if(!fields){
                fields = field;
            }else{
                fields = fields + ", "+field;
            }
            this.criteria["fields"] = fields;
        }
        return this;
    };

    Statement.prototype.fields = Statement.prototype.field;

    Statement.prototype.where = function(func){
        this.criteria["where"] = func;
        return this;
    };

    Statement.prototype.groupBy = function(col){
        this.criteria["groupBy"] = col;
        return this;
    };



    s.defaultView = s["views"]["component"];
    s.defaultFields = "*";
    s.defaultDerivedFields = {};
    s.defaultFilter = s["filters"]["noop"];
    s.defaultGroupBy = undefined;

    //#include aura.AuraDevToolService_export
    return s;
};
