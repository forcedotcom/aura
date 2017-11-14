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
package org.auraframework.modules.impl.metadata;

/**
 * Module metadata
 */
public class Meta {
    private String description;
    private Double minVersion;
    private Boolean expose;
    private Boolean requireLocker;

    public Meta(String description, Double minVersion, Boolean expose, Boolean requireLocker) {
        this.description = description;
        this.minVersion = minVersion;
        this.expose = expose;
        this.requireLocker = requireLocker;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMinVersion() {
        return minVersion;
    }

    public void setMinVersion(Double minVersion) {
        this.minVersion = minVersion;
    }

    public Boolean isExpose() {
        return expose;
    }

    public void setExpose(Boolean expose) {
        this.expose = expose;
    }

    public Boolean getRequireLocker() { return requireLocker; }

    public void setRequireLocker(Boolean requireLocker) { this.requireLocker = requireLocker; }

}
