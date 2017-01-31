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
    // ls aura-resources/target/*SNAPSHOT.jar
    if(!Test.Tools.Aura.Attributes.AuraAttribute.WindowStub) {
        this.WindowStub = Test.Tools.Aura.Attributes.AuraAttribute.WindowStub = Stubs.Dom.GetWindow();
        var additionalMocks = ["File", "FileList", "CSSStyleDeclaration", "TimeRanges", "Date", "Promise", "Proxy", "MessagePort", "MessageChannel", "MessageEvent", "FormData"];
        for (var i = 0; i < additionalMocks.length; i++) {
            if (!Object.Global()[additionalMocks[i]]) {
                this.WindowStub[additionalMocks[i]] = {};
            }
        }

        Mocks.Dom.GetDom(this.WindowStub)(function () {
            Import("aura-resources/target/src-gen/main/resources/aura/javascript/aura_proddebug.js");
            $A.createComponent=Stubs.GetMethod(function(type,attributes,callback){
                callback(Stubs.Aura.GetComponent(attributes,{},{},type));
            });
        });
    }else{
        this.WindowStub=Test.Tools.Aura.Attributes.AuraAttribute.WindowStub;
    }

    this.base("Aura");
    if(!Object.IsType(Function,this.Target))throw new Error("Test.Tools.Aura.Attributes.AuraAttribute.ctor: unable to locate attribute target.");
    new xUnit.js.Attributes.MockAttribute(Mocks.Dom.GetDom(this.WindowStub));
};
Test.Tools.Aura.Attributes.AuraAttribute.Inherit(System.Script.Attributes.Attribute);


