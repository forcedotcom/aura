/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.css.theme;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.ThemeDefBuilder;
import org.auraframework.def.ThemeDef;
import org.auraframework.http.AuraResourceServlet;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.util.json.Json;

/**
 * FIXME - barely implemented #W-690042
 */
public class ThemeDefImpl extends DefinitionImpl<ThemeDef> implements ThemeDef {

    private static final long serialVersionUID = 7140896215068458158L;
    private final String code;
    private final Map<Client.Type, String> browserCode;
    private final String className;
    private final Set<String> imageURLs;
    private final Set<String> validImageURLs;

    protected ThemeDefImpl(Builder builder) {
        super(builder);
        this.code = builder.code;
        // TODO: guava will have ImmutableEnumMap in v14
        this.browserCode = builder.browserCode;
        this.className = builder.className;
        if (builder.imageURLs == null) {
            this.imageURLs = Collections.emptySet();
        } else {
            this.imageURLs = builder.imageURLs;
        }
        this.validImageURLs = validateImageURLs(builder.imageURLs);
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        boolean preloaded = context.isPreloaded(getDescriptor());
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        if (!preloaded) {
            Client.Type type = context.getClient().getType();
            // Note that if this starts to depend on anything beside the name of
            // the type,
            // ThemeDefCSSFormatAdapter needs to know to restructure its cache
            // keys
            String out = getCode(type);
            json.writeMapEntry("code", out);
        }
        json.writeMapEntry("className", className);
        json.writeMapEnd();
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ThemeDef> implements ThemeDefBuilder {

        public Builder() {
            super(ThemeDef.class);
        }

        private String code;
        private String className;
        private Set<String> imageURLs;
        private Map<Client.Type, String> browserCode;

        @Override
        public ThemeDef build() {
            return new ThemeDefImpl(this);
        }

        @Override
        public ThemeDefBuilder setImageURLs(Set<String> imageURLs) {
            this.imageURLs = imageURLs;
            return this;
        }

        @Override
        public ThemeDefBuilder setClassName(String className) {
            this.className = className;
            return this;
        }

        @Override
        public ThemeDefBuilder setCode(String code) {
            this.code = code;
            return this;
        }

        @Override
        public ThemeDefBuilder setCode(Map<Client.Type, String> browserCode) {
            this.browserCode = browserCode;
            return this;
        }
    }

    @Override
    public String getClassName() {
        return className;
    }

    @Override
    public Set<String> getImageURLs() {
        return imageURLs;
    }

    @Override
    public Set<String> getValidImageURLs() {
        return validImageURLs;
    }

    @Override
    public String getCode(Client.Type type) {
        if (browserCode != null && browserCode.containsKey(type)) {
            return browserCode.get(type);
        } else {
            return code;
        }
    }

    private Set<String> validateImageURLs(Set<String> imageURLs) {
        if (imageURLs != null) {
            Set<String> validImageURLs = new HashSet<String>(imageURLs.size());
            for (String imgURL : imageURLs) {
                if (AuraResourceServlet.isResourceLocallyAvailable(imgURL)) {
                    validImageURLs.add(imgURL);
                }
            }
            return validImageURLs;
        }
        return Collections.emptySet();
    }

}
