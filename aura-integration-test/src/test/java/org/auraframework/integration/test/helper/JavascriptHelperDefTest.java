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
package org.auraframework.integration.test.helper;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;

/**
 * Test class to verify implementation of JavascriptHelperDef.
 */
public class JavascriptHelperDefTest extends AuraImplTestCase {
    public JavascriptHelperDefTest(String name) {
        super(name);
    }

    /**
     * Verify JavascriptHelperDef is non-local.
     */
    public void testIsLocalReturnsFalse() {
        HelperDef helperDef =  (new JavascriptHelperDef.Builder()).build();
        assertFalse(helperDef.isLocal());
    }

    public void testGetDescriptor() throws Exception {
        DefDescriptor<HelperDef> expectedHelperDesc = addSourceAutoCleanup(HelperDef.class, "({})");
        HelperDef helperDef = Aura.getDefinitionService().getDefinition(expectedHelperDesc);

        DefDescriptor<HelperDef> actualHelperDesc = helperDef.getDescriptor();
        assertSame(expectedHelperDesc, actualHelperDesc);
    }

    public void testSerializeJavascriptHelperDef() throws Exception {
        String helperJS =
                "({\n" +
                "    getHelp:function() {\n" +
                "        return 'simply';\n" +
                "    }\n" +
                "})\n";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJS);
        HelperDef helperDef = helperDesc.getDef();

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        this.serializeAndGoldFile(helperDef, "_JSHelperDef");
    }
}
