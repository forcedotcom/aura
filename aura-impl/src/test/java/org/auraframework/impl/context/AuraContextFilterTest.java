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
package org.auraframework.impl.context;

import com.google.common.collect.ImmutableList;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.http.AuraContextFilter;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Vector;

public class AuraContextFilterTest extends AuraTestCase {
    @Inject
    private ContextService contextService;

    @Inject
    private LoggingService loggingService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private LocalizationAdapter localizationAdapter;

    private void assertContextPath(AuraContextFilter filter, HttpServletRequest mock, String input, String expected)
            throws Exception {
        Mockito.when(mock.getContextPath()).thenReturn(input);
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", mock, null, null);
        assertEquals(expected, context.getContextPath());
        AuraPrivateAccessor.invoke(filter, "endContext");
    }

    @Test
    public void testStartContextContextPath() throws Exception {
    	System.out.println(definitionService.hashCode());
        AuraContextFilter filter = new AuraContextFilter();
        filter.setContextService(contextService);
        filter.setLoggingService(loggingService);
        filter.setDefinitionService(definitionService);
        filter.setConfigAdapter(configAdapter);
        filter.setLocalizationAdapter(localizationAdapter);
        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(filter);
        HttpServletRequest mock = Mockito.mock(HttpServletRequest.class);
        Mockito.when(mock.getLocales()).thenReturn(new Vector<>(ImmutableList.of(Locale.ENGLISH)).elements());

        assertContextPath(filter, mock, "/something", "/something");
        assertContextPath(filter, mock, "/", "");
        assertContextPath(filter, mock, "", "");
    }
}
