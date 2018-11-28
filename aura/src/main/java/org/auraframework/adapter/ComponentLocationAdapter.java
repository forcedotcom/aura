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

import java.io.File;
import java.util.HashSet;
import java.util.Set;

import org.auraframework.system.SourceLoader;

/**
 * Registers component and module source locations.
 */
public interface ComponentLocationAdapter extends AuraAdapter {
    /**
     * The 'components' directory containing component sources.
     */
    File getComponentSourceDir();

    /**
     * The path to the resource on the classpath containing component sources and pre-compiled registries.
     */
    String getComponentSourcePackage();

    /**
     * The 'modules' directory containing module sources.
     */
    File getModuleSourceDir();

    /**
     * The path to the resource on the classpath containing modules sources and pre-compiled registries.
     */
    String getModuleSourcePackage();

    /**
     * Used by StringComponentLocationAdapter. TODO remove.
     */
    Set<SourceLoader> getSourceLoaders();

    /** Default implementation for ComponentLocationAdapter */
    static class Impl implements ComponentLocationAdapter {
        private final File componentSourceDir;
        private final String componentSourcePackage;
        private final File moduleSourceDir;
        private final String moduleSourcePackage;
        private final Set<SourceLoader> loaders = new HashSet<>();

        public Impl(File componentSourceDir, String componentSourcePackage,
                File moduleSourceDir, String moduleSourcePackage) {
            this.componentSourceDir = componentSourceDir;
            this.componentSourcePackage = componentSourcePackage;
            this.moduleSourceDir = moduleSourceDir;
            this.moduleSourcePackage = moduleSourcePackage;
        }

        @Override
        public File getComponentSourceDir() {
            return componentSourceDir;
        }

        @Override
        public String getComponentSourcePackage() {
            return componentSourcePackage;
        }

        @Override
        public File getModuleSourceDir() {
            return moduleSourceDir;
        }

        @Override
        public String getModuleSourcePackage() {
            return moduleSourcePackage;
        }

        @Override
        public Set<SourceLoader> getSourceLoaders() {
            return loaders;
        }

        @Override
        public String toString() {
            StringBuffer sb = new StringBuffer();
            sb.append("ComponentLocationAdapter(CSD=");
            if (componentSourceDir != null) {
                sb.append(componentSourceDir.getPath());
            } else {
                sb.append("null");
            }
            sb.append(", CSP=");
            if (componentSourcePackage != null) {
                sb.append(componentSourcePackage);
            } else {
                sb.append("null");
            }
            sb.append("MSD=");
            if (moduleSourceDir != null) {
                sb.append(moduleSourceDir.getPath());
            } else {
                sb.append("null");
            }
            sb.append(", MSP=");
            if (moduleSourcePackage != null) {
                sb.append(moduleSourcePackage);
            } else {
                sb.append("null");
            }
            sb.append(", Loaders=");
            sb.append(loaders.toString());
            sb.append(')');
            return sb.toString();
        }
    }
}