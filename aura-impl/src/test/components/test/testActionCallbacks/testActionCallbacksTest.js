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
    checkResult: function(cmp) {
        $A.test.addWaitFor(true, function() { return cmp.get("v.cbComplete") !== "No"; }, function() {
            $A.test.assertEquals(cmp.get("v.cbExpected"), cmp.get("v.cbResult"));
        });
    },

    testAnySuccess: {
        attributes: { cbName:"ALL", cbExpected:"SUCCESS"},
        test:function(cmp){
            cmp.find("pass").get("e.press").fire();
            this.checkResult(cmp);
        },
    },

    testAnyFailure: {
        attributes: { cbName:"ALL", cbExpected:"ERROR"},
        test:function(cmp){
            cmp.find("fail").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testSuccess: {
        attributes: { cbName:"SUCCESS", cbExpected:"SUCCESS"},
        test: function(cmp){
            cmp.find("pass").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testNoSuccess: {
        attributes: { cbName:"SUCCESS", cbExpected:"NONE"},
        test: function(cmp){
            cmp.find("fail").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testFailure: {
        attributes: { cbName:"ERROR", cbExpected:"ERROR"},
        test: function(cmp){
            cmp.find("fail").get("e.press").fire();
            this.checkResult(cmp);
        }
    },

    testNoFailure: {
        attributes: { cbName:"ERROR", cbExpected:"NONE"},
        test: function(cmp){
            cmp.find("pass").get("e.press").fire();
            this.checkResult(cmp);
        }
    }
})
