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

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.auraframework.css.FlavorAnnotation;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.salesforce.omakase.ast.Comment;
import com.salesforce.omakase.ast.Rule;
import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.ast.selector.Selector;
import com.salesforce.omakase.broadcast.annotation.Observe;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Gathers metadata about flavors, from explicit {@link FlavorAnnotation}s or implicit conventional patterns (such as
 * flavors declared by class name selectors of the conventional format).
 *
 * @see FlavorPlugin
 * @see FlavorAnnotation
 */
public final class FlavorCollectorPlugin implements Plugin {
    private Map<String, FlavorAnnotation> annotations = new LinkedHashMap<>();

    // todo find flavors on at-rules too?

    @Observe
    public void readAnnotations(Rule rule) throws StyleParserException {
        // read flavor annotations /* @flavor name, ... */
        Optional<Selector> selector = rule.selectors().first();
        if (selector.isPresent()) {
            for (Comment comment : selector.get().comments()) {
                Optional<FlavorAnnotation> annotation = FlavorAnnotationImpl.find(comment);
                if (annotation.isPresent()) {
                    annotations.put(annotation.get().getFlavorName(), annotation.get());
                }
            }
        }
    }

    @Observe
    public void checkClassNames(ClassSelector selector) {
        // find class names matching the flavor format.
        // If an annotation was not already found for this flavor, create an empty one.
        Optional<String> flavor = FlavorPluginUtil.extractFlavor(selector);
        if (flavor.isPresent() && !annotations.containsKey(flavor.get())) {
            annotations.put(flavor.get(), new FlavorAnnotationImpl(flavor.get()));
        }
    }

    public Map<String, FlavorAnnotation> getFlavorAnnotations() {
        return annotations;
    }
}
