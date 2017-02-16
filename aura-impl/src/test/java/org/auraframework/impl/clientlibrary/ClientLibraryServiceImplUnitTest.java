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
package org.auraframework.impl.clientlibrary;

import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.NoContextException;
import org.junit.Test;

public class ClientLibraryServiceImplUnitTest extends AuraImplTestCase{

    private ClientLibraryService clientLibraryService;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        this.clientLibraryService = new ClientLibraryServiceImpl();
    }

    @Test
    public void testGetResolvedUrlWithNull() {
        assertNull(clientLibraryService.getResolvedUrl(null));
    }

    @Test
    public void testGetResolvedUrlWithClientLibraryDefHasNullName() {
        String name = null;
        ClientLibraryDef clientLibraryDef = vendor.makeClientLibraryDef(name, null, null, null, null);
        assertNull(clientLibraryService.getResolvedUrl(clientLibraryDef));
    }

    @Test
    public void testGetResolvedUrlWithClientLibraryDefHasNullType() {
        Type type = null;
        ClientLibraryDef clientLibraryDef = vendor.makeClientLibraryDef("MyLib", type, null, null, null);
        assertNull(clientLibraryService.getResolvedUrl(clientLibraryDef));
    }

    @Test
    public void testGetUrlsWithNullAuraContext() throws Exception {
        AuraContext context = null;
        try {
            clientLibraryService.getUrls(context, Type.JS);
            fail("Expected NoContextException when AuraContext is null.");
        } catch (Exception e) {
            checkExceptionFull(e, NoContextException.class, "AuraContext was not established");
        }
    }
}
