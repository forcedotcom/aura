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
package org.auraframework.impl.adapter;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.util.ServiceLoaderImpl;
import org.auraframework.util.ServiceLocator;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

/**
 * Unit tests for various service and adapter registration.
 * 
 * @see ServiceLocator
 * @see ServiceLoaderImpl
 * @see ServiceLoader
 */
public class AuraServicesAndAdaptersTest extends AuraImplTestCase {
    @UnAdaptableTest
    @Test
    public void testServicesAndAdaptersRegistered() {
        ConfigAdapter c = Aura.getConfigAdapter();
        assertNotNull(c);
        assertTrue("Expected MockConfigAdapterImpl to be registered in AuraImplTestConfig",
                c instanceof MockConfigAdapterImpl);
    }
}
