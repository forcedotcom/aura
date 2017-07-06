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

import org.apache.log4j.Logger;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.util.FileChangeEvent;
import org.auraframework.util.FileListener;

import java.nio.file.Path;

/**
 * Used by many things to monitor and notify when file has changed.
 *
 * When a file does change, it notifies its listener with the file name, and possibly a descriptor.
 */
public class FileSourceListener implements FileListener {
    private SourceListener sourceListener;

    public FileSourceListener(SourceListener sourceListener) {
        this.sourceListener = sourceListener;
    }
    
    private static final Logger LOG = Logger.getLogger(FileSourceListener.class);

    @Override
    public void fileCreated(FileChangeEvent event) throws Exception {
        notifySourceChanges(event, SourceMonitorEvent.CREATED);
    }

    @Override
    public void fileDeleted(FileChangeEvent event) throws Exception {
        notifySourceChanges(event, SourceMonitorEvent.DELETED);
    }

    @Override
    public void fileChanged(FileChangeEvent event) throws Exception {
        notifySourceChanges(event, SourceMonitorEvent.CHANGED);
    }

    public void onSourceChanged(SourceListener.SourceMonitorEvent smEvent, String filePath) {
        if (sourceListener != null) {
            sourceListener.onSourceChanged(smEvent, filePath);
        }
    }

    private void notifySourceChanges(FileChangeEvent event, SourceListener.SourceMonitorEvent smEvent) {
        Path path = event.getPath();
        String filePath = path.toString();
        LOG.info("File " + filePath + " changed due to: " + smEvent);
        onSourceChanged(smEvent, filePath);
    }
}
