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

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import org.auraframework.css.FlavorAnnotation;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;
import com.salesforce.omakase.ast.Comment;
import com.salesforce.omakase.ast.Rule;
import com.salesforce.omakase.ast.Stylesheet;
import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.ast.selector.Selector;
import com.salesforce.omakase.ast.selector.SelectorPart;
import com.salesforce.omakase.broadcast.annotation.Observe;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Enables a flavor to extend another one. For example:
 *
 * <pre>
 * <code>
 * .THIS--default {...}
 *
 * &#8725;* &#64;flavor foo, extends default *&#8725;
 * .THIS--foo {}
 * </code>
 * </pre>
 *
 * All selectors with the extended flavor will have additional selectors appended, matching the existing selectors but
 * with the flavor name changed.
 * <p>
 * Extending more than one flavor is not allowed. Extending a flavor that also extends something else is not allowed.
 * While these two may be useful, they could also more easily lead to unintended bloated CSS.
 *
 * @see FlavorPlugin
 */
public final class FlavorExtendsPlugin implements Plugin {
    private static final String SINGLE_EXTENDS = "flavor '%s' cannot extend flavor '%s', it was already specified to extend '%s'";
    private static final String UNKNOWN_FLAVOR = "invalid extension of unknown flavor '%s'";
    private static final String HIERARCHY = "multi-level extension not allowed: extending '%s' is not allowed because '%s' also uses extends";

    private final String componentClass;
    private final Set<String> knownFlavors = new HashSet<>(8);
    private final Map<String, String> extensions = new LinkedHashMap<>(8);
    private final Multimap<String, Selector> selectors = HashMultimap.create(4, 16);

    public FlavorExtendsPlugin(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        this.componentClass = FlavorPluginUtil.getComponentClass(flavoredStyle);
    }

    @Observe
    public void findAnnotations(Rule rule) throws StyleParserException {
        // find flavor annotations /* @flavor bar, extends foo */
        Optional<Selector> selector = rule.selectors().first();
        if (!selector.isPresent()) {
            return;
        }

        for (Comment comment : selector.get().comments()) {
            Optional<FlavorAnnotation> annotation = FlavorAnnotationImpl.find(comment);

            if (annotation.isPresent()) {
                knownFlavors.add(annotation.get().getFlavorName());
            }

            if (annotation.isPresent() && annotation.get().getExtends().isPresent()) {
                String name = annotation.get().getFlavorName();
                String extendsOption = annotation.get().getExtends().get();

                if (extensions.containsKey(name)) {
                    // can only extend one thing
                    throw new StyleParserException(String.format(SINGLE_EXTENDS, name, extendsOption, extensions.get(name)), null);
                } else if (!knownFlavors.contains(extendsOption)) {
                    // the flavor must be declared (via annotation) or used (in a selector) beforehand in this source
                    throw new StyleParserException(String.format(UNKNOWN_FLAVOR, extendsOption), null);
                }

                // map flavor name to what it extends
                extensions.put(name, extendsOption);
            }
        }
    }

    @Observe
    public void findFlavorSelectors(ClassSelector selector) {
        Optional<String> flavor = FlavorPluginUtil.extractFlavor(selector);
        if (flavor.isPresent()) {
            selectors.put(flavor.get(), selector.parent());
            knownFlavors.add(flavor.get());
        }
    }

    @Rework
    public void doReplacements(Stylesheet stylesheet) throws StyleParserException {
        // first check that we don't have any extension hierarchies going on
        for (String extended : extensions.values()) {
            if (extensions.containsKey(extended)) {
                throw new StyleParserException(String.format(HIERARCHY, extended, extended), null);
            }
        }

        // now do the magic
        for (Entry<String, String> entry : Lists.reverse(Lists.newArrayList(extensions.entrySet()))) {
            String extension = entry.getKey();
            String extended = entry.getValue();

            for (Selector selector : selectors.get(extended)) {
                // create a copy of the extended selector, changing flavored class names to the extension instead
                Selector copy = new Selector();

                for (SelectorPart part : selector.parts()) {
                    boolean replaced = false;

                    if (part instanceof ClassSelector) {
                        // check if it is a flavored selector that we need to rename
                        ClassSelector cs = (ClassSelector) part;

                        Optional<String> flavor = FlavorPluginUtil.extractFlavor(cs, componentClass);
                        if (flavor.isPresent() && flavor.get().equals(extended)) {
                            // rename the flavor
                            String renamed = cs.name().replaceFirst(flavor.get(), extension);
                            copy.append(new ClassSelector(renamed));
                            replaced = true;
                        }
                    }

                    if (!replaced) {
                        copy.append(part.copy()); // maybe it makes sense to append same ref? so updates are reflected?
                    }
                }

                selector.append(copy);
            }
        }
    }
}
