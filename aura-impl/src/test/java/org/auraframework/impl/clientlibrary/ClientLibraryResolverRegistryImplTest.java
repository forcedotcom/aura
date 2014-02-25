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

import org.auraframework.clientlibrary.ClientLibraryResolver;
import org.auraframework.clientlibrary.ClientLibraryResolverRegistry;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.clientlibrary.resolver.AuraResourceResolver;

public class ClientLibraryResolverRegistryImplTest extends AuraImplTestCase {

    public ClientLibraryResolverRegistryImplTest(String name) {
        super(name);
    }

    public void testRegister() {
        ClientLibraryResolverRegistry reg = ClientLibraryResolverRegistryImpl.INSTANCE;
        reg.register(null);

        ClientLibraryResolver nullValues = new ClientLibraryResolver() {
            @Override
            public String getName() {
                return null;
            }

            @Override
            public Type getType() {
                return null;
            }

            @Override
            public String getLocation() {
                return null;
            }

            @Override
            public String getUrl() {
                return null;
            }

            @Override
            public boolean canCombine() {
                return false;
            }
        };
        reg.register(nullValues);
        assertNull(reg.get(null, null));

        ClientLibraryResolver customResolver = new ClientLibraryResolver() {
            @Override
            public String getName() {
                return "Kangaroo";
            }

            @Override
            public Type getType() {
                return Type.JS;
            }

            @Override
            public String getLocation() {
                return null;
            }

            @Override
            public String getUrl() {
                return null;
            }

            @Override
            public boolean canCombine() {
                return false;
            }
        };
        assertNull(reg.get("Kangaroo", Type.JS));
        reg.register(customResolver);
        assertEquals("Could not register and look up custom resolver.", customResolver, reg.get("Kangaroo", Type.JS));

        ClientLibraryResolver overrideCustomResolver = new ClientLibraryResolver() {
            @Override
            public String getName() {
                return "Kangaroo";
            }

            @Override
            public Type getType() {
                return Type.JS;
            }

            @Override
            public String getLocation() {
                return null;
            }

            @Override
            public String getUrl() {
                return null;
            }

            @Override
            public boolean canCombine() {
                return false;
            }
        };
        reg.register(overrideCustomResolver);
        assertEquals("Could not override a ClientLibraryResolver", overrideCustomResolver, reg.get("Kangaroo", Type.JS));

    }

    public void testStandardAuraFrameworkLib() {
        assertResolvers("UIPerfCSS", Type.CSS, AuraResourceResolver.class);
        assertResolvers("UIPerf", Type.JS, AuraResourceResolver.class);
        assertResolvers("UIPerfUi", Type.JS, AuraResourceResolver.class);
        assertResolvers("CkEditor", Type.JS, AuraResourceResolver.class);
    }
    
    private void assertResolvers(String name, Type type, Class<?> expectedResolver){
        ClientLibraryResolverRegistry reg = ClientLibraryResolverRegistryImpl.INSTANCE;
        ClientLibraryResolver resolver = reg.get(name, type);
        assertNotNull("Failed to find resolver for "+name+" of type "+type.toString(), resolver);
        assertTrue(expectedResolver.isInstance(resolver));
    }
}
