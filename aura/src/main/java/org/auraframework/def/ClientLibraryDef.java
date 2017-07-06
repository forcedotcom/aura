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
package org.auraframework.def;

import java.util.Set;

import org.auraframework.system.AuraContext;

/**
 * client library (CSS JS) include for component or application
 */
public interface ClientLibraryDef extends Definition {

    public static enum Type {
        CSS, JS
    }

    @Override
    DefDescriptor<ClientLibraryDef> getDescriptor();

    DefDescriptor<? extends RootDefinition> getParentDescriptor();

    /**
     * Name specified for this client library. Also, considered the group name
     * @return library name
     */
    String getLibraryName();

    /**
     * Either CSS or JS
     * @return library type
     */
    Type getType();

    /**
     * Modes specified. None specified means all modes.
     * @return modes
     */
    Set<AuraContext.Mode> getModes();

    /**
     * Should this clientLibrary be included in the apps prefetch
     * @return
     */
    boolean shouldPrefetch();
    
    /**
     * Determines whether library should be included for mode. Compares modes specified
     *
     * @param mode aura mode
     * @return true if should be included with mode
     */
    boolean shouldInclude(AuraContext.Mode mode);

    /**
     * Determines whether library should be included for mode and type.
     *
     * @param mode aura mode
     * @param type CSS or JS
     * @return true if should be included with mode and type
     */
    boolean shouldInclude(AuraContext.Mode mode, Type type);

    /**
     * Whether its the same client library def with differing modes
     *
     * @param clientLibraryDef
     * @return true if same client library def with differing modes
     */
    boolean equalsIgnoreModes(ClientLibraryDef clientLibraryDef);
    
}
