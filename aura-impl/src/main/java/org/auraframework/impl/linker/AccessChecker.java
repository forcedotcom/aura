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
package org.auraframework.impl.linker;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.ParentedDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Map;

public class AccessChecker {
    private final ConfigAdapter configAdapter;

    public AccessChecker(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     *
     * @param referencingDescriptor the descriptor that has a reference to the definition
     * @param def the definition that is being referenced.
     * @param accessCheckCache the cache for messages.
     * @throws NoAccessException if access is denied.
     */
    public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def,
            Map<String,String> accessCheckCache) throws QuickFixException {
        String status = getAccessMessage(referencingDescriptor, def, accessCheckCache);
        if (status != null) {
            throw new NoAccessException(status);
        }
    }

    /**
     * Check that a referencing descriptor has access to a definition.
     *
     * @param referencingDescriptor the descriptor that has a reference to the definition
     * @param def the definition that is being referenced.
     * @param accessCheckCache the cache for messages.
     * @return true if access is granted.
     */
    public <D extends Definition> boolean checkAccess(DefDescriptor<?> referencingDescriptor, D def,
            Map<String,String> accessCheckCache) {
        return computeAccess(referencingDescriptor, def, accessCheckCache) == null;
    }

    /**
     * Check that a referencing descriptor has access to a definition and return the message if any.
     *
     * @param referencingDescriptor the descriptor that has a reference to the definition
     * @param def the definition that is being referenced.
     * @param accessCheckCache the cache for messages.
     * @return the message that should be given back to the user, or null if access is granted.
     */
    public <D extends Definition> String getAccessMessage(DefDescriptor<?> referencingDescriptor, D def,
            Map<String,String> accessCheckCache) {
        String status = computeAccess(referencingDescriptor, def, accessCheckCache);
        if (status == null || !configAdapter.isProduction()) {
            return status;
        }
        return DefinitionNotFoundException.getMessage(def.getDescriptor().getDefType(),
                def.getDescriptor().getName());
    }

    /**
     * Internal routine to compute access messages.
     */
    private <D extends Definition> String computeAccess(DefDescriptor<?> referencingDescriptor, D def, Map<String,String> accessCheckCache) {
        if (def == null) {
            return null;
        }

        // If the def is access="global" or does not require authentication then anyone can see it
        DefinitionAccess access = def.getAccess();
        if (access == null) {
            throw new RuntimeException("Missing access declaration for " + def.getDescriptor()
                    + " of type "+def.getClass().getSimpleName());
        }

        DefDescriptor<?> desc = def.getDescriptor();

        if (desc.getDefType() == DefType.MODULE) {
            return computeModuleAccess(referencingDescriptor, (ModuleDef) def);
        }

        if (access.isGlobal() || !access.requiresAuthentication()) {
            return null;
        }
        if (access.isPrivate()) {
            // make sure private is really private.
            if (desc.equals(referencingDescriptor)) {
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
            DefDescriptor<?> parentDescriptor = parentedDef.getParentDescriptor();
            namespace = parentDescriptor.getNamespace();
            target = String.format("%s:%s.%s", namespace, parentDescriptor.getName(), desc.getName());
        } else {
            namespace = desc.getNamespace();
            target = String.format("%s:%s", namespace, desc.getName());
        }

        // Cache key is of the form "referencingNamespace>defNamespace:defName[.subDefName].defTypeOrdinal"
        DefType defType = desc.getDefType();
        String key = String.format("%s>%s.%d", referencingNamespace == null ? "" : referencingNamespace, target,
                defType.ordinal());

        String status = null;
        if (accessCheckCache != null) {
            status = accessCheckCache.get(key);
        }

        if (status == null) {
            // System.out.printf("** MDR.miss.assertAccess() cache miss for: %s\n", key);
            // We may re-enter this code, but only in race conditions. We should generate the
            // same string, and the only way to protect against this is to lock it.

            if (!configAdapter.isUnsecuredNamespace(namespace)
                    && !configAdapter.isUnsecuredPrefix(desc.getPrefix())) {
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

        if (status.isEmpty()) {
            return null;
        }

        if (!configAdapter.isProduction()) {
            return status;
        }

        return DefinitionNotFoundException.getMessage(def.getDescriptor().getDefType(), def.getDescriptor().getName());
    }

    /**
     * Computes access for modules
     *
     * @param referencingDescriptor used by
     * @param def module to be used
     * @return null for access or String error message
     */
    private String computeModuleAccess(DefDescriptor<?> referencingDescriptor, ModuleDef def) {
        DefDescriptor<?> desc = def.getDescriptor();
        String targetNamespace = desc.getNamespace();
        String targetName = desc.getName();
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
                if (!isReferencingInternal && configAdapter.isAllowedModule(targetNamespace, targetName) && def.getMinVersion() != null) {
                    // not internal namespace && namespace allowed to be used externally && module has minVersion
                    return null;
                }
            }
            from = " from " + referencingNamespace + ":" + referencingDescriptor.getName();
        }
        return "Access to MODULE " + targetNamespace + ":" + targetName + " is not allowed" + from;
    }
}
