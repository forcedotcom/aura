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
     * Create a new component whose definition was already preloaded.
     */
    createCmpWithPreloadedDef : function(cmp, evt,helper){
        helper.createComponentAndPushToBody(cmp, "markup://aura:text");
    },

    /**
     * Create a component and initialize it with simple attributes.
     */
    createCmpWithSimpleAttributes : function(cmp, evt, helper){
        helper.createComponentAndPushToBody(cmp, {componentDef: "markup://aura:text",
                                                   attributes:{
                                                	   values:{ truncate:6,
                                                                value:"TextComponent"
                                                       }
                                                   }
                                                 });
    },
    /**
     * Create a component with localId set in config.
     */
    createCmpWithLocalId : function(cmp, evt, helper){
        helper.createComponentAndPushToBody(cmp, {componentDef: "markup://aura:text",
                                                   localId: "merp",
                                                   attributes:{
                                                       values:{ truncate:6,
                                                                value:"TextComponent"
                                                       }
                                                   }
                                                 });
    },
    createCmpWithComplexAttributes: function(cmp, evt, helper){
        helper.createComponentAndPushToBody(cmp, 
        		{componentDef: "markup://loadLevelTest:displayStringArray",
               		attributes:{
	            	   values:{
	                        StringArray:['one','two']
	            	   }
               		}
        		});
    },
    /**
     * Create a component whose definition is not available at the client.
     * This definition would be fetched at the server.
     */
    createCmpByFetchingDefFromServer : function(cmp, evt,helper){
        helper.createComponentAndPushToBody(cmp, {componentDef: "markup://loadLevelTest:displayNumber",
                                                  attributes:{
                                                	  values:{number:99}
                                                  }
                                                 });
    },
    /**
     * Create a component whose definition is already available at the client,
     * but the component has server dependencies. Make sure, initially a placeholder is put in place, later replaced by actual component.
     * The model for loadLevelTest:serverComponent uses the attribute value.
     */
    createCmpWithServerDependecies : function(cmp, evt,helper){
        helper.createComponentAndPushToBody(cmp, {componentDef: "markup://loadLevelTest:serverComponent",
                                                    attributes:{
                                                    	values:{stringAttribute:'creatingComponentWithServerDependecies'}
                                                    }
                                                });
    },
    /**
     * Provider a component descriptor that does not exist.
     *
     */
    createNonExistingComponent : function(cmp, evt,helper){
        helper.createComponentAndPushToBody(cmp, 'foo:hallelujah');
    },
    /**
     * Provider a component descriptor whose compilation fails.
     * test:test_Preload_BadCmp has two attributes with the same name.
     */
    createComponentWithCompilationProblems: function(cmp, evt, helper){
        helper.createComponentAndPushToBody(cmp, 'test:test_Preload_BadCmp');
    },

    /**
     * Provide a abstract component as descriptor, expect it to be resolved at the server using the provider and replaced with a implementation.
     */
    createAbstractComponent:function(cmp,evt,helper){
        helper.createComponentAndPushToBody(cmp, 'test:test_Provider_AbstractBasic');
    },
    /**
     * Create a component with a facet that is marked for lazy loading.
     * This is 2 levels of lazy loading, first the component itself is lazy loaded, then the facet inside the component is lazy loaded.
     */
    createComponentWithLazyFacets:function(cmp,evt,helper){
        helper.createComponentAndPushToBody(cmp, 'loadLevelTest:serverWithLazyChild');
    },
    /**
     * Create component exclusively.
     * In this case, the placeholder's exclusive attribute is set to true and this request is not batched.
     */
    createComponentExclusively:function(cmp,evt,helper){
        //1 component exclusively
        helper.createComponentAndPushToBody(cmp, {componentDef : "markup://loadLevelTest:serverComponent", load : "EXCLUSIVE"});
        //2 components lazily
        helper.createComponentAndPushToBody(cmp, {componentDef: "markup://loadLevelTest:displayBoolean", load:"LAZY"});
        helper.createComponentAndPushToBody(cmp, {componentDef: "markup://loadLevelTest:displayNumber", load:"LAZY"});
    },
    createComponentAndVerifyAction:function(cmp,evt,helper){
        helper.createComponentAndPushToBody(cmp, {componentDef : "markup://loadLevelTest:clientWithLazyClientChild"});
    }
})
