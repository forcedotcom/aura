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
    render : function(cmp){
        var ret = this.superRender();
        var element = cmp.find("span").getElement();
        var delimiter = cmp.getAttributes().getValue("delimiter").getValue();
        
        var value = cmp.getAttributes().get("value");
        if($A.util.isArray(value)){
            value = value.join(delimiter);
        }
        
        if(element.textContent !== undefined){
        	element.textContent = value;
        }
        else{
        	element.innerText = value;
        }
        return ret;
    }
})
