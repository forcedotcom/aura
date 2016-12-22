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
package org.auraframework.integration.test.adapter;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.ManifestUtil;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;

public class ServletUtilAdapterImplTest extends AuraImplTestCase {

    @Inject
    private ContextService contextService;

    @Inject
    private ConfigAdapter configAdapter;
    /**
     * check manifest URL when context has no preloads.
     */
    @Test
    public void testGetManifestUrlWithoutPreloads() throws Exception {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        DefDescriptor<ApplicationDef> desc =
                definitionService.getDefDescriptor("appCache:nopreload", ApplicationDef.class);
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertTrue("The application needs to enable appcache", new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled());

        // @dval: Refactor this to make it readable...

        // ServletUtilAdapter servletUtilAdapter = new ServletUtilAdapterImpl();
        // String url = servletUtilAdapter.getManifestUrl(Aura.getContextService().getCurrentContext(), null);

        // assertEquals("/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22appCache%3Anopreload%22%2C%22test%22%3A%22org.auraframework.integration.test.adapter.ServletUtilAdapterImplTest.testGetManifestUrlWithoutPreloads%22" +
        //         getLockerServiceContextValue() + "%7D/app.manifest", url);
    }

    /**
     * check manifest URL when context has preloads.
     */
    @ThreadHostileTest("preload sensitive")
    @Test
    public void testGetManifestUrlWithPreloads() throws Exception {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        DefDescriptor<ApplicationDef> desc =
                definitionService.getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);

        // ServletUtilAdapter servletUtilAdapter = new ServletUtilAdapterImpl();
        // String url = servletUtilAdapter.getManifestUrl(Aura.getContextService().getCurrentContext(), null);

        // assertEquals("/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22appCache%3Awithpreload%22%2C%22test%22%3A%22org.auraframework.integration.test.adapter.ServletUtilAdapterImplTest.testGetManifestUrlWithPreloads%22" +
        //         getLockerServiceContextValue() + "%7D/app.manifest", url);

        // @dval: Refactor this to make it readable...
    }

//     private String getLockerServiceContextValue() {
//        String cacheBuster = configAdapter.getLockerServiceCacheBuster();
//        return cacheBuster != null ? "%2C%22ls%22%3A%22" + cacheBuster + "%22" : "";
//    }
}
