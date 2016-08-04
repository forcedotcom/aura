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

package org.auraframework.integration.test.javascript.parser;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.parser.JavascriptRendererParser;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSourceLoader;
import org.junit.Test;

import javax.inject.Inject;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

public class JavascriptRendererParserTest extends AuraImplTestCase {
    @Inject
    StringSourceLoader loader;

    /**
     * Verify JavascriptRendererParser can parse normal JavaScript Renderer.
     */
    @Test
    public void testParseNormalJSRenderer() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function() {\n" +
                "        var str = 'do Nothing';\n" +
                "    },\n" +
                "    rerender:function() {}\n" +
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = loader.getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        rendererDef.validateDefinition();
    }

    @Test
    public void testParseJSRendererWithComments() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function() {\n" +
                "       /*Multi line Comments\n" +
                "        **/\n" +
                "        //Single line Comments\n" + 
                "        var str = 'do Nothing';\n" +
                "    },\n" +
                "    rerender:function() {}\n" +
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = loader.getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        rendererDef.validateDefinition();
    }

    /**
     * Verify when there are duplicate render functions, only keep the one.
     */
    @Test
    public void testParseJSRendererWithDuplicateFunction() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function(cmp) {var v = 1;},\n" +
                "    render: function(cmp) {var v = 2;}\n" +
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = loader.getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        rendererDef.validateDefinition();

        String code = rendererDef.getCode();
        assertEquals("The latest function should survive.", "{\n    \"render\":function(cmp) {var v = 2;}\n  }", code);
    }

    @Test
    public void testParseJSRendererWithNonRendererFunctionElements() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function(cmp) {var v = 1;},\n" +
                "    foo: 'do NOthing',\n"+
                "    bar: function(cmp) {var v = 2;}\n"+
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = loader.getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        String code = rendererDef.getCode();
        assertEquals("Renderer parser should ignore non renderer function elements.",
                "{\n    \"render\":function(cmp) {var v = 1;}\n  }", code);
    }
}
