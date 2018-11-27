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

(function (){
    var VAR_BEGINNING = 'var(--';
    var pattern = /var\(--lwc\w*(.*?)\)/g;

    function processInContext(css, start, delimiter) {
        while( start++ && start < css.length) {
            if(css[start] === delimiter) {
                return start;
            }
        }
    }

    function findVarEnd (css) {
        for(var idx = VAR_BEGINNING.length; idx < css.length; idx++) {
            switch(css[idx]) {
                case '\'':
                    idx = processInContext(css, idx, '\'');
                    break;
                case '"':
                    idx = processInContext(css, idx, '"');
                    break;
                case '(':
                    idx = processInContext(css, idx, ')');
                    break;
                case ')':
                    //end of var
                    return idx + 1;
                default:
                //continue
            }
        }
    }

    function extractValue(declaration, lookup) {
        var parts = declaration.split(',');
        // try to get value from the lookup
        if(lookup) {
            var match = /var\(--(.*)(?:$|\))/.exec(parts[0]);
            if(match && match.length > 1) {
                var value = lookup[match[1]];
                if(value) {
                    return value;
                }

            }
        }
        // get hard coded fallback value
        if(parts.length > 1) {
            var val = declaration.substring(declaration.indexOf(',') + 1);
            return val.substring(0, val.length-1);
        }
    }

    function replaceCssVars(css, varLookup) {
        var startIndex = 0;
        var output = [];
        var result;
        while ( (result = pattern.exec(css)) ) {

            output.push(css.substring(startIndex, result.index));
            startIndex = result.index;

            var endIndex = startIndex + findVarEnd(css.substring(startIndex));
            var declaration = css.substring(startIndex, endIndex);
            var value = extractValue(declaration, varLookup);

            if(value) {
                output.push(value);
            } else {
                output.push(declaration);
            }
            startIndex = endIndex;
        }

        if(startIndex === 0) {
            return css;
        }

        output.push(css.substring(startIndex));

        return output.join('');
    }

    Aura.polyfillCssVars = replaceCssVars;
}());

