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
package org.auraframework.integration;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.AuraContext;

public interface IntegrationServiceObserver {
    /**
     * A notification that the {@link AuraContext} for this integration has been established (or an existing one was
     * properly set up).
     * <p>
     * Note that this notification occurs every time a context is started (e.g., every time
     * {@link Integration#injectComponent} is called). If your implementation is performing an operation that only needs
     * to run once, before the application is written, consider
     * {@link #beforeApplicationWritten(Integration, AuraContext)} instead.
     *
     *
     * @param integration The integration being observed.
     * @param context The {@link AuraContext} for the current integration.
     */
    void contextEstablished(Integration integration, AuraContext context);

    /**
     * A notification sent just before the application is written out.
     * <p>
     * This is useful for operations that need to run once, before the application is serialized, e.g., setting
     * {@link ThemeDef} overrides (see {@link AuraContext#appendThemeDescriptor(org.auraframework.def.DefDescriptor)}).
     *
     *
     * @param integration The integration being observed.
     * @param context The {@link AuraContext} for the current integration.
     * @param app The {@link ApplicationDef} that will be written.
     */
    void beforeApplicationWritten(Integration integration, AuraContext context, ApplicationDef app);
}
