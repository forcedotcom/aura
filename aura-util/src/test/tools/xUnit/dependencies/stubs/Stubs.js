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
Function.RegisterNamespace("Test.Tools.Aura.Stubs");
/*
 * Aura Stub
 */
Test.Tools.Aura.Stubs.Aura=new function(){
    var _stubAura=this;

    this.GetAction=function(params,state,callback,returnValue){
        return Stubs.GetObject({
            addEventHandler:{},
            getDef:{returnValue:{}},
            getError:{},
            getParam:function(name){return this.params&&this.params[name];},
            getParams:function(){return this.params;},
            getReturnValue:function(){return this.returnValue;},
            getState:function(){return this.state;},
            getStorage:{returnValue:{}},
            removeEventHandler:{},
            run:{parameters:["evt"]},
            runAfter:{parameters:["action"]},
            setAbortable: {},
            setStorable: {},
            setCallback:function(scope,callback,name){this.callback=callback;this.callbackScope=scope;},
            setParams:function(params){this.params=params;},
            toJSON:function(){return {id:this.id,descriptor:{},params:this.params}}
        },{callback:callback||null,params:params||{},returnValue:returnValue||{},state:state||{},callbackScope:{}});
    };

    /**
     * Get an object that represents an Aura Object.
     * Allows you to specify additional data about the object via the constructor.
     *
     * @param {Object} attributes A map of component attributes, and their values to be returned from component.get() calls.
     * @param {Object} children A map of child nodes in the form { id: cmp } that can be found using the stubbedComponent.find(id) method.
     * @param {Object} propertyBag is a map of overrides for the returned component. If you don't want the stubbed version of an existing method, pass it in here, and it will be applied to the returned component.
     * @param {Object} Alternate Def Descriptor to return for your component.
     *
     * @example
     var stubComponent=Stubs.Aura.GetComponent({
			      	"m.columnHeaders":["one", "two", "three"],
			      	"v.color":"blue"
				  });
     Assert.Equal(stubComponent.get("v.color"), "blue");

     var stubParent = Stubs.Aura.GetComponent({}, { "subCmpId": stubComponent} );
     Assert.Equal(stubParent.find("subCmpId"), stubComponent); // True!

     var stubAnotherParent = Stubs.Aura.GetComponent(
     {},
     { "subCmpId": stubComponent},
     { "find": function() { return "asdf"; } });
     Assert.NotEqual(stubAnotherParent.find("subCmpId"), stubComponent); // True, NotEqual
     Assert.Equal(stubAnotherParent.find("subCmpId"), "asdf");
    */
    this.GetComponent = function (attributes, children, propertyBag, descriptor) {
        var stubbedAttributes={};
        Object.ForEach(attributes||{},function(value,context){stubbedAttributes[context.Name]=value;});
        var stubbedChildren={};
        Object.ForEach(children||{},function(value,context){stubbedChildren[context.Name]=value&&(Object.IsType(_stubAura.GetComponent,value)||Object.IsType(Array,value))&&value||_stubAura.GetComponent(value);});
        var stubbedAttributeDefs=Stubs.GetList(attributes&&Object.keys(attributes)||[], {each:function(value){return this.Source_Value;}});
        var stubbedDescriptor=Stubs.GetObject({getQualifiedName:function(){return descriptor;}});
        var stubbedDef=Stubs.GetObject({getAttributeDefs:{returnValue:stubbedAttributeDefs}, getDescriptor:stubbedDescriptor});
        var globalId = (Math.random() * 10000000).toString();

		var get = function(expression){return stubbedAttributes[expression]};
		var set = function(expression,value){if(stubbedAttributes[expression])stubbedAttributes[expression]=value;else stubbedAttributes[expression]=value};

        var stub=Stubs.GetObject({
            addEventHandler:{},
            addValueHandler:{parameters:["config"]},
            find:function(expression){return stubbedChildren[expression];},
            get:get,
            getConcreteComponent:function(){return this;},
            getDef:{returnValue:stubbedDef},
            getElement:{returnValue:Stubs.Dom.GetNode()},
            getEvent:function(name){return this.get("e."+name)},
            getEventDispatcher:{},
            getGlobalId:function(){ return globalId; },
            isDirty:{returnValue:false},
            isValid:{returnValue:true},
            removeEventHandler:{},
            set:set
        },propertyBag||{},Object.Global().$A?$A.Component:null); //JBUCH: find a way to get this reference, obfuscated.
        return stub;
    };

    this.GetComponentConfig=function(){/*stub*/};

    this.GetComponentDef = function(descriptor, attributes, instancesOf, propertyBag) {
        var stubbedDescriptor=Stubs.GetObject({getQualifiedName:function(){return descriptor;}});
        var stubbedAttributeDefs=Stubs.GetList(attributes&&Object.keys(attributes)||[], {each:function(value){return this.Source_Value;}});
        return Stubs.GetObject({
            getAttributeDefs:{returnValue:stubbedAttributeDefs},
            getDescriptor:{returnValue:stubbedDescriptor},
            isInstanceOf:function(instance){ return instancesOf && instance in instancesOf; }
        }, propertyBag||{});
    };

    this.GetContext = function(){
        return Stubs.GetObject({
           setCurrentAccess: function(){},
           releaseCurrentAccess: function(){},
            joinComponentConfigs : function() {},
            finishComponentConfigs : function() {},
            getNum : function() { return 0; },
//            getAccessStackHierarchy: function() {}
        });
    };

    this.GetController=function(target){
        if(target){
            target.runAfter=Stubs.GetMethod("action",undefined);
        }
        return target;
    };

    /**
     * Get an object that acts similar to an Aura event object.
     *
     * @param {Object} [params] Params are the set of values which would be accessed via setParams() and getParams()
     */
    this.GetEvent=function(params){
        return Stubs.GetObject({
            fire:{},
            getParam:function(name){return this.params&&this.params[name];},
            getParams:function(){return this.params;},
            setParams:function(params){this.params=params;return this;}
        },{params:params||{}});
    };

}
