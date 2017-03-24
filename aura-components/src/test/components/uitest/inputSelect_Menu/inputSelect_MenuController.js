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
    init: function(cmp) {
        var opts =[
                {"label": "Option1", "value": "option1", "class": "option1-class", "selected": false},
                {"label": "Option2", "value": "option2", "class": "option2-class", "selected": true},
                {"label": "Option3", "value": "option3", "class": "option3-class", "selected": false},
                {"label": "Option4", "value": "option4", "class": "option4-class", "selected": false}
            ];

        cmp.find("inputSelectMenu").set("v.options", opts);
    },

    onChange: function(cmp) {
        var changeCounter = cmp.find("changeCounter");
        var value = changeCounter.get("v.value");
        value++;
        changeCounter.set("v.value", value);
    }
})