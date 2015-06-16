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
    init: function(cmp, evt, helper) {
        helper.updateVersion(cmp, cmp.getVersion());
    },

    updateVersionFromGetVersionMethod: function(cmp, evt, helper) {
        helper.updateVersion(cmp, cmp.getVersion());
    },

    updateVersionByComponentValueProvider: function(cmp, evt, helper) {
        helper.updateVersion(cmp, cmp.get("version"));
    },

    updateVersionIfLargerThanOne: function(cmp, evt, helper) {
        var version = cmp.getVersion();
        if(version > 1.0) {
            helper.updateVersion(cmp, version);
        } else {
            helper.updateVersion(cmp,
                "Request version is not larger than 1.0: " + version);
        }
    },

    udpateWithBoundVersionExpression: function(cmp, evt, helper) {
        helper.updateVersion(cmp, cmp.find("boundVersionExpression").get("v.value"));
    },

    udpateWithUnboundVersionExpression: function(cmp, evt, helper) {
        helper.updateVersion(cmp, cmp.find("unboundVersionExpression").get("v.value"));
    },

    updateWithEqualsComponentExist: function(cmp, evt, helper){
        helper.updateComponentExist(cmp, !!cmp.find('equals'));
    },

    updateWithInequalityComparisonComponentExist: function(cmp, evt, helper){
        helper.updateComponentExist(cmp, !!cmp.find('inequality'));
    }
})

