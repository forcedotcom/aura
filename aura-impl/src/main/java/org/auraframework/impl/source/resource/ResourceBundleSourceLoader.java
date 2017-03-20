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
package org.auraframework.impl.source.resource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collection;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.impl.source.file.FileBundleSourceLoader;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

/**
 * A source loader to load from jars.
 */
public class ResourceBundleSourceLoader extends FileBundleSourceLoader implements InternalNamespaceSourceLoader {

    private static File copyResourcesToDir(String basePackage) {
        InputStreamReader reader = null;
        ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
        File directory = new File(IOUtil.newTempDir("resources"));

        try {
            PathMatchingResourcePatternResolver p = new PathMatchingResourcePatternResolver(resourceLoader);
            Resource[] res = p.getResources("classpath*:/" + basePackage + "/*/*/*.*");
            for (Resource r : res) {
                //
                // TOTAL HACK: Move this to getAllDescriptors later.
                //
                String filename = r.getURL().toString();
                List<String> names = AuraTextUtil.splitSimple("/", filename);
                if (names.size() < 3) {
                    continue;
                }
                String last = names.get(names.size() - 1);
                String name = names.get(names.size() - 2);
                String ns = names.get(names.size() - 3);
                File nsDir = new File(directory, ns);
                if (!nsDir.exists()) {
                    nsDir.mkdir();
                }
                File nameDir = new File(nsDir, name);
                if (!nameDir.exists()) {
                    nameDir.mkdir();
                }
                File target = new File(nameDir, last);
                IOUtil.copyStream(r.getInputStream(), new FileOutputStream(target));
            }
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        } finally {
            //
            // Make sure we close everything out.
            //
            try {
                if (reader != null) {
                    reader.close();
                }
            } catch (Throwable t) {
                // ignore exceptions on close.
            }
        }
        return directory;
    }

    public ResourceBundleSourceLoader(String basePackage, FileMonitor fileMonitor,
            Collection<FileBundleSourceBuilder> builders) {
        super(copyResourcesToDir(basePackage), fileMonitor, builders);
    }
}
