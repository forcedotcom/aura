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
    render : function(cmp, helper){
        var ret = this.superRender();
        var expected = eval(cmp.getAttributes().get("expected"));
        var expectedType = typeof(expected);
        if(expectedType!=="number"){
        	expected = $A.util.json.encode(expected);
        }
        var actual = cmp.getAttributes().get("expression");
        var actualType = typeof(actual);
        if(actualType!=="number"){
        	actual = $A.util.json.encode(actual);
        }
        if(actual !== expected && (!(actualType==="number" && expectedType==="number" && isNaN(actual) && isNaN(expected)))){
            return document.createTextNode("{expression:\"" + cmp.getAttributes().get("exprText") + "\", expected:" + expected + ", actual:" + actual + "}\n");
        }
        return ret;
    }
})
