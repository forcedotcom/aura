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
package org.auraframework.impl.util;

import java.util.EnumSet;

import org.auraframework.impl.util.TemplateUtil.Script;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.system.Client.Type;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Lists;

public class TemplateUtilTest extends UnitTestCase {

    private EnumSet<Type> LEGACY_IE = EnumSet.of(Type.IE9, Type.IE8, Type.IE7, Type.IE6);

    @Test
    public void testWriteHtmlScriptsOutputsNothingForNullScripts() throws Exception {
        TemplateUtil templateUtil = new TemplateUtil();
        AuraContext context = Mockito.mock(AuraContext.class);
        StringBuffer buffer = new StringBuffer();
        templateUtil.writeHtmlScripts(context, null, Script.SYNC, buffer);
        assertEquals(0, buffer.length());
    }

    @Test
    public void testWriteHtmlScriptsOutputsNothingForEmptyScripts() throws Exception {
        TemplateUtil templateUtil = new TemplateUtil();
        AuraContext context = Mockito.mock(AuraContext.class);
        StringBuffer buffer = new StringBuffer();
        templateUtil.writeHtmlScripts(context, Lists.newArrayList(), Script.SYNC, buffer);
        assertEquals(0, buffer.length());
    }

    @Test
    public void testWriteHtmlScriptsHasDeferForAsyncLegacyIE() throws Exception {
        TemplateUtil templateUtil = new TemplateUtil();
        AuraContext context = Mockito.mock(AuraContext.class);
        Client client = Mockito.mock(Client.class);
        Mockito.doReturn(client).when(context).getClient();

        for (Type type : LEGACY_IE) {
            Mockito.doReturn(type).when(client).getType();
            StringBuffer buffer = new StringBuffer();

            templateUtil.writeHtmlScripts(context, Lists.newArrayList("x"), Script.DEFER, buffer);

            if (!buffer.toString().contains("<script src=\"x\" defer></script>")) {
                fail(String.format("Expected 'defer' for %s: %s", type, buffer));
            }
        }
    }

    @Test
    public void testWriteHtmlScriptsHasNothingForNonAsyncLegacyIE() throws Exception {
        TemplateUtil templateUtil = new TemplateUtil();
        AuraContext context = Mockito.mock(AuraContext.class);
        Client client = Mockito.mock(Client.class);
        Mockito.doReturn(client).when(context).getClient();

        for (Type type : LEGACY_IE) {
            Mockito.doReturn(type).when(client).getType();
            StringBuffer buffer = new StringBuffer();

            templateUtil.writeHtmlScripts(context, Lists.newArrayList("x", "y"), Script.DEFER, buffer);

            if (!buffer.toString().contains("<script src=\"x\" defer></script>")
                    || !buffer.toString().contains("<script src=\"y\" defer></script>")) {
                fail(String.format("Expected undecorated scripts for %s: %s", type, buffer));
            }
        }
    }

    @Test
    public void testWriteHtmlScriptsHasNoAsyncNorDeferForDefault() throws Exception {
        TemplateUtil templateUtil = new TemplateUtil();
        AuraContext context = Mockito.mock(AuraContext.class);
        Client client = Mockito.mock(Client.class);
        Mockito.doReturn(client).when(context).getClient();

        for (Type type : EnumSet.complementOf(LEGACY_IE)) {
            Mockito.doReturn(type).when(client).getType();
            StringBuffer buffer = new StringBuffer();

            templateUtil.writeHtmlScripts(context, Lists.newArrayList("a", "b"), Script.SYNC, buffer);

            if (buffer.toString().contains(" defer>")) {
                fail(String.format("Unexpected 'async' or 'defer' for %s: %s", type, buffer));
            }
        }
    }
}
