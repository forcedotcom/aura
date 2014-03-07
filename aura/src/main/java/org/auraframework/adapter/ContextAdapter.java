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
package org.auraframework.adapter;

import java.util.Map;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.util.json.JsonSerializationContext;

/**
 * context adapter for aura
 */

public interface ContextAdapter extends AuraAdapter {
    /**
     * Release a context.
     */
    void release();

    /**
     * Establish a new context.
     *
     * @param mode the mode for the context.
     * @param masterRegistry the master def registry.
     * @param defaultPrefixes
     * @param format the format expected as a result.
     * @param access the access mode for the context.
     * @param jsonContext a serialization context for serializing data.
     * @param globalProviders global value providers.
     * @param appDesc the controlling application descriptor.
     */
    AuraContext establish(Mode mode, MasterDefRegistry masterRegistry, Map<DefType, String> defaultPrefixes,
            Format format, Authentication access, JsonSerializationContext jsonContext,
            Map<ValueProviderType, GlobalValueProvider> globalProviders,
            DefDescriptor<? extends BaseComponentDef> appDesc);

    /**
     * Establish a new context.
     *
     * @param mode the mode for the context.
     * @param masterRegistry the master def registry.
     * @param defaultPrefixes
     * @param format the format expected as a result.
     * @param access the access mode for the context.
     * @param jsonContext a serialization context for serializing data.
     * @param globalProviders global value providers.
     * @param appDesc the controlling application descriptor.
     * @param isDebugToolEnabled a broken parameter that should not be here.
     */
    AuraContext establish(Mode mode, MasterDefRegistry masterRegistry, Map<DefType, String> defaultPrefixes,
            Format format, Authentication access, JsonSerializationContext jsonContext,
            Map<ValueProviderType, GlobalValueProvider> globalProviders,
            DefDescriptor<? extends BaseComponentDef> appDesc,
            boolean isDebugToolEnabled);
    
    /**
     * is a context established in this thread?.
     *
     * @return true if a context has been established.
     */
    boolean isEstablished();

    /**
     * Push a system context.
     *
     * This function is used to create a system only context to hide internal operations from
     * the wire.
     *
     * @return the new context.
     */
    AuraContext pushSystemContext();

    /**
     * Pop a system context previously pushed.
     */
    void popSystemContext();

    /**
     * Get the current aura context.
     *
     * @return the current context.
     */
    AuraContext getCurrentContext();
}
