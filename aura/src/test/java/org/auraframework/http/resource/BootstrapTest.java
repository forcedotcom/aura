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
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

public class BootstrapTest extends UnitTestCase {
	@Test
    public void testName() {
        assertEquals("bootstrap.js", new Bootstrap().getName());
    }

    @Test
    public void testFormat() {
        assertEquals(Format.JS, new Bootstrap().getFormat());
    }

    @Test
    public void testPublicCacheExpirationNotSet() throws Exception {
        verifyCacheHeaders(null, false);
    }

    @Test
    public void testPublicCacheExpirationZero() throws Exception {
        verifyCacheHeaders(0, false);
    }

    @Test
    public void testPublicCacheExpirationValidValue() throws Exception {
        verifyCacheHeaders(600, true);
    }


    /**
     * Verify logic setting cache-related HTTP headers in response.
     * @param expirationSetting expiration setting on the app definition
     * @param shouldCache expect there is caching based on expiration setting. false means there should be no cache.
     * @throws Exception
     */
    private void verifyCacheHeaders(Integer expirationSetting, boolean shouldCache) throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<ApplicationDef> appDefDesc = Mockito.mock(DefDescriptor.class);
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);

        Bootstrap bootstrap = new Bootstrap();
        bootstrap.setServletUtilAdapter(servletUtilAdapter);

        Mockito.when(appDefDesc.getDefType()).thenReturn(DefType.APPLICATION);
        Mockito.when(appDefDesc.getDef()).thenReturn(appDef);

        // Public cache expiration not set, should be no cache
        Mockito.when(appDef.getBootstrapPublicCacheExpiration()).thenReturn(expirationSetting);
        bootstrap.setCacheHeaders(response, appDefDesc);

        if (shouldCache) {
            Mockito.verify(servletUtilAdapter).setCacheTimeout(Mockito.any(HttpServletResponse.class),
                    Mockito.eq(expirationSetting.longValue() * 1000));
        } else {
            Mockito.verify(servletUtilAdapter).setNoCache(Mockito.any(HttpServletResponse.class));
        }
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
}
