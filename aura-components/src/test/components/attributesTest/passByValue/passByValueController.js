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
    init:function(component){
    	//setting value here won't make into markup where it reference the value with #.
        component.set("v.initValue","value from init method");
        //var mp = component.get("v.mapValue");
        //component.set("v.mapValue", mp);
    },

    changeProperties:function(component){
        component.set("v.initValue","CHANGED init value");
        component.set("v.booleanValue",false);
        component.set("v.numberValue","8335");
        component.set("v.stringValue","CHANGED string value");
    },
    
    handleMapValueChangeEvent: function(component) {
    	component.set("v.changeEventTriggered", true);
    }
})