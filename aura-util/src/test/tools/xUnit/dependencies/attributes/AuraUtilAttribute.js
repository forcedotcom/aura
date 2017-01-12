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

Test.Tools.Aura.Attributes.AuraUtilAttribute=function(){
    this.base("AuraUtil");
    if(!Object.IsType(Function,this.Target))throw new Error("Test.Tools.Aura.Attributes.AuraUtilAttribute.ctor: unable to locate attribute target.");

    var $A={
        assert:function(condition,message){
            if(!condition){
                throw new Error(message);
            }
        }
    };
    var mockNamespace=Mocks.GetMock(Object.Global(),"Aura",{Context:{AuraContext:{}},Utils:{}});
    Mocks.Dom.GetDom()(function(){
        mockNamespace(function(){
            Import("aura-impl/src/main/resources/aura/polyfill/Json.js");
            Import("aura-impl/src/main/resources/aura/util/Mutex.js");
            Import("aura-impl/src/main/resources/aura/util/SecureFilters.js");
            Import("aura-impl/src/main/resources/aura/util/SizeEstimator.js");
            Import("aura-impl/src/main/resources/aura/util/Style.js");
            Import("aura-impl/src/main/resources/aura/util/Util.js");
            $A.util=new Aura.Utils.Util();
        });
    });

    var $AMock=Mocks.GetMock(Object.Global(),"$A",$A);
    new xUnit.js.Attributes.MockAttribute($AMock);
};
Test.Tools.Aura.Attributes.AuraUtilAttribute.Inherit(System.Script.Attributes.Attribute);


