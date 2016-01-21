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
    press: function(cmp) {
        cmp.find("toggle").get("e.press").fire();
    },
    getMessage: function(cmp) {
        return $A.util.getText(cmp.find("message").getElement()).trim();
    },
    testAttributeChange: {
        test: [
            function(cmp){
                $A.test.assertEquals("Now you see me.", this.getMessage(cmp), "initial mesage invalid");
                this.press(cmp);
            },
            function(cmp){
                $A.test.assertEquals("(now you don't!)", this.getMessage(cmp), "2nd mesage invalid");
                this.press(cmp);
            },
            function(cmp){
                $A.test.assertEquals("Now you see me.", this.getMessage(cmp), "3rd mesage invalid");
                this.press(cmp);
            },
            function(cmp){
                $A.test.assertEquals("(now you don't!)", this.getMessage(cmp), "4th mesage invalid");
                this.press(cmp);
            },
            function(cmp){
                $A.test.assertEquals("Stop pressing that button!", this.getMessage(cmp), "Final message invalid");
            }
        ]
    }
})
