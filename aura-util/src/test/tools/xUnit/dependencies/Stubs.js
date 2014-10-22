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
Function.RegisterNamespace("Test.Stubs.Aura");
/*
 * Aura Stub
 */
Test.Stubs.Aura=new function(){
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
        },{auraType:"Action",callback:callback||null,params:params||{},returnValue:returnValue||{},state:state||{}});
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

    this.GetValue=function(value){
        return Stubs.GetObject({
            getValue:function(){return value;},
            setValue:function(newValue){value=newValue;},
            unwrap:function(){return value;}
        });
    };

    this.GetComponent = function (attributes, children, propertyBag, descriptor) {
        var stubbedAttributes={};
        Object.ForEach(attributes||{},function(value,context){stubbedAttributes[context.Name]=Stubs.Aura.GetValue(value);});
        var stubbedChildren={};
        Object.ForEach(children||{},function(value,context){stubbedChildren[context.Name]=value&&(Object.IsType(Stubs.Aura.GetComponent,value)||Object.IsType(Array,value))&&value||Stubs.Aura.GetComponent(value);});
        var stubbedAttributeDefs=Stubs.GetList(attributes&&Object.keys(attributes)||[], {each:function(value){return this.Source_Value;}});
        var stubbedDescriptor=Stubs.GetObject({getQualifiedName:function(){return descriptor;}});
        var stubbedDef=Stubs.GetObject({getAttributeDefs:{returnValue:stubbedAttributeDefs}, getDescriptor:stubbedDescriptor});

		var getValue = function(expression){return stubbedAttributes[expression]||Stubs.Aura.GetValue()};
		var setValue = function(expression,value){if(stubbedAttributes[expression])stubbedAttributes[expression].setValue(value);else stubbedAttributes[expression]=Stubs.Aura.GetValue(value)};

        var stub=Stubs.GetObject({
            find:function(expression){return stubbedChildren[expression];},
            get:function(expression){return stubbedAttributes[expression]&&stubbedAttributes[expression].getValue();},
            getAttributes:function(){
				return Stubs.GetObject({
					getValue:function(expression){return getValue(String.Format("v.{0}",expression))},
					setValue:function(expression,value){setValue(String.Format("v.{0}", expression),value)}
				});
			},
            getConcreteComponent:function(){return this;},
            getDef:{returnValue:stubbedDef},
            getElement:{returnValue:Stubs.Dom.GetNode()},
            getEventDispatcher:{},
            getValue:getValue,
            setValue:setValue,
            set:setValue
        },propertyBag||{});
        stub.constructor=Stubs.Aura.GetComponent;
        return stub;
    };
};

/*
 * DOM Stub
 */
Test.Stubs.Aura.Dom=new function(){
    var stubDom = this;

    this.GetNode=function(properties,attributes,childNodes,nodeName,nodeType){
        attributes=Object.Copy({},attributes||{});
        childNodes=Array.Copy(childNodes||[]);

        var node=Stubs.GetObject({
            appendChild:function(child){
                assignReferences(this.childNodes[this.childNodes.length - 1], undefined, child);
                assignReferences(child, this.childNodes[this.childNodes.length - 1], null, this);
                this.childNodes.push(child);
                resetChildPointers(this);
                return child;
            },
            blur: {},
            cloneNode: function(deep){
                return stubDom.GetNode(Object.Copy({}, this, { baseURI: 1, nodeValue: null,ownerDocument: null,textContent: ''}),attributes,deep?this.childNodes:null,this.nodeName,this.nodeType);
            },
            focus: {},
            getAttribute:function(name){return attributes[name]||null;},
            hasChildNodes:function(){return this.childNodes.length>0;},
            insertBefore: function (newElement, referenceElement) {
                if(!referenceElement)return this.appendChild(newElement);
                for(var i=0;i<this.childNodes.length;i++){
                    if(this.childNodes[i]==referenceElement){
                        assignReferences(newElement,referenceElement.previousSibling, referenceElement, this);
                        assignReferences(referenceElement,newElement);
                        this.childNodes.splice(i,0,newElement);
                        resetChildPointers(this);
                        return newElement;
                    }
                }
                throw new Error("Stubs.Dom.GetNode.insertBefore: 'referenceElement' was not found in the childNodes collection.");
            },
            removeChild:function(child){
                for (var i = 0; i < this.childNodes.length; i++) {
                    if (this.childNodes[i] == child) {
                        assignReferences(this.childNodes[i-1],undefined,this.childNodes[i+1]||null);
                        assignReferences(this.childNodes[i+1],this.childNodes[i-1]||null);
                        assignReferences(child,null,null,null);
                        this.childNodes.splice(i, 1);
                        resetChildPointers(this);
                        return child;
                    }
                }
                throw new Error("Stubs.Dom.GetNode.removeChild: 'child' was not found in the childNodes collection.");
            },
            replaceChild: function (newChild,oldChild) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    if (this.childNodes[i] == oldChild) {
                        assignReferences(this.childNodes[i - 1], undefined, newChild);
                        assignReferences(this.childNodes[i + 1], newChild);
                        assignReferences(newChild, this.childNodes[i - 1]||null, this.childNodes[i + 1]||null, this);
                        assignReferences(oldChild, null, null, null);
                        this.childNodes[i]=newChild;
                        resetChildPointers(this);
                        return oldChild;
                    }
                }
                throw new Error("Stubs.Dom.GetNode.replaceChild: 'oldChild' was not found in the childNodes collection.");
            },
            setAttribute:function(name,value){attributes[name]=value;},
            addEventListener:function(type,fn,capture){},
            removeEventListener:function(type,fn,capture){}
        },Object.Copy({
            baseURI:'',
            childNodes:childNodes,
            children:childNodes,
            firstChild:null,
            lastChild:null,
            nextSibling:null,
            nodeName:nodeName||'DIV',
            nodeType:nodeType||1,
            nodeValue:null,
            ownerDocument:null,
            parentElement: null,
            parentNode:null,
            previousSibling:null,
            textContent:''
        }, properties||{}));
        for(var i=0;i<childNodes.length;i++){
            assignReferences(childNodes[i],childNodes[i-1]||null,childNodes[i+1]||null,node);
        }
        resetChildPointers(node);
        return node;
    };

    this.GetXhr=function(response,headers,status,statusText){
        if(!response)response='';
        headers=Object.Copy({},headers||{});
        return Stubs.GetObject({
            abort:{},
            getAllResponseHeaders:function(){return headers;},
            getResponseHeader:function(header){return headers[header]||null;},
            open: function(method, url, async, user, password){
                this.readyState=1;
                if (Object.IsType(Function, this.onreadystatechange)) {
                    this.onreadystatechange();
                }
            },
            overrideMimeType:{parameters:["mimeType"]},
            send: function (data) {
                for(var i=2;i<=4;i++){
                    this.readyState = i;
                    if (Object.IsType(Function, this.onreadystatechange)) {
                        this.onreadystatechange();
                    }
                }
            },
            setRequestHeader:function(header,value){headers[header]=value;}
        }, {
            readyState: 0,
            response: response,
            responseText: response,
            responseType: '',
            responseXML: response,
            status: status||200,
            statusText: statusText||"200 OK"
        });
    }

    // Private Methods
    function assignReferences(target, previous, next, parent) {
        if (target) {
            if(previous!==undefined)target.previousSibling = previous || null;
            if(next!==undefined)target.nextSibling = next || null;
            if(parent!==undefined)target.parentNode = target.parentElement = parent || null;
            target.ownerDocument=target.parentNode && target.parentNode.ownerDocument || null;
        }
    }

    function resetChildPointers(target){
        if(target){
            target.firstChild=target.childNodes[0]||null;
            target.lastChild=target.childNodes[target.childNodes.length-1]||null;
        }
    }

}