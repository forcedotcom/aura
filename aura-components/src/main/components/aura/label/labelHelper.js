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
{
    tokenize : function(base, vPattern, vEndPattern) {
        var elems = [];
        var matchPos = base.search(vPattern);
        if (matchPos < 0) {
            elems.push(document.createTextNode(base));
            return elems;
        }

        while (matchPos > -1) {
            if (matchPos > 0) {
                elems.push(base.substring(0, matchPos));
            }
            base = base.substring(matchPos);
            var endPos = base.search(vEndPattern);
            if (endPos < 0) { // shouldn't happen
                return elems;
            }
            elems.push(parseInt(base.substring(1, endPos))); // for dynamically replaced variable, store it as a number which will be used as an array index
            base = base.substring(endPos + 1);
            matchPos = base.search(vPattern);
        }
        if (base && base.length > 0) {
            elems.push(base);
        }
        return elems;
    }
}
