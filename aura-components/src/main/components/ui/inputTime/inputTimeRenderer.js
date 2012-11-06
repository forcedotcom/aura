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
    render: function(component) {
    var test = document.createElement("input");
    test.setAttribute("type", "time");
    if (test.type == "text") {
        // No native time picker support :(
        // Create a fallback implementation here and return that.
        // then dynamically replace that <input> element.
        var fallback = document.createElement("span");
        fallback.appendChild(document.createTextNode("This browser does not support native time inputs.  TODO: create a better fallback than this."));
        return fallback;
    } else {
        return this.superRender();
    }
    }
})
