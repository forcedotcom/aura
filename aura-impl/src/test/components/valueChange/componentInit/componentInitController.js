/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    componentInit:function(cmp, evt){
        //Will be used in JS test
        cmp._testCmpInitFlag = true;
        cmp._testCmpInitEvt = evt;
    },
    attributeInit:function(cmp, evt){
        cmp._testAttrInitFlag = true;
        cmp._testAtrrInitevt = evt;
    },
    facetInit:function(cmp, evt){
        cmp._testFacetFlag = true;
    },
    multipleHandlers:function(cmp, evt){
        cmp._testCmpInitMultipleFlag = true;
    }

})
