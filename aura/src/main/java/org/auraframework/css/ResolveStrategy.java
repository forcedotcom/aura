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

/**
 * Represents an <em>indication</em> of how token resolution in CSS source will behave.
 */
public enum ResolveStrategy {
    /**
     * Indicates that resolution is unnecessary.
     */
    PASSTHROUGH,
    /**
     * Indicates that it's only necessary to resolve to the default token value. This is usually used when validating
     * that a default value for a token exists, and thus context-specified overrides are irrelevant.
     */
    RESOLVE_DEFAULTS,
    /**
     * Indicates normal token resolution. This usually means that context-specified overrides should be observed.
     */
    RESOLVE_NORMAL
}
