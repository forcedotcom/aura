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
                return flattenRegistry($A.services.component.indexes.globalId);
            },
            "componentDef" : function(){
                return flattenRegistry($A.services.component.registry.componentDefs);
            },
            "controllerDef" : function(){
                return flattenRegistry($A.services.component.controllerDefRegistry.controllerDefs);
            },
            "modelDef" : function(){
                return flattenRegistry($A.services.component.modelDefRegistry.modelDefs);
            },
            "providerDef" : function(){
                return flattenRegistry($A.services.component.providerDefRegistry.providerDefs);
            },
            "rendererDef" : function(){
                return flattenRegistry($A.services.component.rendererDefRegistry.rendererDefs);
            },
            "helperDef" : function(){
                return flattenRegistry($A.services.component.helperDefRegistry.helperDefs);
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
            "PropertyChain" : function(){
                return flattenRegistry(valueFactory.getIndex("PropertyChain"));
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
            },
            "rerenderings" : function(){
                return renderingService.statsIndex["rerenderDirty"];
            },

            "renderings": function() {
                var aggregate = [];
                var types = ["render", "afterRender", "rerender", "unrender"];

                for(var i = 0; i < types.length; i++) {
                    var type = types[i];
                    var stat = renderingService.statsIndex[type];

                    for(var j = 0; j < stat.length; j++) {
                        stat[j].type = type;
                        aggregate.push(stat[j]);
                    }
                }
                return aggregate;
            },

            "event": function() {
                return Event.prototype.statsIndex;
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
             * Helper functions that returns an error array when ever an inputDefaultError that is not associated with an ID is used
             * @param   uls          - all of the ULs on the page
             * @param   inputTags    - all of the input tags that can be associated with the inputDefaultError
             * @param   selectTags   - all of the select tags that can be associated with the inputDefaultError
             * @param   textAreaTags - all of the textAreaTags tags that can be associated with the inputDefaultError
             * @returns array        - error array, 
             */   
        	 inputDefaultErrorAide : function(uls, inputTags, selectTags, textAreaTags) {
      	        var ul  = null;
      	        var elmntAtrib = "";
      	        var errorArray = [];
      	    	
      	        var accessAideFuncs = aura.devToolService.accessbilityAide;
      	        for(var i = 0; i< uls.length; i++){
                      ul = uls[i];
                      elmntAtrib = $A.util.getElementAttributeValue(ul ,"class");
      	    		
                      if(!$A.util.isUndefinedOrNull(elmntAtrib) && elmntAtrib.indexOf("uiInputDefaultError") > -1){
                          elmntAtrib = $A.util.getElementAttributeValue(ul ,"id");
      	    			
                          //As long as a select, inputTag or textArea have the value we are looking for set we pass
                          if(!(accessAideFuncs.findMatchingId(elmntAtrib, inputTags, "aria-describedby")    ||
                                  accessAideFuncs.findMatchingId(elmntAtrib, selectTags, "aria-describedby") ||
                                  accessAideFuncs.findMatchingId(elmntAtrib, textAreaTags, "aria-describedby"))){
                              errorArray.push(ul);
                          }
                      }
                  }
      	    	
                  return errorArray;
      	        },
      	      /**
                 * Helper function that will return true if the two values equal each other
                 * @param   id             - value that we are expecting
                 * @param   tags           - tags to iterate through
                 * @param   attribute2find - attribute that we want to extract from the ID
                 * @returns boolean    - true signifies that it was found
                 */   
         	findMatchingId : function (id, tags, attribute2find){
         		var tagId = null;
         		for(var i = 0; i<tags.length; i++){
         			tagId = $A.util.getElementAttributeValue(tags[i], attribute2find);
         			
         			if(tagId === id){
         				return true;
         			}
         		}
         		
         		return false;
         	},
            /**
             * Helper function that will return true if the two values equal each other
             * @param   attribute  - Contents of the attribute that we want to look at
             * @param   val        - What we want to compare the attribute to
             * @returns boolean    - Signifies whether or not they are equal
             */    
            doesContain : function(attribute, val){
        	return attribute === val;
            },
            /**
             * Helper function that tells us whether something is in the dict or not
             * @param   attribute  - Contents of the attribute that we want to look at
             * @param   dict       - list of items that attribute should be equal to
             * @returns boolean    - returns true if attribute value is not dict
             */    
            doesNotContain : function(attribute, dict){
        	return !(attribute in dict);
            },
            
            /**
             * Goes up the tree (until it reaches the body tag) and finds whether the initial tag param is in another sent up tag
             * @param   tag       - The starting tag that we are going to use to go up the tree
             * @param   nameOfTag - Name of the tag that we should find should the the starting tags parent
             * @returns boolean   - Signifies whether or not the tag we want was found or not (found: true, else: false)
             */          
            checkParentMatchesTag : function(tag, parentTag){
        	while(tag.tagName !== null && tag.tagName !== "BODY"){
	        	 if(tag.tagName.toUpperCase() === parentTag){
	        	       return true;
	        	 }	
	        	 tag = tag.parentNode;  
	        }
	        return false;
            },
            /**
             * Keeps track of total number of errors in seen
             */
            errorCount : 0,
            /**
             * Function that goes through all labels and turns the for attribute into a key
             * @param   labels    - All the labels that we want to go through
             * @param   attribute - The attribute that is being sought (for, id, title, etc)
             * @returns dictionary  - Mapping of for atrib value to booleans
             */
            getDictFromTags : function(labels, attribute){
        	var atrib = null;
        	var dict = {};
        	if($A.util.isUndefinedOrNull(labels)){
        	   return dict; 
        	}
        	
                for(var j =0; j<labels.length; j++){
                    atrib = $A.util.getElementAttributeValue(labels[j], attribute);
            	    if(!$A.util.isEmpty(atrib)){
            	       dict[atrib] = true;
            	    }
                 }
                 return dict;
            },
            
            /**
             * Function that goes through all Image tags, makes sure it is set, then checks the alt tag
             * @param   imgErrorMsg                - Default error message telling user why they should set alt tag
             * @param   infoMsg                    - Error message for Informational tag
             * @param   decoMsg                    - Error message for Decorative tag
             * @returns String                   - String concatenation of all error messages
             */
            findAllImgTags:function (allImgTags, imgErrorMsg, infoMsg, decoMsg, altError){
        	 var accessAideFuncs = aura.devToolService.accessbilityAide;
               	
        	 var data_aura_rendered_by = "";
        	 var informationErrorArray = [];
        	 var decorationalErrorArray  = [];
        	 var wrongAltErrorArray  = [];
        	 var htmlAlt = "";
        	 var errorMsg = "";
        	 
        	 var imgType = "";
        	 var alt = "";
        	
        	 for(var index = 0; index < allImgTags.length; index++){
        	     data_aura_rendered_by = $A.util.getElementAttributeValue(allImgTags[index], "data-aura-rendered-by");
        	     htmlAlt = $A.util.getElementAttributeValue(allImgTags[index], "alt");
        	     imgType = null;
        	     alt = null;
        	     

        	    // Checking for the data_aura_rendered_by attribute 
         	    if(!$A.util.isEmpty(data_aura_rendered_by)){
         		imgType = $A.getCmp(data_aura_rendered_by).getAttributes().getValueProvider().get('v.imageType');	
         		alt     = $A.getCmp(data_aura_rendered_by).getAttributes().getValueProvider().get('v.alt');		 
         	    }
         	    
     		    /**
     		     * For the case that we are not looking at a ui:image component the imageType attribute will be undefined
     		     * This if block will replace the alt with the html attributes alt tag or the empty string. By default we 
     		     * are going to assume that every tag that is not through ui:image is going to be of type informational.
     		     * 
     		     * Once we have the item set, we will make sure that everything is stripped of spaces, and lowercased to make
     		     * all of the data flat. 
     		     * 
     		     * Then three checks
     		     * 1) make sure that the keywords "undefined", "null", "empty" are not the sole value of the alt
     		     * 2) if the item is of type informational, make sure that the alt is not the empty string
     		     * 3) if the item is of type decorative, make sure that the alt is the empty string.
     		     * 
     		     */
     		     if($A.util.isUndefinedOrNull(imgType)){
     		    
     		        imgType = "informational";
     		        if($A.util.isUndefinedOrNull(htmlAlt)){
     			   alt="";
     		        }
     		        else{
     			   alt = htmlAlt;
     		        }         		    
     		      }
     		
     		      if($A.util.isUndefinedOrNull(alt)){
     		          alt="";
     		      }
     		
     		      alt = alt.toLowerCase().replace(/[\s\t\r\n]/g,'');
     		
     		      if(alt==="undefined" || alt==="null" || alt ==="empty"){
     		          wrongAltErrorArray.push(allImgTags[index]);
     		      }
     		      else if(imgType === "informational" &&  ($A.util.isUndefinedOrNull(alt) || alt === "")){
     			  informationErrorArray.push(allImgTags[index]);
     		      }
     		      else if(imgType === "decorative" && (!$A.util.isUndefinedOrNull(alt) && alt !== "")){
     			  decorationalErrorArray.push(allImgTags[index]);
     		      }
        	 }
        	 
        	 errorMsg = accessAideFuncs.formatOutput(imgErrorMsg+altError, wrongAltErrorArray);
        	 errorMsg = errorMsg + accessAideFuncs.formatOutput(imgErrorMsg+infoMsg, informationErrorArray);
        	 errorMsg = errorMsg + accessAideFuncs.formatOutput(imgErrorMsg+decoMsg, decorationalErrorArray);
        	 
        	 return errorMsg;       	
            },
            /**
             * Function that goes through all labels and check for either the for attribute and the label id, or if a parent tag is a label
             * This function skips over several input types: submit, reset, image, hidden, and button. All of these have labels associated
             * with them in different ways 
             * 
             * @param   lbls       - All of the labels to
             * @param   inputTags  - The attribute that is being sought (for, id, title, etc)
             * @returns array     - All errornous tags
             */
            inputLabelAide : function(lbls, inputTags){
        	var errorArray = [];
	        var lblIsPres  = true;
	        var inputTag   = null;
  	        var type       = null;
  	        var inputTypes = "hidden button submit reset";
	        var accessAideFuncs = aura.devToolService.accessbilityAide;
  	        
  	        var lblDict = accessAideFuncs.getDictFromTags(lbls, "for");
  	        
  	        for (var index = 0; index < inputTags.length; index++){
  	            inputTag = inputTags[index];
  	            type = $A.util.getElementAttributeValue(inputTag, "type");
  	            if(!$A.util.isEmpty(type) && inputTypes.indexOf(type)> -1){
	        	continue;
	            }
	            else if (type == "image"){
	        	var alt = $A.util.getElementAttributeValue(inputTag, "alt");
	        	if($A.util.isEmpty(alt) || alt.replace(/[\s\t\r\n]/g,'') === ""){
	        	  errorArray.push(inputTag); 
       		        }
	            }
	            else{  
    	               lblIsPres = ((inputTag.id in lblDict) || (accessAideFuncs.checkParentMatchesTag(inputTag, "LABEL")));
    	               if(!lblIsPres){
    	        	   errorArray.push(inputTag);
    	               }
	            }
  	        }
  	        return errorArray;
            },
            
            /**
             * Function that goes finds all given tags and makes sure that they all have an attribute set
             * @param   tags   - Name of the tag to find all instances of 
             * @param   attribute - The attribute that is being sought (for, id, title, etc)
             * @param   errorVal  - Value that this attribute should not be set to
             * @param   evalFunc  - Function to evaluate whether or not attribute is valid
             * @returns array    - All errornous tags
             */
            checkForAttrib : function(tags, attribute, errorVal, evalFunc){
	        var errorArray = [];
	        var atrib ="";
	        
	        for(var i=0; i<tags.length; i++){
	                atrib = $A.util.getElementAttributeValue(tags[i], attribute);
	        	if($A.util.isEmpty(atrib) || evalFunc(atrib.toLowerCase(), errorVal)){
	        	    errorArray.push(tags[i]);
	        	}
	        }
	        return errorArray;
            },
            
            /**
             * This method grabs all attributes of a tag and turns them into strings 
             * @param   attribs - All of the attributes in a tag
             * @returns string - String value of all of the tag attributes
             */
            attribStringVal : function(attribs){
        	
        	if($A.util.isUndefinedOrNull(attribs)){
        	    return "No data found";
        	}
        	
        	var strAttrib ="";
        	var attrib=null;
        	    
        	for(var i = 0; i<attribs.length; i++){
        	    attrib = attribs.item(i);
        	    strAttrib = strAttrib + " " +attrib.nodeName+ "=\""+attrib.value+"\""; 
        	}
        	return strAttrib;
            },
            /**
             * Method that looks at the given tag and will look print out the next two parents components names
             * @param   tag     - The initial tag to find the parents of
             * @param   spacing - The amount of spacing that we want per item
             * @returns String  - The string representation of the the cmp stack trace 
             */
            getStackTrace : function(tag, spacing){
	            var cmp = null;
                    var cmpInfo = {};
                    var cmpNameArray = [];
                    var cmpName = "";
                    var spaces = "";
                    
                    //Keep going up until we hit the either the BODY or HTML tag
                    while(!$A.util.isUndefinedOrNull(tag) && tag.tagName.toLowerCase() !== "body" && tag.tagName.toLowerCase() !== "html"){
                         data_aura_rendered_by = $A.util.getElementAttributeValue(tag, "data-aura-rendered-by");
        
                         //Make sure it has a rendered by value
                         if(!$A.util.isEmpty(data_aura_rendered_by)){
                             cmp = $A.getCmp(data_aura_rendered_by);
                             if(!$A.util.isUndefinedOrNull(cmp)){
                                 cmp = cmp.getAttributes().getValueProvider();
                                 if("getDef" in cmp){
                                	 cmp = cmp.getDef().getDescriptor();
                                     cmpName = cmp.getNamespace()+":"+cmp.getName();

                                     //Making sure that we have unique components
                                     if(!(cmpName in cmpInfo)){
                                     	cmpInfo[cmpName] = "";
                                     	cmpNameArray.push(cmpName);
                                     }
                                 }
                             }
                         }
                         tag = tag.parentNode;
                     }
                    
                     spaces = spacing;
                     cmpName = "";
                     for(var index=cmpNameArray.length-1; index>=0; index--){
                     	cmpName = cmpName + spaces+ cmpNameArray[index]+"\n";
                     	spaces = spaces+"   ";
                     }
                     
                     return cmpName;
	        },
	     /**
	      * Method that checks to that an element has the necessary functions to be able to grab data from it and format correct.
	      * The only thing that this will stop is the ability to say which component rendered it.
	      * @param elm        - component that we are making sure contains all of the necessary informaiton.
	      * @return boolean   - True if all functions exist. False otherwise
	      */
	     containsNecessaryFunctions : function(elm){
	         var checkExists = $A.util.isUndefinedOrNull;
	         return  (!checkExists(elm)) && 
		         ("getAttributes" in elm) && !checkExists(elm.getAttributes()) &&
		         ("getValueProvider" in elm.getAttributes() && !checkExists(elm.getAttributes().getValueProvider())) && 
		         ("getDef" in elm.getAttributes().getValueProvider() && !checkExists(elm.getAttributes().getValueProvider().getDef()));
	     },   
            /**
             * Method grabs everything from the given array and prints out the error and the tag(s) that are the issue
             * @param   tagError - The error message for the given tag
             * @param   errArray - The array of errors
             * @returns String - Either the empty string or a string representation of the error
             */
            formatOutput : function(tagError, errArray){
                    if(errArray.length === 0){
                        return "";
        	    }
                    var len = errArray.length;
                    var data_aura_rendered_by = "";
                    var compThatRenderedCmp = "";
                    var cmpInfo = "";
                    var cmpDesc = "";
                    var nodeName = "";
                    var cmp = "";
                    var errStr = "\nIssue: "+tagError+"\n";
                    var accessAideFuncs = aura.devToolService.accessbilityAide;
                    accessAideFuncs.errorCount = len + accessAideFuncs.errorCount; 
                    
                    for(var i = 0; i<len; i++){
                	nodeName = errArray[i].nodeName.toLowerCase();
                	data_aura_rendered_by = $A.util.getElementAttributeValue(errArray[i], "data-aura-rendered-by");
                	cmpInfo = "";
                	cmpDesc = "";
                	
                	//Make sure it has a rendered by value
                	if($A.util.isEmpty(data_aura_rendered_by)){
                	    nodeName = errArray[i].nodeName.toLowerCase();
                	    cmpInfo = "No Aura information available";
                	    compThatRenderedCmp = cmpInfo;
                	}
                	else{
                	    //Making sure that the cmp is rendered by Aura and a normal HTML tag
                	    //Making sure to grab the correct $A. Depending if you are using the debuggertool or not, $A will be different
                	    cmp = $A.getCmp(data_aura_rendered_by);
                	    
                	    if(accessAideFuncs.containsNecessaryFunctions(cmp)){
                		//If he component exists grab it descriptor
                		cmpDesc = cmp.getAttributes().getValueProvider().getDef().getDescriptor();
                		
                		//Grab the namespace and name so that it is not viewed as a hyperlink
                		cmpInfo = cmpDesc.getNamespace()+":"+cmpDesc.getName();
                		
                		//Grabbing the erroneous components value provider
                		cmpDesc = cmp.getAttributes().getValueProvider();
                		
                		//Making sure we are not at the app level and that we are not looking at a pass through value
                		if(accessAideFuncs.containsNecessaryFunctions(cmpDesc)){                    
                		    cmpDesc = cmpDesc.getAttributes().getValueProvider();
                		    cmpDesc = cmpDesc.getDef().getDescriptor();
                		    compThatRenderedCmp = cmpDesc.getNamespace()+":"+cmpDesc.getName();
                	        }
                		else{
                		    //If the component does not have a valueprovider than we are at the app level, or the necessary information can't be found
                		    compThatRenderedCmp = cmpInfo;
                		}
                	}
                	else{
                	    cmpInfo = "No Aura information available";
                	    compThatRenderedCmp = cmpInfo;
                	}
                }
                
                errStr = errStr+"Component markup: //"+cmpInfo+"\nFound in: //"+compThatRenderedCmp+"\nRendered Tag:   <"+nodeName+""+accessAideFuncs.attribStringVal(errArray[i].attributes)+">...</"+nodeName+">\n";             
                errStr = errStr+"StackTrace:\n" + accessAideFuncs.getStackTrace(errArray[i], "           ");
            }
                return errStr;
            },
            /**
             * Method looks at the given tags title, and makes sure that it is not the empty string
             * @param   hd - The head tag
             * @returns Array - Returns an array of all erroneous values
             */
            checkHeadHasCorrectTitle : function(hdErrMsg, hd){
        	    var title = hd.getElementsByTagName("title")[0];
        	    var errArray = [];
        	    if($A.util.isUndefinedOrNull(title) || $A.util.getText(title) === ""){
        		errArray.push(hd);  
        	    }
        	    return errArray;
        	},
        	/**
                 * Method looks at the given anchors img (if it exists) and checks to see if it has an img atrib
                 * @param   anchor  - The anchor in question
                 * @returns Boolean - Returns whether a valid img alt was found
                 */
        	anchrDoesNotHaveImgWithAlt : function(anchor){
        	    var imgs = anchor.getElementsByTagName("img");
        	    var alt = "";
        	    
        	    for(var i =0; i<imgs.length; i++){
        		alt = $A.util.getElementAttributeValue(imgs[i], "alt");
        		if(!$A.util.isEmpty(alt) && alt.replace(/[\s\t\r\n]/g,'') !== ""){
        		   return false;    
        		}
        	    }
        	    return true;
        	},
        	
                /**
                 * Method looks at the given arrays for anchor statements that are the empty string
                 * @param   anchors - The anchor tags in the document
                 * @returns Array - Returns an array of all erroneous values
                 */
                checkAnchorHasInnerText : function (anchors){
    	        	var errArray = [];
    	        	var anchor = null;
    	        	var text = "";
    	        	var anchorId = null;
    	        	var accessAideFuncs = $A.devToolService.accessbilityAide;
    	        	for(var index = 0; index<anchors.length; index++){
    	        	    anchor = anchors[index];
    	        	    
    	        	    anchorId = $A.util.getElementAttributeValue(anchor, "id");
    	        	    
    	        	    // Temporary fix for ckeditor. current issue is that ckeditor set "=" which causes innerText to not return the correct value
    	        	    // Work-around will be temporary and should be removed when ckeditor is updated.
    	        	    // Bug to track removal: W-1979552
    	        	    if($A.util.isEmpty(anchorId) || anchorId.indexOf("cke_") !== 0 ){
    	        	    	 //Text should not be undefined or null at any point since $A.test.getText will always return something
        	        	    text = $A.util.getText(anchor).replace(/[\s\t\r\n]/g,'');
        	        	                        
        	        	    if(text === "" && accessAideFuncs.anchrDoesNotHaveImgWithAlt(anchor)){
        	        	          errArray.push(anchor);
        	        	    }
    	        	    }
    	        	}
    	        	return errArray;
                },
                /**
                 * Method grabs everything from the given array and finds all tags that are erroneous
                 * @param   inputTags - radio and checkbox inputs
                 * @returns array     - Array of all errors that have been found 
                 */
                radioButtonAide : function(inputTags){
                   	 var errorArray = [];
              		 var inputTag = null;
              		 var inputType = "";
              		 var rcName = "";
              		 var dict = {};
              		 var tmpArray = [];
              		 var accessAideFuncs = aura.devToolService.accessbilityAide;
              		 
               		 for(var i =0; i<inputTags.length; i++){ 
              		     inputTag = inputTags[i];
              		     inputType = $A.util.getElementAttributeValue(inputTag, 'type').toLowerCase();
              		     if(inputType === "radio" || inputType === "checkbox"){
              			 rcName = $A.util.getElementAttributeValue(inputTag, 'name');
              			 if($A.util.isEmpty(rcName)){
              			     continue;
              			 }
              			 
              			 if(!(rcName in dict) ){
              			     dict[""+rcName] = [];
              			 }
              			 
              			 dict[rcName].push(inputTag);
              		     }
              		 }
               		 
               		 for(rcName in dict){
               		    tmpArray = dict[rcName];
               		    if(tmpArray.length >= 2){
               			for(var index = 0; index<tmpArray.length; index++){ 
                   		    if(!accessAideFuncs.checkParentMatchesTag(tmpArray[index], "FIELDSET")){
                   			 errorArray.push(tmpArray[index]);
                   	            }
                   		} 
               		     } 
               		 }
               		 
               		 return errorArray;
                 },
                 /**
                   * Method that takes in a list of buttons and makes sure that they all have some text associated with them in the labels
                   * @param   buttons     - All buttons that are on the page
                   * @returns Array    - Array of all the errors
                   */
                 buttonLabelAide : function(buttons){
                     var errorArray = [];
                     var button = null;
                     var buttonImage = null;
                     var testText = null;
                     for(var i = 0; i<buttons.length; i++){
                	 button = buttons[i];
                	 if(!$A.util.isUndefinedOrNull(button)){ 
                	     
                	     buttonImage = button.getElementsByTagName("img");
                	     if(buttonImage.length === 0){                		 
                		 testText = $A.util.getText(button).replace(/[\s\t\r\n]/g, '');
                		 if(testText === ''){
                 			errorArray.push(button);  
                 		 }
                	     }
                	 }     
             	     }
                     return errorArray;               
                 },
                 /**
                  * Method that goes through all tables present on the page and makes sure the tags underneath them have either an id or scope associated with them
                  * @param   tables        - The tags to find 
                  * @param   tableErrorMsg - The error message to show when errors are found
                  * @returns Array         - The error array
                  */
                 checkTables : function(tables, tableErrorMsg){
                     var headerDict = {};
                     var ths = [];
                     var scopeVal = "";
                     var idVals = "";
                     var errorArray = [];
                     var i = 0, j = 0;
                     var skipTDCheck = false;
                     var validScopes = {'row': false, 'col': false, 'rowgroup': false, 'colgroup' : false};
                     for(var index = 0; index<tables.length; index++){
                	 ths = tables[index].getElementsByTagName("th");
                	//Reset Variables
                         headerDict = {};
                         allThsHaveScope = [];
                         skipTDCheck = false;
                         
                         //If we have no headers, tds wont be a problem
                         if(ths.length === 0){
                             continue;
                         }
                         //Phase 1:  If all <th> within a <table> contain scope attribute and scope attribute value is one of col, row, colgroup, rowgroup, then pass test. 
                         for(i = 0; i<ths.length; i++){                      
                             //Grab scope
                             scopeVal = $A.util.getElementAttributeValue(ths[i], "scope");
                             idVals = $A.util.getElementAttributeValue(ths[i], "id");
                             //If Scope exists
                             if(!$A.util.isEmpty(scopeVal)){
                            	 if(!(scopeVal in validScopes) || $A.util.trim(scopeVal) === ""){
                            	    errorArray.push(ths[i]);
                            	 }
                            	 
                            	 skipTDCheck = true;
                            	
                             }
                             else if(!$A.util.isEmpty(idVals)){
                        	 headerDict[idVals] = true;
                             }
                             else{
                        	 errorArray.push(ths[i]);
                             }
                         }
                         
                         //If we have already found an error with the THS (either they don't have an ID or they don't have a scope) skip the rest
                         if(!$A.util.isEmpty(errorArray) || skipTDCheck){
                             continue;
                         }
                       
                       
                         //Phase 2: If all <th> within a <table> contain "id" and all <td> contain "headers" attribute, and each id listed in header attribute matches id attribute of a <th>, then pass test.
                         tds = tables[index].getElementsByTagName("td");
                         
                         //Don't need this I believe
                         if(tds.length === 0){
                             continue;
                         }
                         for(i = 0; i<tds.length; i++){
                             idVals = $A.util.getElementAttributeValue(tds[i], "headers");
                             if($A.util.isEmpty(idVals)){
                        	 errorArray.push(tds[i]);
                        	 continue;
                             }
                             
                             idVals = $A.util.trim(idVals).split(/\s+/);
                             for(j = 0; j<idVals.length; j++){
                        	 if(!(idVals[j] in headerDict)){
                        	     errorArray.push(tds[i]);
                        	     break;
                        	 }
                             }
                         }
                     }
                     return errorArray;
                 },
                 /**
                  * Method that takes in a list of h#, the tag that show follow directly after, and all possible items that can be found.
                  * It will start start searching through siblings of h# to find invalid-nested tags and return an error array with them if found
                  * @param   tags     - Array of all h# tags to look at
                  * @param   nextTag  - String representation of the very next tag that we should see. 
                  * 			i.e. if tags contains all h1 tags, nextTag should be "h2"
                  * @param   allHdrs  - Dictionary of all possible h# we can see.
                  * 		       i.e. if tags is a list of all h1 tags in the document, then allHdrs will be a dictionary
                  * 		       of h2-h6. 
                  * @returns Array    - Array of all the errors
                  */
                 findNextHeader : function(tags, nextTag, allHdrs){
                     var errorArray = [];
                     var children = [];
                     var child = null;
                     var currTag;
                     var startLooking = false;

                     for(var index = 0; index< tags.length; index++){
                 	children = tags[index].parentNode.children;
                 	currTag = "";
                 	startLooking = false;

                 	if($A.util.isUndefinedOrNull(children)){
                 	    continue;
                 	}
                 	            	
                 	for(var childIndex = 0; childIndex < children.length; childIndex++){
                 	    child = children[childIndex];
                 	    
                 	    if(tags[index] === child){
                 		startLooking = true;
                 	    }
                 	    
                 	    if(startLooking){
                 		currTag = child.tagName.toLowerCase();
                 		if(currTag in allHdrs){
                 		    if(currTag !== nextTag){
                 			errorArray.push(child);
                 		    }
                 		    break;
                 		}
                 	    }
                 	}
                     }
                     
                     return errorArray;
                 }
        },
        verifyAccessibility : {
            /**
             * Function that will find all nested Headers and make sure that they have in 1 lvl difference
             * @returns String - Returns a string representation of the errors
             */
            checkNestedHeaders : function(domElem){
                   var headerErrMsg = "Headings are properly nested and increased by 1 level at a time. e.g., h1 followed by h2, h2 followed by h2 or h3. Refer to http://www.w3.org/TR/WCAG20-TECHS/G141.html.";
                   var errArray = [];
                   var accessAideFuncs = $A.devToolService.accessbilityAide;
                   var hdrs1 = domElem.getElementsByTagName("h1");
                   var hdrs2 = domElem.getElementsByTagName("h2");
                   var hdrs3 = domElem.getElementsByTagName("h3");
                   var hdrs4 = domElem.getElementsByTagName("h4");
                   var hdrs5 = domElem.getElementsByTagName("h5");

                   errArray = errArray.concat(accessAideFuncs.findNextHeader(hdrs1, "h2", {"h2":"", "h3":"", "h4":"", "h5":"", "h6":""}));
                   errArray = errArray.concat(accessAideFuncs.findNextHeader(hdrs2, "h3", {"h3":"", "h4":"", "h5":"", "h6":""}));
                   errArray = errArray.concat(accessAideFuncs.findNextHeader(hdrs3, "h4", {"h4":"", "h5":"", "h6":""}));
                   errArray = errArray.concat(accessAideFuncs.findNextHeader(hdrs4, "h5", {"h5":"", "h6":""}));
                   errArray = errArray.concat(accessAideFuncs.findNextHeader(hdrs5, "h6", {"h6":""}));

                   return accessAideFuncs.formatOutput(headerErrMsg, errArray);
               
             },
               /**
                * Function that will find all anchors and make sure that they have text in them
                * @returns String - Returns a string representation of the errors
                */
               checkAnchorHasText : function(domElem){
                      var anchorErrMsg = "Anchor tag should contain proper link text and tell what the link is about. For a graphical link, uses ui:image instead,"+
                   		      " or uses a span tag with assistiveText class to include the link text; uses ui:button if it's a button.";
                      var accessAideFuncs = $A.devToolService.accessbilityAide;
                      var anchors = domElem.getElementsByTagName("a");
                      return accessAideFuncs.formatOutput(anchorErrMsg, accessAideFuncs.checkAnchorHasInnerText(anchors));
                  
                },
                /**
                 * Function that will find all ths and make sure that they have scope in them, and that they are equal to row, col, rowgroup, colgroup
                 * @returns String - Returns a string representation of the errors
                 */
                  checkHeadTitle : function(domElem){
        		var hdErrMsg = "Head element must include non-empty title element. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms.html.";
        		var accessAideFuncs = $A.devToolService.accessbilityAide;
        		var hd = domElem.getElementsByTagName("head")[0];
        		
        		if($A.util.isEmpty(hd)){
        		    return "";
        		}
        		return accessAideFuncs.formatOutput(hdErrMsg, accessAideFuncs.checkHeadHasCorrectTitle(hdErrMsg, hd));
        	     },
        	     /**
                      * Function that will find all ths and make sure that they have scope in them, and that they are equal to row, col, rowgroup, colgroup
                      * @returns String - Returns a string representation of the errors
                      */
             	     checkTableIsAccessible : function(domElem){
             		var tableErrorMsg = "Table header must properly associate with table cell by, either using 'scope' attribute with one of the values 'row', 'col', 'rowgroup' and 'colgroup', or using id and headers attributes.";
         		var accessAideFuncs = aura.devToolService.accessbilityAide;
         		var tables = domElem.getElementsByTagName("table");
         		return accessAideFuncs.formatOutput(tableErrorMsg, accessAideFuncs.checkTables(tables, tableErrorMsg));
             	     },
                     /**
                      * Function that will find all IFrames and make sure that they have titles in them
                      * @returns String - Returns a string representation of the errors
                      */
        	     checkIFrameHasTitle : function(domElem){
        		var iFrameTitleMsg = "Each frame and iframe element must have non-empty title attribute. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/ensure-compat.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
                        var iframes = domElem.getElementsByTagName("iframe");
        		
        		/**THIS CODE BLOCK SHOULD BE REMOVED AFTER PARTIAL CODE RUNNING**/
        		var id = null;
        		var src = null;
        		var frame = null;
        		var iframeArray = [];
        		for(var i = 0; i<iframes.length; i++){
        			frame = iframes[i];
        			id  = $A.util.getElementAttributeValue(frame, "id");
        			src = $A.util.getElementAttributeValue(frame, "src"); 
        			if((!$A.util.isUndefinedOrNull(src) && src.indexOf("/apex/") !== -1) ||
        					(!$A.util.isUndefinedOrNull(id) && id.toLowerCase().indexOf("vfframeid") !== -1)){
        				continue;
        			}
        			
        			iframeArray.push(frame);
        		}
        		/*************************************************************************/
        		return accessAideFuncs.formatOutput(iFrameTitleMsg,accessAideFuncs.checkForAttrib(iframeArray, "title", "", accessAideFuncs.doesContain));
        	    },
        	    /**
                     * Grabs all images tags and makes sure they have titles
                     * @returns String - Returns a string representation of the errors
                     */
        	    checkImageTagForAlt : function(domElem){
        		var imgError = "IMG tag must have alt attribute. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/text-equiv.html.";
        		var infoMsg = "\nNote: If the image type is informational, then the alt must be set";
                	var decoMsg = "\nNote: If the image type is decorative,  then the alt must be the empty string";
                	var altError = "\nNote: Alt attribute cannot not be equal to \"undefined\", \"empty\", \"null\"";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		var allImgTags = domElem.getElementsByTagName("img");
       		        return accessAideFuncs.findAllImgTags(allImgTags, imgError, infoMsg, decoMsg, altError);
        	    },
        	    /**
                     * Goes through all of the fieldsets tags that do not have the display:none field set and makes sure that each one has a legend
                     * @returns String - Returns a string representation of the errors
                     */
        	    checkFieldSetForLegend : function(domElem){
        		var fieldsetLegnedMsg = "Fieldset element must include legend element. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		var fieldSets = domElem.getElementsByTagName('fieldset');
        		var legends = "";
        		var errorArray = [];
        		var fieldSetSytle  = "";
        		for(var i=0; i<fieldSets.length; i++){
        		        legends = fieldSets[i].getElementsByTagName('legend');
        		        fieldSetSytle = fieldSets[i].style.display;
        		      
        		        if(!$A.util.isUndefinedOrNull(fieldSetSytle) && fieldSetSytle == "none"){
        		            continue;
        		        }

        	        	if(legends.length === 0){
        	        	    errorArray.push(fieldSets[i]);
        	        	}
        	         }
        		return accessAideFuncs.formatOutput(fieldsetLegnedMsg, errorArray);
        	    }, 
        	    checkButtonsHaveNonEmptyLabel : function(domElem){
           		 var buttonLabelErrorMsg = "Button should have non-empty label. When using ui:button, assign a non-empty string to label attribute.";
           		 var accessAideFuncs = aura.devToolService.accessbilityAide;
           		 var buttonTags = domElem.getElementsByTagName('button');
           		 return accessAideFuncs.formatOutput(buttonLabelErrorMsg, accessAideFuncs.buttonLabelAide(buttonTags));
           	    },
       	    
        	    /**
                     * Gets all radio buttons, then traverses up the tree to find if they are in a fieldset
                     * @returns String - Returns a string representation of the errors
                     */
        	    checkRadioButtonsInFieldSet : function(domElem){
        		 var radioButtonFieldSetMsg = "Radio button and checkbox should group by fieldset and legend elements. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/content-structure-separation.html.";
        		 var accessAideFuncs = aura.devToolService.accessbilityAide;
        		 var inputTags = domElem.getElementsByTagName('input');
        		 return accessAideFuncs.formatOutput(radioButtonFieldSetMsg, accessAideFuncs.radioButtonAide(inputTags));
        	    },
        	    /**
                     * Verifys that all inputs have a label
                     * @returns String - Returns a string representation of the errors
                     */
        	    checkInputHasLabel : function(domElem) {
        		var inputLabelMsg   = "A label element must be directly before/after the input controls, and the for attribute of label must match the id attribute of the input controls, OR the label should be wrapped around an input. Refer to http://www.w3.org/TR/UNDERSTANDING-WCAG20/minimize-error.html.";
        		var accessAideFuncs = aura.devToolService.accessbilityAide;
        		var inputTextTags   = domElem.getElementsByTagName('input');
         		var textAreaTags    = domElem.getElementsByTagName('textarea');
                        var selectTags      = domElem.getElementsByTagName('select');
                        var lbls = domElem.getElementsByTagName("LABEL");  
                        var errorArray = [];
                        
                        errorArray = errorArray.concat(accessAideFuncs.inputLabelAide(lbls, inputTextTags));
                        errorArray = errorArray.concat(accessAideFuncs.inputLabelAide(lbls, textAreaTags));
                        errorArray = errorArray.concat(accessAideFuncs.inputLabelAide(lbls, selectTags));
                                  	        
        	        return accessAideFuncs.formatOutput(inputLabelMsg, errorArray);
        	    },
        	    /**
        	     * Test that will verify that if there exists an inputDefaultError on the page, that there is a corresponding input associated with it
        	     */
        	    checkForInputDefaultError : function (domElem){
        	    	var accessAideFuncs = aura.devToolService.accessbilityAide;
        	    	var inputErrorMsg = "Error message for input field should be associated with the input control by using aria-describedby.";        	        
        	    	var errorArray = accessAideFuncs.inputDefaultErrorAide(domElem.getElementsByTagName("ul"), domElem.getElementsByTagName("input"), domElem.getElementsByTagName("select"), domElem.getElementsByTagName("textarea"));       	    	
        	    	return accessAideFuncs.formatOutput(inputErrorMsg, errorArray);
        	    }
        },
        /**
         * Calls all functions in VerifyAccessibility and stores the result in a string
         * @returns String - Returns a a concatenated string representation of all errors or the empty string
         */
        checkAccessibility : function(domElem){
            var functions = aura.devToolService.verifyAccessibility;
            var result = "";
            aura.devToolService.accessbilityAide.errorCount = 0;
            
            if($A.util.isUndefinedOrNull(domElem)){
        	domElem = document;
            }
            
            for(var funcNames in functions){           
        	   result = result + functions[funcNames](domElem);
            }
            
            if(aura.devToolService.accessbilityAide.errorCount === 0){
        	return "";
            }
            
            return "Total Number of Errors found: "+aura.devToolService.accessbilityAide.errorCount+result;
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
