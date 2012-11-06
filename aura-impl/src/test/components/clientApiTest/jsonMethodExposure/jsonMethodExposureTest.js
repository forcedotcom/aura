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
    testJsonDecodeMethodIsNotExposed : {
        test : function(cmp){
            $A.test.assertNotNull($A.util.json, "The aura client does not have access to json API.")
            $A.test.assertTrue($A.util.json.decode === undefined, "Json API should no expose the decode() method.");
        }
    },
    testJsonEncodeMethodIsExposed : {
        test : function(cmp){
            $A.test.assertNotNull($A.util.json, "The aura client does not have access to json API.")
            $A.test.assertFalse($A.util.json.encode === undefined, "Json API should expose the encode() method.");
            var map = {"1": "salesforce.com", "2": {"a": "AA"}};
            $A.test.assertEquals("{\"1\":\"salesforce.com\",\"2\":{\"a\":\"AA\"}}", $A.util.json.encode(map), "Json encode methods failed to serialize a javascript object");
        }
    }
})
