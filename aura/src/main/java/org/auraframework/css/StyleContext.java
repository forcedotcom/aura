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
package org.auraframework.css;

import org.auraframework.adapter.StyleAdapter;
import org.auraframework.system.Client;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.ImmutableSet;

/**
 * Information about the current context relevant to CSS parsing.
 */
public interface StyleContext extends JsonSerializable {
    /**
     * Gets the client type (e.g., "webkit" or"ie7"). See {@link Client#getType()}. This is lower-cased.
     */
    String getClientType();

    /**
     * Gets all true conditions. This includes named conditions (e.g., client type) and any other specified true
     * conditions.
     */
    ImmutableSet<String> getAllTrueConditions();

    /**
     * Gets the unnamed true conditions only (from {@link StyleAdapter#getExtraTrueConditions()}. This does <b>not</b>
     * include named true conditions like {@link #getClientType()}.
     */
    ImmutableSet<String> getExtraTrueConditionsOnly();
}
