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
/**
 * Maps java types to and from javascript types to run csslint in rhino through
 * the java.script APIs which do not offer access to the js object
 * implementations/factory methods that Rhino's API does.
 * 
 * @param source
 *            the .css source to check
 * @param disableRulesForAura
 *            if true disables rules that generate bogus errors for Aura css
 *            files
 * @returns A java Map[] of error messages or an empty array.
 */
var csslintHelper = function(source, disableRulesForAura) {

    var ruleset = CSSLint.getRuleset();
    if (disableRulesForAura) {
        // disable same rules as in app/main/core/build/.csslintrc
        // --ignore=box-model,display-property-grouping,known-properties,adjoining-classes,font-faces,floats,font-sizes,ids,qualified-headings,unique-headings,import
        ruleset['box-model'] = false;
        ruleset['display-property-grouping'] = false;
        ruleset['known-properties'] = false;
        ruleset['adjoining-classes'] = false;
        ruleset['font-faces'] = false;
        ruleset['floats'] = false;
        ruleset['font-sizes'] = false;
        ruleset['ids'] = false;
        ruleset['qualified-headings'] = false;
        ruleset['unique-headings'] = false;
        ruleset['import'] = false;
    }

    var result = CSSLint.verify(source, ruleset);
    var jsErrors = result.messages;

    var javaErrors = new java.util.ArrayList();
    for (var i = 0; i < jsErrors.length; i++) {
        var jsError = jsErrors[i];
        if (jsError) {
            var javaError = new java.util.HashMap();
            javaError.put("line", jsError.line);
            javaError.put("startColumn", jsError.col);
            javaError.put("message", jsError.message);
            javaError.put("evidence", jsError.evidence);
            javaError.put("level", jsError.type);
            javaError.put("rule", jsError.rule.id);
            javaErrors.add(javaError);
        }
    }

    return javaErrors;
};
