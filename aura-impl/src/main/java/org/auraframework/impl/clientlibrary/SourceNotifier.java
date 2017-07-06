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
package org.auraframework.impl.clientlibrary;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.CachingService;
import org.auraframework.system.SourceListener;
import org.auraframework.util.FileMonitor;

import javax.inject.Inject;

/**
 * Invalidate caches on source changes
 */
@ServiceComponent
class SourceNotifier implements SourceListener {
    @Inject
    private CachingService cachingService;

    @Inject
    private void subscribeToChangeNotification(FileMonitor fileMonitor) {
        fileMonitor.subscribeToChangeNotification(this);
    }

    @Override
    public void onSourceChanged(SourceMonitorEvent event, String filePath) {
        cachingService.getClientLibraryOutputCache().invalidateAll();
    }
}

