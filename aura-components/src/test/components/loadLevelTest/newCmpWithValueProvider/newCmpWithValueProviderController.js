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
    /**
     * Create a new component whose definition was already preloaded and use the current component as attribute value provider.
     */
    createCmpWithPreloadedDef : function(cmp, evt,helper){
    	var expression = "{!v.stringAttribute}";
        var config = {componentDef:"markup://aura:text",
                      attributes:{
                    	  values:{
                                    truncate:6,
                                    value: expression
                                 }
                          },
                      localId:"txt_Id"
                     };
        helper.createComponentAndPushToBody(cmp,config,cmp);
    },
    /**
     * Create a new component whose definition was already preloaded and provide a custom attribute value provider.
     * W-1308292 - Passing localId in config for newCmp will invoke the fix
     */
    createCmpWithPassthroughValue : function(cmp, evt,helper){
        var expression = "{!v.nameAttribute}";
        var config = {componentDef:"markup://aura:text",
                      attributes:{
                    	  values:{
	                            truncate:10,
	                            value: expression
                          }
                      },
                      localId:"txt_Id"
                     };
        var avp = $A.expressionService.createPassthroughValue({}, cmp)
        helper.createComponentAndPushToBody(cmp,config, avp);
        return avp;
    },
    /**
     * Create a component whose definition is not available at the client.
     * This definition would be fetched at the server.
     */
    createCmpByFetchingDefFromServer : function(cmp, evt,helper){
        //Use attribute of current component as value for new cmp's attribute
        var expression = "{!v.numberAttribute}";

        //Specify current component's attribute as value for new cmp's attribute
        var config = {componentDef:"markup://loadLevelTest:displayNumber",
                      attributes:{
                          values:{
                              number: cmp.getReference(expression)
                          }
                      }
                      , localId:"num_Id"
                     };

        //Specify current component as value provider
        helper.createComponentAndPushToBody(cmp,config,cmp);

        //Test Code, the line below will work fine since it is not specifiying any attributes.
        //helper.createComponentAndPushToBody(cmp, "markup://loadLevelTest:displayNumber");
    },

    /**
     * Test server dependent client created component with attributes containing PropertyReferenceValue in MapValue
     */
    createCmpWithMapValuePropRefValueFromServer : function(cmp, evt,helper){
    	var expression = "{!v.stringAttribute}";
    	var config = {
            componentDef:"markup://loadLevelTest:displayMap",
            attributes:{
                values:{
                    map: {
                        map2: {
                            propRef: expression
                        },
                        propRef: expression
                    }
                }
            },
            localId:"map_Id"
        };

        helper.createComponentAndPushToBody(cmp, config, cmp);
    },

    /**
     * Create a new component whose definition was already preloaded and
     * use blank object as value provider.
     */
    createCmpWithEmptyValueProvider : function(cmp, evt,helper){
        var expression = "{!v.stringAttribute}";
        var config = {componentDef:"markup://aura:text",
                      attributes:{
                    	  values:{
                               truncate:6,
                               value:expression
                          }
                      }
                     };
        helper.createComponentAndPushToBody(cmp,config,{});
    },
    /**
     * Create a new component whose definition was already preloaded and
     * use undefined as value provider.
     */
    createCmpWithUndefinedValueProvider : function(cmp, evt,helper){
        var expression = "{!v.stringAttribute}";
        var config = {componentDef:"markup://aura:text",
                      attributes:{
                    	  values:{
	                           truncate:6,
	                           value:expression
                          }
                      }
                     };
        helper.createComponentAndPushToBody(cmp,config,undefined);
    },
    /**
     * Create a new component which does not need a AVP because all its attributes are already initialized.
     */
    createCmpWithNoRequirementForAVP : function(cmp, evt,helper){
        var config = {componentDef:"markup://aura:text",
                      attributes:{
                    	  values:{
                            truncate:14,
                            value:'SelfSustaining'
                          }
                      }
                     };
        helper.createComponentAndPushToBody(cmp,config,undefined);
    }
})
