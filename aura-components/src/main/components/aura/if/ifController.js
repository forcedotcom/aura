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
    handleTheTruth: function(cmp, evt, helper) {
        var isTrue = cmp.getValue("v.isTrue");
        var current = isTrue.unwrap();
        var previous = isTrue.getPreviousValue();
        var isReallyTrue = current === true || current === "true";
        var wasReallyTrue = previous === true || previous === "true";
        if (isReallyTrue !== wasReallyTrue) {
            // so it reallyChanged™, swap out the components and store the old ones in either _true or _false
            var realbody = cmp.getValue("v.realbody");
            var oldcmps = realbody.unwrap();
            var switchTo = "_" + isReallyTrue;
            var switchFrom = "_" + wasReallyTrue;
            cmp[switchFrom] = oldcmps;
            var newcmps = cmp[switchTo];
            // undefined means we haven't ever instantiated this facet
            if ($A.util.isUndefined(newcmps)) {
                newcmps = cmp[switchTo] = helper.createRealBody(cmp, isReallyTrue, false);
            }
            realbody.setValue(newcmps);
        }
    }
})