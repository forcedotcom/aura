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
package org.auraframework.util;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.test.WebDriverTestCase;

public class JsonSerializationUITest extends WebDriverTestCase {
    public JsonSerializationUITest(String name) {
        super(name);
    }

    // currently fails to parse on client because !-- gets encoded to \u0021-- which is invalid js
    public void _testJsOperationBangMinusMinus() throws Exception {
        DefDescriptor<ComponentDef> cmpdd = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "render='client'", ""));
        addSourceAutoCleanup(
                Aura.getDefinitionService().getDefDescriptor(cmpdd, DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class),
                "({countDown:function(){if(!document.counter)document.counter=3;return !--document.counter?'done':'continue'}})");
        open(cmpdd);
        assertEquals("continue",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().countDown()"));
        assertEquals("continue",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().countDown()"));
        assertEquals("done",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().countDown()"));
    }
    
    public void testJsStringBangMinusMinus() throws Exception {
        DefDescriptor<ComponentDef> cmpdd = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "render='client'", ""));
        addSourceAutoCleanup(
                Aura.getDefinitionService().getDefDescriptor(cmpdd, DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class),
                "({getComment:function(){return '<!-- inside -->'}})");
        open(cmpdd);
        assertEquals("<!-- inside -->",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().getComment()"));
    }

    // fails to match because */ gets encoded to \u002A/
    public void _testJsRegexStarSlash() throws Exception {
        DefDescriptor<ComponentDef> cmpdd = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "render='client'", ""));
        addSourceAutoCleanup(
                Aura.getDefinitionService().getDefDescriptor(cmpdd, DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class),
                "({replaceStar:function(str){return str.replace(/\\*/,'evil')}})");
        open(cmpdd);
        assertEquals("evildoer",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().replaceStar('*doer')"));
    }

    public void testJsStringStarSlash() throws Exception {
        DefDescriptor<ComponentDef> cmpdd = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "render='client'", ""));
        addSourceAutoCleanup(
                Aura.getDefinitionService().getDefDescriptor(cmpdd, DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class),
                "({getComment:function(){return '/* non-comment */'}})");
        open(cmpdd);
        assertEquals("/* non-comment */",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().getComment()"));
    }

    // W-2427098
    // causes JsonStreamParseException because the embedded quotes are read as part of a string rather than literal
    public void _testJsLiteralRegexp() throws Exception {
        DefDescriptor<ComponentDef> cmpdd = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "render='client'", ""));
        addSourceAutoCleanup(
                Aura.getDefinitionService().getDefDescriptor(cmpdd, DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class),
                "({replaceQuotes:function(str){return str.replace(/\"/g,'\\'')}})");
        open(cmpdd);
        assertEquals("'exactly'",auraUITestingUtil.getEval("return $A.getRoot().getDef().getHelper().replaceQuotes('\"exactly\"')"));
    }
}
