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
    render : function(cmp, helper){
        cmp.set("v.integer", 7);
        cmp.set("v.double", 3.1);
        cmp.set("v.doubleString", "2.1");
        cmp.set("v.string", "Component");
        cmp.set("v.emptyString", "");
        cmp.set("v.Infinity", Infinity);
        cmp.set("v.NegativeInfinity", -Infinity);
        cmp.set("v.NaN", NaN);
        cmp.set("v.object", {});
        cmp.set("v.nullObj", null);
        cmp.set("v.nullList", null);
        
        cmp.get("v.listWithNull").push(null);
        cmp.get("v.listWithNull").push('a');
        
        cmp.get("v.listWithList").push(null);
        cmp.get("v.listWithList").push('a');
        cmp.get("v.listWithList").push(cmp.get("v.nullList"));
        cmp.get("v.listWithList").push('b');
        cmp.get("v.listWithList").push('c');
        
        var lst0 = [0,1];
        var lst1 = [2,3];
        lst1.push(lst0);
        var lst2 = [4,5];
        lst2.push(lst1);
        var lst3 = [6,7];
        lst3.push(lst2);
        lst3.push('b');
        cmp.set("v.listWithNested4Layers", lst3);

        
        var lst0 = [0,1]
        lst0.push(lst0);
        cmp.set("v.listWithLoop", lst0)
        

        cmp.set("v.label0", "Hello");
        cmp.set("v.label1", "Hello {0}");
        cmp.set("v.label2", "Hello {0} and {1}");

        return this.superRender();
    }
})
