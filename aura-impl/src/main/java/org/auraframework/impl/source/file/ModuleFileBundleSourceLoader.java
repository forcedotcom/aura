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

import java.io.File;
import java.util.Collection;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;

import com.google.common.collect.Maps;

/**
 * Module file bundle loader requires support for camel cased component names
 * but also support web component custom element convention naming containing only
 * lower case and hyphens.
 */
public class ModuleFileBundleSourceLoader extends FileBundleSourceLoader {

    public ModuleFileBundleSourceLoader(String resourcePackage, FileMonitor fileMonitor, Collection<FileBundleSourceBuilder> builders) {
        super(resourcePackage, fileMonitor, builders);
        updateFileMap();
    }

    public ModuleFileBundleSourceLoader(File base, FileMonitor fileMonitor, Collection<FileBundleSourceBuilder> builders) {
        super(base, fileMonitor, builders);
        updateFileMap();
    }

    @Override
    public void reset() {
        rwLock.writeLock().lock();
        try {
            super.reset();
            updateFileMap();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    /**
     * Updates file map to include not hyphenated names so that it matches Aura names during BundleSource lookup
     */
    private void updateFileMap() {
        Map<String, FileEntry> temp = Maps.newConcurrentMap();
        this.fileMap.forEach( (qualified, entry) -> {
            if (qualified.contains("-")) {
                String withoutHyphen = StringUtils.replace(qualified, "-", "");
                temp.put(withoutHyphen, entry);
            }
        });
        temp.forEach( (name, entry) -> {
            if (this.fileMap.get(name) != null) {
                throw new AuraRuntimeException(name + " already exists as hyphenated name. Please use another name");
            }
            this.fileMap.put(name, entry);
        });
    }
}
