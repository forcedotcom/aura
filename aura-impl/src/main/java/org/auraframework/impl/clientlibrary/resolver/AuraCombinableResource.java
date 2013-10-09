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
package org.auraframework.impl.clientlibrary.resolver;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;

import org.auraframework.Aura;
import org.auraframework.clientlibrary.Combinable;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

/**
 * Shared client library combinable. Resources must be in
 */
public class AuraCombinableResource extends AbstractResourceResolver implements Combinable {

    public static final String RESOURCES_DIR = "/aura/resources/";

    public AuraCombinableResource(String name, ClientLibraryDef.Type type, String location, String minLocation) {
        super(name, type, location, minLocation, true);
    }

    @Override
    public String getContents() throws IOException {
        return getContents(RESOURCES_DIR + this.getLocation());
    }

    /**
     * Gets file resource and returns contents as String
     *
     * @param file resource path given to ResourceLoader
     * @return contents
     * @throws IOException
     */
    protected static String getContents(String file) throws IOException {
        String out = "";
        ResourceLoader loader = Aura.getConfigAdapter().getResourceLoader();
        if (loader.getResource(file) != null) {
            InputStream in = loader.getResourceAsStream(file);
            StringWriter sw = new StringWriter();
            IOUtil.copyStream(new InputStreamReader(in), sw); // closes in
            out = sw.toString();
        }
        return out;
    }
}
