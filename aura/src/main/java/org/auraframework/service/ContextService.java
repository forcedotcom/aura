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
package org.auraframework.service;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;

import com.google.common.collect.ImmutableMap;

/**
 * <p>
 * Service for creating or interacting with a {@link AuraContext} A AuraContext
 * must be started before working using any other service.
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface ContextService extends AuraService {

    /**
     * Start a AuraContext with the given Mode, Format, and Access
     */
    AuraContext startContext(Mode mode, Format format, Authentication access, DefDescriptor<? extends BaseComponentDef> appDesc);

    /**
     * Start a AuraContext with the given Mode, Format, and Access
     */
    AuraContext startContext(Mode mode, Format format, Authentication access);

    /**
     * Start a AuraContext with the given Mode, SourceLoaders, Format, and Access, GlobalValueProviders, Descriptor
     */
    AuraContext startContext(Mode mode, Format format, Authentication access,
                             Map<String, GlobalValueProvider> globalValueProviders,
                             DefDescriptor<? extends BaseComponentDef> appDesc);

    /**
     * Start a minimal aura context (no global value providers).
     */
    AuraContext startContextNoGVP(Mode mode, Format format, Authentication access,
                                 DefDescriptor<? extends BaseComponentDef> appDesc);
    /**
     * Close the current AuraContext, no matter which type it is.
     */
    void endContext();

    /**
     * Push a 'system-only' context used for private rendering.
     *
     * This call may only be used once a context has been established. Once you push the
     * server context, you must always popServerContext(). (i.e. with a try {} finally {}.
     * Anything done within the system context will not be serialized to the client.
     *
     * @return the system context in force.
     */
    AuraContext pushSystemContext();

    /**
     * Pop a system context previously pushed.
     */
    void popSystemContext();

    /**
     * Get the current context if there is one. Throws a runtime exception if
     * one is not established.
     */
    AuraContext getCurrentContext();

    /**
     * Check if there is there a {@link AuraContext} currently established
     */
    boolean isEstablished();

    /**
     * Throw a RuntimeException if no context is currently established.
     */
    void assertEstablished();
    
    /**
     * @register a Global value to be managed by the context.  
     * This mechanism is both valuable and expensive.  $Global can 
     * retrieve the managed value and set change-handlers for it.
     * However, the cost is that - even if not set - the name, value, and default 
     * of this item is sent on every Aura message.
     * Non-registered names will throw  
     * Registered names will never return null unless that is the defined default.
     */
    void registerGlobal(String approvedName, boolean publicallyWritable, Object defaultValue);
    
    ImmutableMap<String, AuraContext.GlobalValue> getAllowedGlobals(); 
}
