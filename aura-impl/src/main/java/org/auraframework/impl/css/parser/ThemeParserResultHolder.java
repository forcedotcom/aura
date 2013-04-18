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
package org.auraframework.impl.css.parser;

import java.util.EnumMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.system.Client;

public class ThemeParserResultHolder {
    private String defaultCss;
    private final Map<Client.Type, String> browserCssMap = new EnumMap<Client.Type, String>(Client.Type.class);
    private Set<String> imageURLs;
    private Set<String> foundConditions;

    public String getDefaultCss() {
        return defaultCss;
    }

    public void setDefaultCss(String defaultCss) {
        this.defaultCss = defaultCss;
    }

    public Map<Client.Type, String> getBrowserCssMap() {
        return browserCssMap;
    }

    public void putBrowserCss(String condition, String css) {
        this.browserCssMap.put(Client.Type.valueOf(condition), css);
    }

    public Set<String> getFoundConditions() {
        return foundConditions;
    }

    public void addFoundConditions(String condition) {
        if (this.foundConditions == null) {
            this.foundConditions = new HashSet<String>();
        }
        this.foundConditions.add(condition);
    }

    public Set<String> getImageURLs() {
        return imageURLs;
    }

    public void addImageURL(String imageURL) {
        if (imageURL != null && !imageURL.isEmpty()) {
            if (this.imageURLs == null) {
                this.imageURLs = new HashSet<String>();
            }
            this.imageURLs.add(imageURL);
        }
    }
}
