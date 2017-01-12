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
            getDef:{returnValue:{}},
            getError:{},
            getParam:function(name){return this.params&&this.params[name];},
            getParams:function(){return this.params;},
            getReturnValue:function(){return this.returnValue;},
            getState:function(){return this.state;},
            getStorage:{returnValue:{}},
            run:{parameters:["evt"]},
            runAfter:{parameters:["action"]},
			setAbortable: {},
			setStorable: {},
            setCallback:function(scope,callback,name){this.callback=callback;},
            setParams:function(params){this.params=params;},
            toJSON:function(){return {id:this.id,descriptor:{},params:this.params}}
        },{callback:callback||null,params:params||{},returnValue:returnValue||{},state:state||{}});
    };

    this.GetController=function(target){
        if(target){
            target.runAfter=Stubs.GetMethod("action",undefined);
        }
        return target;
    }

    this.GetEvent=function(params){
        return Stubs.GetObject({
            fire:{},
            getParam:function(name){return this.params&&this.params[name];},
            getParams:function(){return this.params;},
            setParams:function(params){this.params=params;return this;}
        },{params:params||{}});
    };

    this.GetComponent = function (attributes, children, propertyBag, descriptor) {
        var stubbedAttributes={};
        Object.ForEach(attributes||{},function(value,context){stubbedAttributes[context.Name]=value;});
        var stubbedChildren={};
        Object.ForEach(children||{},function(value,context){stubbedChildren[context.Name]=value&&(Object.IsType(_stubAura.GetComponent,value)||Object.IsType(Array,value))&&value||_stubAura.GetComponent(value);});
        var stubbedAttributeDefs=Stubs.GetList(attributes&&Object.keys(attributes)||[], {each:function(value){return this.Source_Value;}});
        var stubbedDescriptor=Stubs.GetObject({getQualifiedName:function(){return descriptor;}});
        var stubbedDef=Stubs.GetObject({getAttributeDefs:{returnValue:stubbedAttributeDefs}, getDescriptor:stubbedDescriptor});

		var get = function(expression){return stubbedAttributes[expression]};
		var set = function(expression,value){if(stubbedAttributes[expression])stubbedAttributes[expression]=value;else stubbedAttributes[expression]=value};

        var stub=Stubs.GetObject({
            find:function(expression){return stubbedChildren[expression];},
            get:function(expression){return stubbedAttributes[expression]&&stubbedAttributes[expression];},
            getConcreteComponent:function(){return this;},
            getDef:{returnValue:stubbedDef},
            getElement:{returnValue:Stubs.Dom.GetNode()},
            getEventDispatcher:{},
            get:get,
            set:set
        },propertyBag||{});
        stub.constructor=_stubAura.GetComponent;
        return stub;
    };

    this.GetComponentDef = function(descriptor) {
        return Stubs.GetObject({
            descriptor: Stubs.GetObject({
                getQualifiedName: function() { return descriptor; }
            })
        });
    };

    this.GetContext = function(){
        return Stubs.GetObject({
            setCurrentAccess: function(){},
            releaseCurrentAccess: function(){},
            joinComponentConfigs : function() {},
            finishComponentConfigs : function() {},
            getNum : function() { return 0; }
        });
    };
};