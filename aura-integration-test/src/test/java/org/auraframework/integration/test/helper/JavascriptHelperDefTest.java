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

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.service.CompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.junit.Test;

/**
 * Test class to verify implementation of JavascriptHelperDef.
 */
public class JavascriptHelperDefTest extends AuraImplTestCase {
    @Inject
    CompilerService compilerService;

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
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<HelperDef> source = util.buildTextSource(util.getCustomNamespace(), HelperDef.class, "({})");
        HelperDef helperDef = compilerService.compile(source.getDescriptor(), source);

        DefDescriptor<HelperDef> actualHelperDesc = helperDef.getDescriptor();
        assertSame(source.getDescriptor(), actualHelperDesc);
    }

    @Test
    public void testSerializeJavascriptHelperDef() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<HelperDef> source = util.buildTextSource(util.getCustomNamespace(), HelperDef.class,
                "({\n"
                +"    getHelp:function() {\n"
                +"        return 'simply';\n"
                +"    }\n"
                +"})\n");
        HelperDef helperDef = compilerService.compile(source.getDescriptor(), source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        goldFileText(helperDef.getCode());
    }
}
