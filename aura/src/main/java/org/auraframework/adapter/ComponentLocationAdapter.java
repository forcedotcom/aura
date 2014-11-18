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
import java.util.Set;

import org.auraframework.system.SourceLoader;

import com.google.common.collect.Sets;

/**
 */
public interface ComponentLocationAdapter extends AuraAdapter {

    File getComponentSourceDir();

    File getJavaGeneratedSourceDir();

    String getComponentSourcePackage();

    Set<SourceLoader> getSourceLoaders();

    public static class Impl implements ComponentLocationAdapter {

        private final File componentSourceDir;
        private final File javaGeneratedSourceDir;
        private final String componentSourcePackage;
        private final Set<SourceLoader> loaders = Sets.<SourceLoader> newHashSet();

        public Impl(File componentSourceDir) {
            this(componentSourceDir, null);
        }

        public Impl(File componentSourceDir, File javaGeneratedSourceDir) {
            this(componentSourceDir, javaGeneratedSourceDir, null);
        }

        public Impl(File componentSourceDir, File javaGeneratedSourceDir, String componentSourcePackage) {
            if (componentSourceDir.exists() || componentSourcePackage == null) {
                this.componentSourceDir = componentSourceDir;
                this.javaGeneratedSourceDir = javaGeneratedSourceDir;
                this.componentSourcePackage = null;
            } else {
                this.componentSourcePackage = componentSourcePackage;
                this.componentSourceDir = null;
                this.javaGeneratedSourceDir = null;
            }
        }

        public Impl(SourceLoader loader) {
            if (loader != null) {
                loaders.add(loader);
            }
            this.componentSourceDir = null;
            this.javaGeneratedSourceDir = null;
            this.componentSourcePackage = null;
        }

        public Impl(String componentSourcePackage) {
            if (componentSourcePackage != null && !componentSourcePackage.isEmpty()) {
                this.componentSourcePackage = componentSourcePackage;
                this.componentSourceDir = null;
                this.javaGeneratedSourceDir = null;
            } else {
                throw new IllegalArgumentException("componentSourcePackage is null or empty: " + componentSourcePackage);
            }
        }

        @Override
        public File getComponentSourceDir() {
            return this.componentSourceDir;
        }

        @Override
        public File getJavaGeneratedSourceDir() {
            return this.javaGeneratedSourceDir;
        }

        @Override
        public String getComponentSourcePackage() {
            return componentSourcePackage;
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
            sb.append(", JGSD=");
            if (javaGeneratedSourceDir != null) {
                sb.append(javaGeneratedSourceDir.getPath());
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
