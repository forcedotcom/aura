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

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.AuraHandledException;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Matchers;
import org.mockito.Mockito;

public class AuraServletUnitTest {
    private static class AuraServletOverride extends AuraServlet {
        @Override
        public void doPost(HttpServletRequest request, HttpServletResponse response) 
                throws ServletException, IOException {
            super.doPost(request, response);
        }
    }

    @Test
    public void testPostRequiresJson() throws Exception {
        AuraServletOverride underTest = new AuraServletOverride();
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);

        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        underTest.setServletUtilAdapter(servletUtilAdapter);

        ContextService contextService = Mockito.mock(ContextService.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.doReturn(context).when(contextService).getCurrentContext();
        Mockito.doReturn(Format.HTML).when(context).getFormat();
        underTest.setContextService(contextService);

        underTest.doPost(request, response);

        ArgumentCaptor<Throwable> exceptionCaptor = ArgumentCaptor.forClass(Throwable.class);

        Mockito.verify(servletUtilAdapter, Mockito.times(1)).handleServletException(exceptionCaptor.capture(),
                Matchers.eq(Boolean.FALSE), Matchers.same(context), Matchers.same(request), Matchers.same(response),
                Matchers.eq(Boolean.FALSE));
        // The exception should be handled to avoid blowing up in the face of the user.
        Assert.assertEquals(AuraHandledException.class, exceptionCaptor.getValue().getClass());
        // The text is part of our API, because it hits customers.
        Assert.assertEquals("Invalid request, post must use JSON", exceptionCaptor.getValue().getMessage());
    }
}
