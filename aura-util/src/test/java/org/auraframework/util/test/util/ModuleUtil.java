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
package org.auraframework.util.test.util;

import java.io.File;
import java.io.IOException;
import java.net.JarURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.Enumeration;
import java.util.jar.JarEntry;

import com.google.common.collect.Sets;

public class ModuleUtil {
    private final static String CLASS_SUFFIX = ".class";

    /**
     * Get the URI for the jar or filesystem root of the module containing the given class.
     * @param classInModule
     * @return URI of jar or filesystem root
     */
    public static URI getRootUri(Class<?> classInModule){
        String resourceName = classInModule.getName().replace('.', '/') + CLASS_SUFFIX;
        URL url = classInModule.getClassLoader().getResource(resourceName);
        String resPath = url.toString();
        String root;
        if ("jar".equals(url.getProtocol())) {
            root = resPath.substring(0, resPath.indexOf("!/") + 2);
        } else {
            root = resPath.substring(0, resPath.length() - resourceName.length());
        }
        try {
			return new URI(root);
		} catch (URISyntaxException e) {
			throw new RuntimeException("Could not determine module for " + url);
		}
    }
    
    public static Collection<String> getClassNames(URI rootUri) {
        Collection<String> classNames = Sets.newHashSet();
        try {
            if ("jar".equals(rootUri.getScheme())) {
                JarURLConnection jarConn = (JarURLConnection) rootUri.toURL().openConnection();
                for (Enumeration<JarEntry> entries = jarConn.getJarFile().entries(); entries.hasMoreElements();) {
                    JarEntry entry = entries.nextElement();
                    String entryName = entry.getName();
                    if (entryName.endsWith(CLASS_SUFFIX)) {
                        entryName = entryName.substring(0, entryName.length() - CLASS_SUFFIX.length());
                    }
                    classNames.add(entryName.replace('/', '.'));
                }
            } else {
                forEachFile(classNames, rootUri, new File(rootUri));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return classNames;
    }

    private static void forEachFile(Collection<String> names, URI root, File file) {
        if (!file.isDirectory()) {
            if (!file.getName().endsWith(CLASS_SUFFIX)) {
                return;
            }
            String relative = root.relativize(file.toURI()).getPath();
            names.add(relative.substring(0, relative.length() - CLASS_SUFFIX.length()).replace(File.separatorChar, '.'));
        } else {
            for (File child : file.listFiles()) {
                forEachFile(names, root, child);
            }
        }
    }
}
