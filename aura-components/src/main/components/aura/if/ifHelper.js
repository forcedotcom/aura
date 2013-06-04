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
    createRealBody: function(cmp, isTrue, doForce) {
        var realbody = [];
        var atts = cmp.getAttributes();
        var facet;
        if (isTrue) {
            facet = atts.getValue("body");
            //console.log("truth " + cmp.getGlobalId());
        } else {
            facet = atts.getValue("else");
            //console.log("fiction " + cmp.getGlobalId());
        }
        var realbody = [];
        for (var i = 0, length = facet.getLength(); i < length; i++) {
            var cdr = facet.get(i);
            var cmps = $A.componentService.newComponentDeprecated(cdr, cdr.valueProvider, false, doForce);
            if ($A.util.isArray(cmps)) {
                throw new Error("foreach inside of an if doesn't work yet");
            } else {
                realbody.push(cmps);
            }
        }
        
        return realbody;
    }
})
