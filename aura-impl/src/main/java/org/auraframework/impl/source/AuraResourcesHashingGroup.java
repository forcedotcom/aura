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
package org.auraframework.impl.source;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.resource.HashingGroup;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;

/**
 * Aura resources wrapper containing constants for the resources group
 */
public class AuraResourcesHashingGroup extends HashingGroup implements SourceListener {

    private static final Logger LOG = Logger.getLogger(AuraResourcesHashingGroup.class);
    public static final String GROUP_NAME = "aura-resources";
    public static final String FILE_NAME = "resourcesuid.properties";
    public static final File ROOT_DIR = AuraImplFiles.AuraResourcesSourceDirectory.asFile();
    private boolean isStale = true;

    public static final FileFilter FILE_FILTER = new FileFilter() {
        @Override
        public boolean accept(File f) {
            return f.getName().endsWith(".css") || f.getName().endsWith(".js") ||  f.getName().endsWith(".html");
        }
    };

    public AuraResourcesHashingGroup(FileMonitor fileMonitor) throws IOException {
        this(fileMonitor, false);
    }

    public AuraResourcesHashingGroup(FileMonitor fileMonitor, boolean monitor) throws IOException {
        super(GROUP_NAME, ROOT_DIR, FILE_FILTER);
        if (monitor) {
            fileMonitor.subscribeToChangeNotification(this);
            fileMonitor.addDirectory(ROOT_DIR.getPath());
        }
    }

    @Override
    public boolean isStale() {
        if (!isGroupHashKnown()) {
            return true;
        }
        return isStale;
    }

    @Override
    public void reset() throws IOException {
        isStale = false;
        super.reset();
    }

    /**
     * Updates resources in generated classes and refreshes resources cache for updated file
     *
     * @param updatedFile path of updated file
     */
    private static synchronized void updateResource(File updatedFile) {
        String path = updatedFile.getPath();
        String relativePath = path.substring(ROOT_DIR.getPath().length(), path.length());
        String classFilePath = AuraImplFiles.AuraResourcesClassDirectory.getPath() + relativePath;
        File destination = new File(classFilePath);
        try {
            FileUtils.copyFile(updatedFile, destination, false);
            String refresh = path.substring(path.indexOf("aura/resources"), path.length());
            Aura.getConfigAdapter().getResourceLoader().refreshCache(refresh);
            LOG.info("Updated resource file: " + relativePath);
        } catch (IOException ioe) {
            throw new AuraRuntimeException("Unable to refresh aura resources", ioe);
        }
    }

    @Override
    public void onSourceChanged(SourceMonitorEvent event, String filePath) {
        if (filePath != null && filePath.startsWith(ROOT_DIR.getPath())) {
            File updatedFile = new File(filePath);
            if (FILE_FILTER.accept(updatedFile)) {
                isStale = true;
                updateResource(updatedFile);
            }
        }
    }
}
