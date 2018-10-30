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
package org.auraframework.impl.source.file;

import static java.util.Objects.requireNonNull;

import java.io.File;
import java.io.IOException;

import org.auraframework.system.FileSourceLocation;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.base.MoreObjects;

public class FileSourceLocationImpl implements FileSourceLocation {
    private final File sourceDirectory;
    private final boolean isComponentSource;
    private final boolean isModuleSource;

    public FileSourceLocationImpl(File sourceDirectory, boolean isComponentSource, boolean isModuleSource) {
        requireNonNull(sourceDirectory, "sourceDirectory cannot be null");

        if (!sourceDirectory.exists() || !sourceDirectory.isDirectory()) {
            throw new AuraRuntimeException(String.format(
                    "Source directory '%s' does not exist or is not a directory",
                    sourceDirectory.getAbsolutePath()));
        }

        try {
            this.sourceDirectory = sourceDirectory.getCanonicalFile();
        } catch (IOException ioe) {
            throw new AuraRuntimeException(String.format(
                    "IOException accessing base directory '%s'",
                    sourceDirectory.getAbsolutePath()), ioe);
        }

        this.isComponentSource = isComponentSource;
        this.isModuleSource = isModuleSource;
    }

    @Override
    public File getSourceDirectory() {
        return sourceDirectory;
    }

    @Override
    public boolean isComponentSource() {
        return isComponentSource;
    }

    @Override
    public boolean isModuleSource() {
        return isModuleSource;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("sourceDirectory", sourceDirectory)
                .add("isComponenSource", isComponentSource)
                .add("isModuleSource", isModuleSource)
                .toString();
    }

    /**
     * Create a {@link FileSourceLocation} for aura components.
     *
     * @param sourceDirectory The source directory containing namespaces.
     */
    public static FileSourceLocation components(File sourceDirectory) {
        return new FileSourceLocationImpl(sourceDirectory, true, false);
    }

    /**
     * Create a {@link FileSourceLocation} for lwc modules.
     *
     * @param sourceDirectory The source directory containing namespaces.
     */
    public static FileSourceLocation modules(File sourceDirectory) {
        return new FileSourceLocationImpl(sourceDirectory, false, true);
    }
}
