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
    doInit: function(component) {
        // set default values for initial attributes in case they weren't provided.
        var timezone = component.get("v.timezone"),
            format = component.get("v.format"),
            langLocale = component.get("v.langLocale");

        if ($A.util.isEmpty(timezone)) {
            component.set("v.timezone", $A.get("$Locale.timezone"));
        }
        if ($A.util.isEmpty(format)) {
            component.set("v.format", $A.get("$Locale.dateFormat"));
        }
        if ($A.util.isEmpty(langLocale)) {
            component.set("v.langLocale", $A.get("$Locale.langLocale"));
        }
    }
});
