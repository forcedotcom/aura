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
package org.auraframework.impl;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.ParentedDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

public class AccessComputer {
    private final ConfigAdapter configAdapter;

    public AccessComputer(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }
    
    public <D extends Definition> String computeAccess(DefDescriptor<?> referencingDescriptor, D def,
            Cache<String, String> accessCheckCache) {
        if (def == null) {
            return null;
        }

        // If the def is access="global" or does not require authentication then anyone can see it
        DefinitionAccess access = def.getAccess();
        if (access == null) {
            throw new RuntimeException("Missing access declaration for " + def.getDescriptor()
                    + " of type "+def.getClass().getSimpleName());
        }

        DefDescriptor<?> descriptor = def.getDescriptor();

        if (descriptor.getDefType() == DefType.MODULE) {
            return computeModuleAccess(referencingDescriptor, (ModuleDef) def);
        }

        if (access.isGlobal() || !access.requiresAuthentication()) {
            return null;
        }
        if (access.isPrivate()) {
            // make sure private is really private.
            if (descriptor.equals(referencingDescriptor)) {
                return null;
            }
        }
        String referencingNamespace = null;
        if (referencingDescriptor != null) {
            String prefix = referencingDescriptor.getPrefix();
            if (configAdapter.isUnsecuredPrefix(prefix)) {
                return null;
            }

            referencingNamespace = referencingDescriptor.getNamespace();

            // The caller is in an internal namespace let them through
            if (configAdapter.isInternalNamespace(referencingNamespace)) {
                return null;
            }

            // Both access of def and referencingNamespace are privileged so we allow
            if (access.isPrivileged() && configAdapter.isPrivilegedNamespace(referencingNamespace)) {
                return null;
            }
        }

        String namespace;
        String target;

        if (def instanceof ParentedDef) {
            ParentedDef parentedDef = (ParentedDef) def;
            DefDescriptor<? extends RootDefinition> parentDescriptor = parentedDef.getParentDescriptor();
            namespace = parentDescriptor.getNamespace();
            target = String.format("%s:%s.%s", namespace, parentDescriptor.getName(), descriptor.getName());
        } else {
            namespace = descriptor.getNamespace();
            target = String.format("%s:%s", namespace, descriptor.getName());
        }

        // Cache key is of the form "referencingNamespace>defNamespace:defName[.subDefName].defTypeOrdinal"
        DefType defType = descriptor.getDefType();
        String key = String.format("%s>%s.%d", referencingNamespace == null ? "" : referencingNamespace, target,
                defType.ordinal());

        String status = null;
        
        if (accessCheckCache != null) {
            status = accessCheckCache.getIfPresent(key);
        }
        if (status == null) {
            // System.out.printf("** MDR.miss.assertAccess() cache miss for: %s\n", key);
            // We may re-enter this code, but only in race conditions. We should generate the
            // same string, and the only way to protect against this is to lock it.

            if (!configAdapter.isUnsecuredNamespace(namespace)
                    && !configAdapter.isUnsecuredPrefix(descriptor.getPrefix())) {
                if (referencingNamespace == null || referencingNamespace.isEmpty()) {
                    status = String
                            .format("Access to %s '%s' is not allowed: referencing namespace was empty or null",
                                    defType, target);
                } else if (!referencingNamespace.equals(namespace)) {
                    // The caller and the def are not in the same namespace
                    status = String
                            .format("Access to %s '%s' with access '%s' from namespace '%s' in '%s(%s)' is not allowed",
                                    defType.toString().toLowerCase(), target, def.getAccess().toString(),
                                    referencingNamespace, referencingDescriptor, referencingDescriptor.getDefType());
                } else if (access.isPrivate()) {
                    status = String
                            .format("Access to %s '%s' with access PRIVATE from namespace '%s' in '%s(%s)' is not allowed",
                                    defType.toString().toLowerCase(), target, referencingNamespace,
                                    referencingDescriptor, referencingDescriptor.getDefType());
                }
            }
            if (status == null) {
                status = "";
            }
            if (accessCheckCache != null) {
                accessCheckCache.put(key, status);
            }
        }
        status = status.isEmpty() ? null : status;
        if (status != null && configAdapter.isProduction()) {
            status = DefinitionNotFoundException.getMessage(descriptor.getDefType(), descriptor.getName());
        }
        return status;
    }

    /**
     * Computes access for modules
     *
     * @param referencingDescriptor used by
     * @param def module to be used
     * @return null for access or String error message
     */
    public String computeModuleAccess(DefDescriptor<?> referencingDescriptor, ModuleDef def) {
        DefDescriptor<?> descriptor = def.getDescriptor();
        String targetNamespace = descriptor.getNamespace();
        DefinitionAccess access = def.getAccess();

        String aliasedTarget = configAdapter.getModuleNamespaceAliases().get(targetNamespace);

        String from = "";
        if (referencingDescriptor != null) {
            String referencingNamespace = referencingDescriptor.getNamespace();

            String alias = configAdapter.getModuleNamespaceAliases().get(referencingNamespace);
            if (referencingNamespace.equals(targetNamespace) || (alias != null && alias.equals(targetNamespace))
                    || (aliasedTarget != null && referencingNamespace.equals(aliasedTarget))) {
                // Modules from the same namespace (or alias namespace) can always access each other
                return null;
            }

            boolean isReferencingInternal = configAdapter.isInternalNamespace(referencingNamespace);

            if (access.isGlobal()) {
                // modules has global access aka expose: true
                if (isReferencingInternal) {
                    // referencing is internal namespace
                    return null;
                }
                if (!isReferencingInternal && configAdapter.isAllowedModuleNamespace(targetNamespace) && def.getMinVersion() != null) {
                    // not internal namespace && namespace allowed to be used externally && module has minVersion
                    return null;
                }
            }
            from = " from " + referencingNamespace + ":" + referencingDescriptor.getName();
        }
        if (configAdapter.isProduction()) {
            return DefinitionNotFoundException.getMessage(descriptor.getDefType(), descriptor.getName());
        } else {
            return "Access to MODULE " + targetNamespace + ":" + descriptor.getName() + " is not allowed" + from;
        }
    }
}

