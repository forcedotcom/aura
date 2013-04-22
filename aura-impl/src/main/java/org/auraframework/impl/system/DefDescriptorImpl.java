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
package org.auraframework.impl.system;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

/**
 */
public class DefDescriptorImpl<T extends Definition> implements DefDescriptor<T> {
    private static final long serialVersionUID = 3030118554156737974L;
    protected final String namespace;
    protected final String name;
    protected final String qualifiedName;
    protected final String descriptorName;
    protected final String prefix;
    protected final String nameParameters;
    protected final DefType defType;

    private final int hashCode;

    private static final class DescriptorKey {
        private final String name;
        private final Class<? extends Definition> clazz;

        public DescriptorKey(String name, Class<? extends Definition> clazz) {
            // FIXME: this case flattening would remove the extra copies of
            // definitions.
            // If we go case sensitive, we won't want it though.
            // this.qualifiedName = qualifiedName.toLowerCase();
            this.name = name;
            this.clazz = clazz;
        }

        @Override
        public int hashCode() {
            return this.name.hashCode() + this.clazz.hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (!(obj instanceof DescriptorKey)) {
                return false;
            }
            DescriptorKey dk = (DescriptorKey) obj;
            return dk.clazz.equals(this.clazz) && dk.name.equals(this.name);
        }
    }

    private static final Cache<DescriptorKey, DefDescriptor<? extends Definition>> cache = CacheBuilder.newBuilder()
            .concurrencyLevel(20).initialCapacity(512).maximumSize(1024 * 10).build();

    /**
     * Pattern for tag descriptors : foo:bar Group 0 = QName = foo:bar Group 1 =
     * prefix Group 2 = namespace = foo Group 3 = name = bar prefix = null
     */
    private static final Pattern TAG_PATTERN = Pattern.compile("(?:([\\w\\*]+)://)?(?:([\\w\\*]+):)?([\\w\\$\\*]+)");

    /**
     * Pattern for class descriptors: java://foo.bar.baz Group 0 = QName =
     * java://foo.bar.baz Group 1 = prefix = java Group 2 = namespace = foo.bar
     * Group 3 = name = baz
     */
    private static final Pattern CLASS_PATTERN = Pattern
            .compile("\\A(?:([\\w\\*]+)://)?((?:[\\w\\*]|\\.)*?)?\\.?+([\\w,$\\*]*?(?:\\[\\])?)(<[\\w.,(<[\\w.,]+>)]+>)?\\z");

    private static String buildQualifiedName(String prefix, String namespace, String name) {
        if (namespace == null) {
            return String.format("%s://%s", prefix, name);
        }
        String format = MARKUP_PREFIX.equals(prefix) ? "%s://%s:%s" : "%s://%s.%s";
        return String.format(format, prefix, namespace, name);
    }

    private static String buildDescriptorName(String prefix, String namespace, String name) {
        if (namespace == null) {
            return String.format("%s", name);
        }
        String format = MARKUP_PREFIX.equals(prefix) ? "%s:%s" : "%s.%s";
        return String.format(format, namespace, name);
    }

    protected DefDescriptorImpl(DefDescriptor<?> associate, Class<T> defClass, String newPrefix) {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        try {
            this.defType = DefType.getDefType(defClass);
            this.prefix = newPrefix;
            this.name = associate.getName();
            this.namespace = associate.getNamespace();
            this.qualifiedName = buildQualifiedName(prefix, namespace, name);
            this.descriptorName = buildDescriptorName(prefix, namespace, name);
            int pos = name.indexOf('<');
            this.nameParameters = pos >= 0 ? name.substring(pos).replaceAll("\\s", "") : null;
            this.hashCode = createHashCode();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        }
        loggingService.incrementNum(LoggingService.DEF_DESCRIPTOR_COUNT);
    }

    protected DefDescriptorImpl(String qualifiedName, Class<T> defClass) {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        try {
            this.defType = DefType.getDefType(defClass);
            if (AuraTextUtil.isNullEmptyOrWhitespace(qualifiedName)) {
                throw new AuraRuntimeException("QualifiedName is required for descriptors");
            }

            String prefix = null;
            String namespace = null;
            String name = null;
            String nameParameters = null;

            switch (defType) {
            case CONTROLLER:
            case TESTSUITE:
            case MODEL:
            case RENDERER:
            case HELPER:
            case STYLE:
            case TYPE:
            case SECURITY_PROVIDER:
            case PROVIDER:
                Matcher matcher = CLASS_PATTERN.matcher(qualifiedName);
                if (matcher.matches()) {
                    prefix = matcher.group(1);
                    namespace = matcher.group(2);
                    if (namespace.isEmpty()) {
                        namespace = null;
                    }
                    name = matcher.group(3);
                    if (matcher.group(4) != null) {
                        // combine name with <generic params> if available
                        name += matcher.group(4);
                        if (defType == org.auraframework.def.DefDescriptor.DefType.TYPE) {
                            nameParameters = matcher.group(4);
                        }
                    }
                } else {
                    throw new AuraRuntimeException(String.format("Invalid Descriptor Format: %s", qualifiedName));
                }

                break;
            case ACTION:
                // subtype?
                throw new AuraRuntimeException(
                        String.format("ActionDef descriptor must be a subdef: %s", qualifiedName));
            case ATTRIBUTE:
            case LAYOUT:
            case LAYOUT_ITEM:
            case TESTCASE:
                name = qualifiedName;
                break;
            case APPLICATION:
            case COMPONENT:
            case INTERFACE:
            case EVENT:
            case DOCUMENTATION:
            case LAYOUTS:
            case NAMESPACE:
                Matcher tagMatcher = TAG_PATTERN.matcher(qualifiedName);
                if (tagMatcher.matches()) {
                    prefix = tagMatcher.group(1);
                    if (prefix == null) {
                        prefix = MARKUP_PREFIX;
                    }
                    namespace = tagMatcher.group(2);
                    name = tagMatcher.group(3);
                    if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
                        name = namespace;
                        namespace = null;
                    }
                    qualifiedName = buildQualifiedName(prefix, namespace, name);
                } else {
                    throw new AuraRuntimeException(String.format("Invalid Descriptor Format: %s", qualifiedName));
                }

                break;
            }

            if (AuraTextUtil.isNullEmptyOrWhitespace(prefix)) {
                prefix = Aura.getContextService().getCurrentContext().getDefaultPrefix(defType);
                if (prefix != null) {
                    qualifiedName = buildQualifiedName(prefix, namespace, name);
                }
            }
            this.qualifiedName = qualifiedName;
            this.descriptorName = buildDescriptorName(prefix, namespace, name);
            this.prefix = prefix;
            if (defType == DefType.NAMESPACE) {
                this.namespace = name;
                this.name = name;
            } else {
                this.namespace = namespace;
                this.name = name;
            }
            this.hashCode = createHashCode();
            this.nameParameters = nameParameters;
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        }
        loggingService.incrementNum(LoggingService.DEF_DESCRIPTOR_COUNT);
    }

    private int createHashCode() {
        return AuraUtil.hashCodeLowerCase(name, namespace, prefix, defType.ordinal());
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getNamespace() {
        return this.namespace;
    }

    @Override
    public String getQualifiedName() {
        return this.qualifiedName;
    }

    @Override
    public String getDescriptorName() {
        return descriptorName;
    }

    @Override
    public DefType getDefType() {
        return this.defType;
    }

    @Override
    public String getNameParameters() {
        return nameParameters;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeValue(qualifiedName);
    }

    @Override
    public String toString() {
        return qualifiedName;
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof DefDescriptor) {
            DefDescriptor<?> e = (DefDescriptor<?>) o;
            return getDefType() == e.getDefType() && name.equalsIgnoreCase(e.getName())
                    && (namespace == null ? e.getNamespace() == null : namespace.equalsIgnoreCase(e.getNamespace()))
                    && (prefix == null ? e.getPrefix() == null : prefix.equalsIgnoreCase(e.getPrefix()));
        }
        return false;
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    /**
     * @return Returns the prefix.
     */
    @Override
    public String getPrefix() {
        return prefix;
    }

    /**
     * @return Returns isParameterized.
     */
    @Override
    public boolean isParameterized() {
        return nameParameters != null;
    }

    private static <E extends Definition> DefDescriptor<E> buildInstance(String qualifiedName, Class<E> defClass) {
        if (defClass == TypeDef.class && qualifiedName.indexOf("://") == -1) {
            TypeDef typeDef = AuraStaticTypeDefRegistry.INSTANCE.getDef(qualifiedName);
            if (typeDef != null) {
                @SuppressWarnings("unchecked")
                DefDescriptor<E> result = (DefDescriptor<E>) typeDef.getDescriptor();
                return result;
            }
        }
        return new DefDescriptorImpl<E>(qualifiedName, defClass);
    }

    /**
     * FIXME: this method is ambiguous about wanting a qualified, simple, or
     * descriptor name.
     * 
     * @param name The simple String representation of the instance requested
     *            ("foo:bar" or "java://foo.Bar")
     * @param defClass The Interface's Class for the DefDescriptor being
     *            requested.
     * @return An instance of a AuraDescriptor for the provided tag
     */
    public static <E extends Definition> DefDescriptor<E> getInstance(String name, Class<E> defClass) {
        if (name == null || defClass == null) {
            throw new AuraRuntimeException("descriptor is null");
        }
        DescriptorKey dk = new DescriptorKey(name, defClass);
        @SuppressWarnings("unchecked")
        DefDescriptor<E> result = (DefDescriptor<E>) cache.getIfPresent(dk);
        if (result == null) {
            result = buildInstance(name, defClass);
            // Our input names may not be qualified, but we should ensure that
            // the fully-qualified
            // is properly cached to the same object. I'd like an unqualified
            // name to either
            // throw or be resolved first, but that's breaking or non-performant
            // respectively.
            if (!dk.name.equals(result.getQualifiedName())) {
                DescriptorKey fullDK = new DescriptorKey(result.getQualifiedName(), defClass);
                @SuppressWarnings("unchecked")
                DefDescriptor<E> fullResult = (DefDescriptor<E>) cache.getIfPresent(fullDK);
                if (fullResult == null) {
                    cache.put(fullDK, result);
                } else {
                    // We already had one, just under the proper name
                    result = fullResult;
                }
            }
            cache.put(dk, result);
        }
        return result;
    }

    /**
     * @see DefDescriptor#getDef()
     */
    @Override
    public T getDef() throws QuickFixException {
        return Aura.getDefinitionService().getDefinition(this);
    }

    public static <E extends Definition> DefDescriptor<E> getAssociateDescriptor(DefDescriptor<?> desc,
            Class<E> defClass, String newPrefix) {
        if (desc == null) {
            throw new AuraRuntimeException("descriptor is null");
        }
        return new DefDescriptorImpl<E>(desc, defClass, newPrefix);
    }

    /**
     * @see DefDescriptor#exists()
     */
    @Override
    public boolean exists() {
        return Aura.getContextService().getCurrentContext().getDefRegistry().exists(this);
    }

    /**
     * Compares one {@link DefDescriptor} to another. Sorting uses (only) the
     * qualified name, case insensitively. Per {@link Comparable}'s spec, throws
     * {@link ClassCastException} if {@code arg} is not a {@code DefDescriptor}.
     */
    @Override
    public int compareTo(DefDescriptor<?> other) {
        return compare(this, other);
    }

    /**
     * Helper method for various {@link DefDescriptor} subclasses to implement
     * {@link #compareTo(DefDescriptor)}, since interfaces aren't allowed to
     * have static methods, and since {@code DefDescriptor} is an interface
     * rather than an abstract class.
     */
    public static int compare(DefDescriptor<?> dd1, DefDescriptor<?> dd2) {
        int value;

        value = dd1.getQualifiedName().compareToIgnoreCase(dd2.getQualifiedName());
        if (value != 0) {
            return value;
        }
        return dd1.getDefType().compareTo(dd2.getDefType());
    }
}
