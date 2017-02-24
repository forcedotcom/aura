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
    doInit: function (cmp) {
        var timezone = cmp.get("v.timezone");
        if ($A.util.isEmpty(timezone)) {
            cmp.set("v.timezone", $A.get("$Locale.timezone"));
        }

        // On android If you select the date and press the done button, a 'change' will be fired.
        // But the input still has focus so 'blur' will fire after you touched something else.
        // iOS does the opposite, when you change anything with the wheels, a 'change' will be fired.
        // As soon as you press the done button, a 'blur' event will fire.
        if ($A.get("$Browser.isAndroid")) {
            cmp.set('v.updateOn', 'change');
        }
    }
});
