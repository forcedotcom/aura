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
package org.auraframework.impl.system;

import java.io.StringWriter;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.RenderContext;
import org.junit.Test;

public class RenderContextImplTest extends AuraImplTestCase{

    @Test
    public void testGetCurrentReturnsStandardByDefault() {
        StringWriter standard = new StringWriter();
        RenderContext renderContext = new RenderContextImpl(standard, null);

        Appendable actual = renderContext.getCurrent();
        assertSame(standard, actual);
    }

    @Test
    public void testPushScriptSwithCurrentToScript() {
        //can't compare getCurrent to script as it's now buffered. Instead, make sure buffer switch happened
        StringWriter script = new StringWriter();
        StringWriter standard = new StringWriter();
        RenderContext renderContext = new RenderContextImpl(standard, script);

        renderContext.pushScript();

        Appendable actual = renderContext.getCurrent();
        assertNotSame(standard, actual);
    }

    @Test
    public void testPopScriptSwitchCurrentToStandard() {
        StringWriter standard = new StringWriter();
        StringWriter script = new StringWriter();
        RenderContext renderContext = new RenderContextImpl(standard, script);
        renderContext.pushScript();

        renderContext.popScript();

        Appendable actual = renderContext.getCurrent();
        assertSame(standard, actual);
    }

    @Test
    public void testGetStandardRetunsStandardContent() throws Exception {
        String expected = "standard content";
        StringWriter standard = new StringWriter();
        RenderContext renderContext = new RenderContextImpl(standard, null);

        Appendable current = renderContext.getCurrent();
        current.append(expected);

        String actual = renderContext.getStandard();
        assertEquals(expected, actual);
    }

    @Test
    public void testGetStandardWhenStandardIsNull() throws Exception {
        RenderContext renderContext = new RenderContextImpl(null, null);
        String actual = renderContext.getStandard();
        assertNull(actual);
    }

    @Test
    public void testGetScriptReturnsScriptContent() throws Exception {
        String expected = "script content";
        StringWriter script = new StringWriter();
        RenderContext renderContext = new RenderContextImpl(null, script);

        renderContext.pushScript();
        Appendable current = renderContext.getCurrent();
        current.append(expected);

        String actual = renderContext.getScript();
        assertEquals(expected, actual);
    }

    @Test
    public void testGetScriptReturnsScriptContentWhenCurrentIsStandard() {
        String expected = "script content";
        StringWriter script = new StringWriter();
        script.append(expected);
        // current is standard by default
        RenderContext renderContext = new RenderContextImpl(null, script);

        String actual = renderContext.getScript();
        assertEquals(expected, actual);
    }

    @Test
    public void testGetScriptWhenScriptIsNull() throws Exception {
        RenderContext renderContext = new RenderContextImpl(null, null);
        String actual = renderContext.getScript();
        assertNull(actual);
    }

    @Test
    public void testExceptionIsThrownWhenPopScriptMoreThanPush() {
        StringWriter script = new StringWriter();
        RenderContext renderContext = new RenderContextImpl(null, script);

        try {
            renderContext.popScript();
        } catch(Exception e) {
            String expectedMessage = "Script popped too many times";
            this.checkExceptionFull(e, RuntimeException.class, expectedMessage);
        }

    }
}
