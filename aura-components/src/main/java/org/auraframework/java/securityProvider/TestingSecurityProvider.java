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
package org.auraframework.java.securityProvider;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SecurityProvider;
import org.auraframework.system.AuraContext;

/**
 * Allows applications started in production mode with context mode set to anything besides PROD access.
 */
public class TestingSecurityProvider implements SecurityProvider {
    @Override
    public boolean isAllowed(DefDescriptor<?> descriptor) {
        if (!Aura.getConfigAdapter().isProduction() ||
                Aura.getContextService().getCurrentContext().getMode() != AuraContext.Mode.PROD ) {
            return true;
        }
        return false;
    }
}
