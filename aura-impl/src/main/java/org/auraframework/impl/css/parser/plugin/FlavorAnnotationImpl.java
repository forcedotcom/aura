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
package org.auraframework.impl.css.parser.plugin;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Map;
import java.util.Optional;

import org.auraframework.css.FlavorAnnotation;

import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.salesforce.omakase.ast.Comment;

/**
 * Represents a CSS annotation (comment) with metadata about a flavor.
 * <p>
 * The annotation starts with the name of the flavor, then contains comma-separated key-value pairs. Each key-value pair
 * is separate by a space. For example:
 *
 * <pre>
 * <code>
 * &#8725;* &#64;flavor foo, extends default *&#8725;
 * .THIS--foo {}
 * </code>
 * </pre>
 *
 * Available key-value params: <br>
 * <ul>
 * <li>extends <i>name</i></li>
 * <li>overrides-if <i>condition</i></li>
 */
public final class FlavorAnnotationImpl implements FlavorAnnotation {
    private static final long serialVersionUID = 4882490457365421070L;

    private static final String NAME = "@flavor";

    private final String flavorName;
    private final String optionExtends;
    private final String optionOverridesIf;

    public FlavorAnnotationImpl(Map<String, String> map) {
        this.flavorName = checkNotNull(map.get("flavor"), "flavorName cannot be null");
        this.optionExtends = map.get("extends");

        String overridesIf = map.get("overrides-if");
        this.optionOverridesIf = overridesIf != null ? overridesIf.toLowerCase() : null;
    }

    public FlavorAnnotationImpl(String name) {
        this.flavorName = checkNotNull(name, "flavor name cannot be null");
        this.optionExtends = null;
        this.optionOverridesIf = null;
    }

    @Override
    public String getFlavorName() {
        return flavorName;
    }

    @Override
    public Optional<String> getExtends() {
        return Optional.ofNullable(optionExtends);
    }

    @Override
    public Optional<String> getOverridesIf() {
        return Optional.ofNullable(optionOverridesIf);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("flavorName", flavorName)
                .add("optionExtends", optionExtends)
                .add("optionOverridesIf", optionOverridesIf)
                .toString();
    }

    /** returns a {@link FlavorAnnotationImpl} object if the given CSS comment contains one */
    public static Optional<FlavorAnnotation> find(Comment comment) {
        String string = comment.content().trim();
        if (string.startsWith(NAME)) {
            string = string.substring(1); // remove the @ sign
            Map<String, String> map = Splitter.on(",").trimResults().omitEmptyStrings().withKeyValueSeparator(" ").split(string);
            return Optional.<FlavorAnnotation>of(new FlavorAnnotationImpl(map));
        }
        return Optional.empty();
    }
}
