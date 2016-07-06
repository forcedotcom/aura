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
package org.auraframework.http.resource;

import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

public class BootstrapTest extends UnitTestCase {
    
    /**
     * Test logic setting cache-related HTTP headers in response.
     * @throws Exception
     */
    @Test
    public void testSetCacheHeaders() throws Exception {
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);
        
        Bootstrap bootstrap = new Bootstrap();
        bootstrap.setServletUtilAdapter(servletUtilAdapter);
        
        // Public cache expiration not set, should be no cache
        Mockito.when(appDef.getBootstrapPublicCacheExpiration()).thenReturn(null);
        bootstrap.setCacheHeaders(response, appDef);
        
        Mockito.verify(servletUtilAdapter).setNoCache(Mockito.any(HttpServletResponse.class));
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
        
        // Set public cache expiration to a valid value
        Mockito.when(appDef.getBootstrapPublicCacheExpiration()).thenReturn(600);
        bootstrap.setCacheHeaders(response, appDef);
        
        Mockito.verify(servletUtilAdapter).setCacheTimeout(Mockito.any(HttpServletResponse.class), Mockito.eq(600));
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
}
