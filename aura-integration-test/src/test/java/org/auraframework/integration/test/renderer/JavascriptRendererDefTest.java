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
package org.auraframework.integration.test.renderer;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef;
import org.auraframework.instance.RendererInstance;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

/**
 * Test class to verify implementation of JavascriptRendererDef.
 */
public class JavascriptRendererDefTest extends AuraImplTestCase {
    @Inject
    InstanceService instanceService;

    /**
     * Verify JavascriptRendererDef is non-local.
     */
    @Test
    public void testIsLocalReturnsFalse() {
        JavascriptRendererDef.Builder builder = new JavascriptRendererDef.Builder();
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        RendererDef rendererDef = builder.build();
        assertFalse(rendererDef.isLocal());
    }

    @Test
    public void testGetDescriptor() throws Exception {
        DefDescriptor<RendererDef> expectedRendererDesc = addSourceAutoCleanup(RendererDef.class, "({})");
        RendererDef rendererDef = definitionService.getDefinition(expectedRendererDesc);

        DefDescriptor<RendererDef> actualRendererDesc = rendererDef.getDescriptor();
        assertSame(expectedRendererDesc, actualRendererDesc);
    }

    /**
     * Verify AuraRuntimeException is thrown when trying to retrieve a renderer instance for a JavascriptRendererDefinition
     */
    @Test
    public void testThrownExceptionWhenUsingJSRendererLocally() throws Exception {
        JavascriptRendererDef.Builder builder = new JavascriptRendererDef.Builder();
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        RendererDef rendererDef = builder.build();
        try {
            RendererInstance renderer = instanceService.getInstance(rendererDef);
            fail("AuraRuntimeException should be thrown when trying to create a javascript renderer client render() in local. renderer=" + renderer);
        } catch (Exception ex) {
            checkExceptionFull(ex, AuraRuntimeException.class, "Instances of class org.auraframework.impl.javascript.renderer.JavascriptRendererDef cannot be created.");
        }
    }

    @Test
    public void testSerializeJavascriptRendererDef() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function(cmp) {},\n" +
                "    afterRender: function() {},\n" +
                "    rerender: function() {},\n"+
                "    unrender: function() {}\n" +
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        RendererDef rendererDef = definitionService.getDefinition(rendererDesc);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        goldFileText(rendererDef.getCode());
    }

    @Test
    public void testSerializeJavascriptRendererDefHasNoFunction() throws Exception {
        String rendererJs = "({ })";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        RendererDef rendererDef = definitionService.getDefinition(rendererDesc);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        goldFileText(rendererDef.getCode() != null ? rendererDef.getCode() : "");
    }
}
