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

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.SourceLoader;

public interface ComponentLocationAdapter extends AuraAdapter {
    File getComponentSourceDir();

    String getComponentSourcePackage();

    String getComponentSourcePackageAlways(); // TODO rename or consolidate

    default File getModuleSourceDir() { return null; };

    default String getModuleSourcePackage() { return null; };

    default String getModuleSourcePackageAlways() {return null; }; // TODO rename or consolidate

    Set<SourceLoader> getSourceLoaders();

    @Deprecated
    default DefType type() { return DefType.COMPONENT; }; // TODO delete

    class Impl implements ComponentLocationAdapter {
        private final File componentSourceDir;
        private final String componentSourcePackage;
        private final String componentPackageAlways;
        private final File moduleSourceDir;
        private final String moduleSourcePackage;
        private final String modulePackageAlways;
        private final Set<SourceLoader> loaders = new HashSet<>();

        // TODO componentSourceDir should be nullable
        // TODO consolidate constructors
        // TODO delete javaGeneratedSourceDir params

        public Impl(File componentSourceDir) {
            this(componentSourceDir, null);
        }

        @Deprecated
        public Impl(File componentSourceDir, File javaGeneratedSourceDir) {
            this(componentSourceDir, javaGeneratedSourceDir, null);
        }

        @Deprecated
        public Impl(File componentSourceDir, File javaGeneratedSourceDir, String componentSourcePackage) {
            if (type() == DefType.MODULE) { // yucky for now, but subclasses should only reference enum value
                this.modulePackageAlways = componentSourcePackage;
                if ((componentSourceDir != null && componentSourceDir.exists()) || componentSourcePackage == null) {
                    this.moduleSourceDir = componentSourceDir;
                    this.moduleSourcePackage = null;
                } else {
                    this.moduleSourcePackage = componentSourcePackage;
                    this.moduleSourceDir = null;
                }
                this.componentSourceDir = null;
                this.componentSourcePackage = null;
                this.componentPackageAlways = null;
            } else {
                this.componentPackageAlways = componentSourcePackage;
                if ((componentSourceDir != null && componentSourceDir.exists()) || componentSourcePackage == null) {
                    this.componentSourceDir = componentSourceDir;
                    this.componentSourcePackage = null;
                } else {
                    this.componentSourcePackage = componentSourcePackage;
                    this.componentSourceDir = null;
                }
                this.moduleSourceDir = null;
                this.moduleSourcePackage = null;
                this.modulePackageAlways = null;
            }
        }

        @Deprecated
        public Impl(String componentSourcePackage) {
            if (componentSourcePackage != null && !componentSourcePackage.isEmpty()) {
                if (type() == DefType.MODULE) {
                    this.moduleSourcePackage = componentSourcePackage;
                    this.modulePackageAlways = componentSourcePackage;
                    this.componentSourcePackage = null;
                    this.componentPackageAlways = null;
                } else {
                    this.componentSourcePackage = componentSourcePackage;
                    this.componentPackageAlways = componentSourcePackage;
                    this.moduleSourcePackage = null;
                    this.modulePackageAlways = null;
                }
                this.componentSourceDir = null;
                this.moduleSourceDir = null;
            } else {
                throw new IllegalArgumentException("componentSourcePackage is null or empty: " + componentSourcePackage);
            }
        }

        @Deprecated
        public Impl(SourceLoader loader) {
            if (loader != null) {
                loaders.add(loader);
            }
            this.componentSourceDir = null;
            this.componentSourcePackage = null;
            this.componentPackageAlways = null;
            this.moduleSourceDir = null;
            this.moduleSourcePackage = null;
            this.modulePackageAlways = null;
        }

        // final constructors
        // 1) String componentSourceDir (most consumers in core use this version currently)
        // 2) File componentSourceDir, String componentSourcePackage, File moduleSourceDir, String moduleSourcePackage

        public Impl(File componentSourceDir, String componentSourcePackage,
                    File moduleSourceDir, String moduleSourcePackage) {
            // TODO don't really like handling the logic this way
            if ((componentSourceDir != null && componentSourceDir.exists()) || componentSourcePackage == null) {
                this.componentSourceDir = componentSourceDir;
                this.componentSourcePackage = null;
            } else {
                this.componentSourcePackage = componentSourcePackage;
                this.componentSourceDir = null;
            }

            if ((moduleSourceDir != null && moduleSourceDir.exists()) || moduleSourcePackage == null) {
                this.moduleSourceDir = moduleSourceDir;
                this.moduleSourcePackage = null;
            } else {
                this.moduleSourcePackage = moduleSourcePackage;
                this.moduleSourceDir = null;
            }

            this.componentPackageAlways = componentSourcePackage;
            this.modulePackageAlways = moduleSourcePackage;
        }

        @Override
        public File getComponentSourceDir() {
            return this.componentSourceDir;
        }

        @Override
        public String getComponentSourcePackage() {
            return componentSourcePackage;
        }

        @Override
        public String getComponentSourcePackageAlways() {
            return componentPackageAlways;
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
        public String getModuleSourcePackageAlways() {
            return modulePackageAlways;
        }

        @Override
        public Set<SourceLoader> getSourceLoaders() {
            return loaders;
        }

        /**
         * Distinguish between Aura component and modules locations.
         * Module require separate registry that handles its own def type to allow
         * coexistence of components and modules of the same name
         *
         * @return DEFAULT DefType.COMPONENT for Aura components
         */
        @Override
        @Deprecated
        public DefType type() {
            return DefType.COMPONENT;
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
            sb.append(", Loaders=");
            sb.append(loaders.toString());
            sb.append(")");
            return sb.toString();
        }
    }
}
