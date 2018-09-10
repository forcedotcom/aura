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
package org.auraframework.impl.util;

import com.google.common.base.CaseFormat;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefDescriptorImpl;

import javax.annotation.Nonnull;

/**
 * Module definition utils
 */
public final class ModuleDefinitionUtil {

    /**
     * Converts module lower case, hyphenated name into Aura descriptor name.
     * Checks and uses existing namespace provided by ConfigAdapter
     *
     * @param moduleComponentName module component name in namespace-name format
     * @param configAdapter ConfigAdapter
     * @return Aura descriptor name
     */
    public static String convertToAuraDescriptor(String moduleComponentName, @Nonnull ConfigAdapter configAdapter) {
        String namespace = moduleComponentName.split("/")[0];
        String name = moduleComponentName.split("/")[1];
        return convertToAuraDescriptor(namespace, name, configAdapter);
    }

    /**
     * Converts module lower case, hyphenated name into Aura descriptor name.
     * Checks and uses existing namespace provided by ConfigAdapter
     *
     * @param namespace namespace
     * @param name name
     * @param configAdapter ConfigAdapter
     * @return Aura descriptor name
     */
    public static String convertToAuraDescriptor(String namespace, String name, @Nonnull ConfigAdapter configAdapter) {
        String internalNamespace = configAdapter.getInternalNamespacesMap().get(namespace.toLowerCase());
        if (internalNamespace != null) {
            namespace = internalNamespace;
        }

        return namespace + ":" + name;
    }

    /**
     * Checks file path for modules containing directory and produces module DefDescriptor.
     * Otherwise, returns null
     *
     * @param path filePath
     * @param configAdapter
     * @return module DefDescriptor or null
     */
    public static DefDescriptor<?> getModuleDescriptorFromFilePath(String path, @Nonnull ConfigAdapter configAdapter) {
        DefDescriptor<?> actual = null;
        String modulesDirName = "/modules/";
        int start = path.indexOf(modulesDirName);
        if (start != -1) {
            int nsStart = start + modulesDirName.length();
            int nsEnd = path.indexOf("/", nsStart);
            String namespace = path.substring(nsStart, nsEnd);
            String name = path.substring(nsEnd + 1, path.indexOf("/", nsEnd + 1));
            String descriptorName = convertToAuraDescriptor(namespace, name, configAdapter);
            int colon = descriptorName.indexOf(":");
            namespace = descriptorName.substring(0, colon);
            name = descriptorName.substring(colon + 1, descriptorName.length());
            actual = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, namespace, name, ModuleDef.class);
        }
        return actual;
    }
}
