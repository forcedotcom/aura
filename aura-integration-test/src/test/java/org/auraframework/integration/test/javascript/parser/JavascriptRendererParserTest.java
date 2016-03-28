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

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.parser.JavascriptRendererParser;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.util.json.JsonEncoder;

public class JavascriptRendererParserTest extends AuraImplTestCase {
    public JavascriptRendererParserTest(String name) {
        super(name);
    }

    /**
     * Verify JavascriptRendererParser can parse normal JavaScript Renderer.
     */
    public void testParseNormalJSRenderer() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function() {\n" +
                "        var str = 'do Nothing';\n" +
                "    },\n" +
                "    rerender:function() {}\n" +
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = StringSourceLoader.getInstance().getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        rendererDef.validateDefinition();
    }

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
        Source<RendererDef> source = StringSourceLoader.getInstance().getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        rendererDef.validateDefinition();
    }

    /**
     * Verify when there are duplicate render functions, only keep the one.
     */
    public void testParseJSRendererWithDuplicateFunction() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function(cmp) {var v = 1;},\n" +
                "    render: function(cmp) {var v = 2;}\n" +
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = StringSourceLoader.getInstance().getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);

        assertThat(rendererDef, instanceOf(JavascriptRendererDef.class));
        rendererDef.validateDefinition();

        String jsonStr = JsonEncoder.serialize(rendererDef);
        assertEquals("The latest function should survive.", "{\"render\":function(cmp) {var v = 2;}}", jsonStr);
    }

    public void testParseJSRendererWithNonRendererFunctionElements() throws Exception {
        String rendererJs =
                "({\n" +
                "    render: function(cmp) {var v = 1;},\n" +
                "    foo: 'do NOthing',\n"+
                "    bar: function(cmp) {var v = 2;}\n"+
                "})";
        DefDescriptor<RendererDef> rendererDesc = addSourceAutoCleanup(RendererDef.class, rendererJs);
        Source<RendererDef> source = StringSourceLoader.getInstance().getSource(rendererDesc);

        RendererDef rendererDef = new JavascriptRendererParser().parse(rendererDesc, source);
        String jsonStr = JsonEncoder.serialize(rendererDef);
        assertEquals("Renderer parser should ignore non renderer function elements.",
                "{\"render\":function(cmp) {var v = 1;}}", jsonStr);
    }
}
