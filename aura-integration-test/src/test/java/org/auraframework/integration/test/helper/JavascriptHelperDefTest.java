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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;
import org.auraframework.system.AuraContext;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

/**
 * Test class to verify implementation of JavascriptHelperDef.
 */
public class JavascriptHelperDefTest extends AuraImplTestCase {
    /**
     * Verify JavascriptHelperDef is non-local.
     */
    @Test
    public void testIsLocalReturnsFalse() {
        JavascriptHelperDef.Builder builder = new JavascriptHelperDef.Builder();
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        HelperDef helperDef = builder.build();
        assertFalse(helperDef.isLocal());
    }

    @Test
    public void testGetDescriptor() throws Exception {
        DefDescriptor<HelperDef> expectedHelperDesc = addSourceAutoCleanup(HelperDef.class, "({})");
        HelperDef helperDef = definitionService.getDefinition(expectedHelperDesc);

        DefDescriptor<HelperDef> actualHelperDesc = helperDef.getDescriptor();
        assertSame(expectedHelperDesc, actualHelperDesc);
    }

    @Test
    public void testSerializeJavascriptHelperDef() throws Exception {
        String helperJS =
                "({\n" +
                "    getHelp:function() {\n" +
                "        return 'simply';\n" +
                "    }\n" +
                "})\n";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJS);
        HelperDef helperDef = definitionService.getDefinition(helperDesc);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        goldFileText(helperDef.getCode());
    }
}
