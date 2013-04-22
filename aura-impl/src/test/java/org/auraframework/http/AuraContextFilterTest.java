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
package org.auraframework.http;

import java.util.Locale;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.system.AuraContext;
import org.auraframework.test.AuraTestCase;
import org.mockito.Mockito;

import com.google.common.collect.ImmutableList;

public class AuraContextFilterTest extends AuraTestCase {

    public AuraContextFilterTest(String name) {
        super(name);
    }

    private void assertContextPath(AuraContextFilter filter, HttpServletRequest mock, String input, String expected)
            throws Exception {
        Mockito.when(mock.getContextPath()).thenReturn(input);
        AuraContext context = filter.startContext(mock, null, null);
        assertEquals(expected, context.getContextPath());
        filter.endContext();
    }

    public void testStartContextContextPath() throws Exception {
        AuraContextFilter filter = new AuraContextFilter();
        HttpServletRequest mock = Mockito.mock(HttpServletRequest.class);
        Mockito.when(mock.getLocales()).thenReturn(new Vector<Locale>(ImmutableList.of(Locale.ENGLISH)).elements());

        assertContextPath(filter, mock, "/something", "/something");
        assertContextPath(filter, mock, "/", "");
        assertContextPath(filter, mock, "", "");
    }
}
