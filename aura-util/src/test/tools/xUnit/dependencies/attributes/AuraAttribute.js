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
Function.RegisterNamespace("Test.Tools.Aura.Attributes");

Test.Tools.Aura.Attributes.AuraAttribute=function(){
    if(!Test.Tools.Aura.Attributes.AuraAttribute.WindowStub) {
        this.WindowStub = Test.Tools.Aura.Attributes.AuraAttribute.WindowStub = Stubs.Dom.GetWindow();
        var additionalMocks = ["File", "FileList", "CSSStyleDeclaration", "TimeRanges", "Date", "Promise", "Proxy", "MessagePort", "MessageChannel", "MessageEvent", "FormData"];
        for (var i = 0; i < additionalMocks.length; i++) {
            if (!Object.Global()[additionalMocks[i]]) {
                this.WindowStub[additionalMocks[i]] = {};
            }
        }
        Mocks.Dom.GetDom(this.WindowStub)(function () {
            Import(Test.Tools.Aura.FrameworkJs);
            $A.initAsync({context:{}});
            $A.getContext().merge({enableAccessChecks:false});
            $A.handleError=function(message){
                throw new Error(message);
            };
            $A.createComponent=Stubs.GetMethod(function(type,attributes,callback){
                var stubAttributes={};
                for(var x in attributes){
                    if(attributes.hasOwnProperty(x)){
                        stubAttributes["v."+x]=attributes[x];
                    }
                }
                callback(Stubs.Aura.GetComponent(stubAttributes,null,null,type));
            })
            // JBUCH: TODO: WOOF. FIGURE OUT WHAT IT WILL TAKE TO STAY CLOSE TO CODE HERE, AND IF IT'S WORTH IT
            // $A.createComponent=function(type,attributes,callback){
            //     var descriptor=$A.componentService.$createDescriptorConfig$(type);
            //     $A.componentService.$createComponentDef$(descriptor);
            //     $A.componentService.$addComponentClass$(descriptor.descriptor,function(config){return new $A.Component(config);});
            //     $A.componentService.createComponent(type,attributes,callback);
            // };
        });
    }else{
        this.WindowStub=Test.Tools.Aura.Attributes.AuraAttribute.WindowStub;
    }

    this.base("Aura");
    if(!Object.IsType(Function,this.Target))throw new Error("Test.Tools.Aura.Attributes.AuraAttribute.ctor: unable to locate attribute target.");
    new xUnit.js.Attributes.MockAttribute(Mocks.Dom.GetDom(this.WindowStub));
};
Test.Tools.Aura.Attributes.AuraAttribute.Inherit(System.Script.Attributes.Attribute);


