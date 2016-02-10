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

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Validate;
import org.auraframework.Aura;
import org.auraframework.clientlibrary.ClientLibraryResolver;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.http.AuraFrameworkServlet;
import org.auraframework.system.AuraContext;

/**
 * Common resolver. Concrete must either be combinable or not
 */
public abstract class AbstractResourceResolver implements ClientLibraryResolver {

    private final String name;
    private final ClientLibraryDef.Type type;
    private final String location;
    private final String minLocation;
    private final boolean combine;

    public AbstractResourceResolver(String name, ClientLibraryDef.Type type, String location, String minLocation,
                                    boolean combine) {
        Validate.notBlank(name, "Name cannot be blank");
        Validate.notNull(type, "Type cannot be null");
        Validate.notBlank(location, "Resource location cannot be blank");
        Validate.notBlank(minLocation, "Minified resource Location cannot be blank");

        this.location = location;
        this.minLocation = minLocation;
        this.name = name;
        this.type = type;
        this.combine = combine;
    }

    @Override
    public String getName() {
        return this.name;
    }

    @Override
    public ClientLibraryDef.Type getType() {
        return this.type;
    }

    @Override
    public boolean canCombine() {
        return this.combine;
    }

    /**
     * Returns either minified file location or regular depending on mode
     * @return resource location
     */
    @Override
    public String getLocation() {
        AuraContext.Mode mode = Aura.getContextService().getCurrentContext().getMode();
        if (mode.prettyPrint()) {
            return this.location;
        } else {
            return this.minLocation;
        }
    }

    /**
     * Returns url for resource in aura-resources module
     * @return aura resources url
     */
    @Override
    public String getUrl() {
        String location = getLocation();
        if (StringUtils.isBlank(location)) {
            return null;
        }

        String nonce = Aura.getContextService().getCurrentContext().getFrameworkUID();
        String contextPath = Aura.getContextService().getCurrentContext().getContextPath();
        return String.format(AuraFrameworkServlet.RESOURCES_FORMAT, contextPath, nonce, location);
    }
}
