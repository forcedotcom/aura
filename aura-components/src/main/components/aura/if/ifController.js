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
    handleTheTruth: function(cmp, evt, helper) {
        var isReallyTrue = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        
        if (isReallyTrue !== cmp._wasReallyTrue) {
        	cmp._wasReallyTrue = isReallyTrue;
        	
            // so it reallyChanged™, swap out the components and store the old ones in either _true or _false
            var realbody = cmp.get("v.realbody");
            
            var switchTo = "_" + isReallyTrue;
            var switchFrom = "_" + !isReallyTrue;
            
            cmp[switchFrom] = realbody;
            
            var newcmps = cmp[switchTo];
            
            // undefined means we haven't ever instantiated this facet
            if ($A.util.isUndefined(newcmps)) {
                newcmps = cmp[switchTo] = helper.createRealBody(cmp, isReallyTrue, false);
            }
            
            cmp.setAndRelease("v.realbody", newcmps)
        }
    }
})