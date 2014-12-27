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
    "addError": function(cmp) {
        var a = cmp.get("c.addError");
        $A.enqueueAction(a);
        //
        // FIXME:
        // I don't like this. It seems to have a delay before the text appears,
        // and that delay is such that we have to wait on the text itself. I'm
        // quite dubious of what is going on in inputRenderer.js
        //
        // We should be able to simply wait for the action complete, and see the
        // error present e.g. addWaitFor("SUCCESS", function() { return a.getState(); }, checkForText)
        // I also don't much like the way that I check for the error text
        //
        $A.test.addWaitFor(true,
            function() {
                var text = cmp.find("inputText1").getElement().innerHTML;
                return text.indexOf("m an error") > -1;
            } );
    },

    "testAddErrors": {
        "test": [ function(cmp) {
            this.addError(cmp);
        }]
    },

    "testClearErrors": {
        "test": [ function(cmp) {
            // We have to add an error before we can clear them.
            this.addError(cmp);
        }, function(cmp) {
            var a = cmp.get("c.clearErrors");
            $A.enqueueAction(a);
            $A.test.addWaitFor(true,
                function() {
                    var text = cmp.find("inputText1").getElement().innerHTML;
                    return text.indexOf("m an error") == -1;
                } );
        }]
    }
})
