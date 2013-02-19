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
    protected final String fullyQualifiedName;
    protected final String descriptorName;
    protected final String prefix;
    protected final String nameParameters;
    protected final DefType defType;
    private final int hashCode;

    protected DefDescriptorImpl(Builder<T> builder) {
        this.defType = builder.defType;
        this.prefix = builder.prefix;
        this.name = builder.name;
        this.namespace = builder.namespace;
        this.qualifiedName = builder.qualifiedName;
        this.fullyQualifiedName = builder.fullyQualifiedName;
        this.descriptorName = builder.descriptorName;
        this.nameParameters = builder.nameParameters;
        this.hashCode = createHashCode();
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
    public String getFullyQualifiedName() {
        return this.fullyQualifiedName;
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

    /**
     * @see DefDescriptor#getDef()
     */
    @Override
    public T getDef() throws QuickFixException {
        return Aura.getDefinitionService().getDefinition(this);
    }


    private static final class DescriptorKey {
        private final String name;
        private final Class<? extends Definition> clazz;

        public DescriptorKey(String name, Class<? extends Definition> clazz) {
            // FIXME: this case flattening would remove the extra copies of definitions.
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


    private static <E extends Definition> Builder<E> parseToBuilder(String qualifiedName, Builder<E> builder) {
        switch (builder.defType) {
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
                builder.setPrefix(matcher.group(1));
                builder.setNamespace(matcher.group(2));
                builder.setName(matcher.group(3));
                builder.setNameParameters(matcher.group(4));
                //
                // This is only necessary if our prefix is null, but just do it anyway.
                //
                builder.setQualifiedName(qualifiedName);
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
            builder.setName(qualifiedName);
            //
            // This is needed, as the prefix is always null.
            //
            builder.setQualifiedName(qualifiedName);
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
                String prefix, name, namespace;

                prefix = tagMatcher.group(1);
                builder.setPrefix(prefix != null?prefix:MARKUP_PREFIX);
                namespace = tagMatcher.group(2);
                name = tagMatcher.group(3);
                if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
                    name = namespace;
                    namespace = null;
                }
                builder.setName(name);
                builder.setNamespace(namespace);
            } else {
                throw new AuraRuntimeException(String.format("Invalid Descriptor Format: %s", qualifiedName));
            }
            break;
        }
        return builder;
    }

    public static <E extends Definition> DefDescriptor<E> getInstance(String name) {
        if (name == null) {
            throw new AuraRuntimeException("descriptor name is null");
        }
        if (name.length() < 2 || name.charAt(1) != '@') {
            throw new AuraRuntimeException("no type for descriptor "+name);
        }
        @SuppressWarnings("unchecked")
        Class<E> clazz = (Class<E>)DefType.getDefType(name.substring(0,1)).getPrimaryInterface();
        return getInstance(name.substring(2), clazz);
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
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        try {
            if (name == null || defClass == null) {
                throw new AuraRuntimeException("name and class required for descriptors");
            }
            if (name.length() > 2 && name.charAt(1) == '@') {
                name = name.substring(2);
            }
            if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
                throw new AuraRuntimeException("QualifiedName is required for descriptors");
            }
            // Do a quick check first for built in types.
            if (defClass == TypeDef.class && name.indexOf("://") == -1) {
                TypeDef typeDef = AuraStaticTypeDefRegistry.INSTANCE.getDef(name);
                if (typeDef != null) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<E> td = (DefDescriptor<E>) typeDef.getDescriptor();
                    return td;
                }
            }
            DescriptorKey dk = new DescriptorKey(name, defClass);
            @SuppressWarnings("unchecked")
            DefDescriptor<E> result = (DefDescriptor<E>) cache.getIfPresent(dk);
            if (result == null) {
                result = parseToBuilder(name, new Builder<E>(defClass)).build();
                // Our input names may not be qualified, but we should ensure that the fully-qualified
                // descriptor is properly cached to the same object. I'd like an unqualified name to either
                // throw or be resolved first, but that's breaking or non-performant respectively.
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
                loggingService.incrementNum(LoggingService.DEF_DESCRIPTOR_COUNT);
            }
            return result;
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        }
    }

    public static <E extends Definition> DefDescriptor<E> getAssociateDescriptor(DefDescriptor<?> desc,
                                                                                 Class<E> defClass,
                                                                                 String newPrefix) {
        if (desc == null || AuraTextUtil.isNullOrEmpty(newPrefix) || defClass == null) {
            throw new AuraRuntimeException("Descriptor and prefix and class are required.");
        }
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        try {
            Builder<E> builder = new Builder<E>(defClass);
            builder.setPrefix(newPrefix);
            builder.setNamespace(desc.getNamespace());
            builder.setName(desc.getName());
            builder.setNameParameters(desc.getNameParameters());
            loggingService.incrementNum(LoggingService.DEF_DESCRIPTOR_COUNT);
            return builder.build();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        }
    }

    /**
     * Helper method for various {@link DefDescriptor} subclasses to implement
     * {@link #compareTo(DefDescriptor)}, since interfaces aren't allowed to
     * have static methods, and since {@code DefDescriptor} is an interface
     * rather than an abstract class.
     */
    public static int compare(DefDescriptor<?> dd1, DefDescriptor<?> dd2) {
        return dd1.getFullyQualifiedName().compareToIgnoreCase(dd2.getFullyQualifiedName());
    }

    protected static class Builder<BT extends Definition> {
        protected DefType defType;
        protected String prefix;
        protected String namespace;
        protected String name;
        protected String nameParameters;
        protected String qualifiedName;
        protected String fullyQualifiedName;
        protected String descriptorName;
        protected int hashCode;

        public Builder(Class<BT> defClass) {
            this.defType = DefType.getDefType(defClass);
        }

        public Builder(DefDescriptor<?> associate, Class<BT> defClass, String newPrefix) {
            this.defType = DefType.getDefType(defClass);
            this.prefix = newPrefix;
            this.name = associate.getName();
            this.namespace = associate.getNamespace();
            int pos = name.indexOf('<');
            this.nameParameters = pos >= 0 ? name.substring(pos).replaceAll("\\s", "") : null;
        }

        public Builder(String qualifiedName, Class<BT> defClass) {
        }

        public DefDescriptor<BT> build() {
            if (defType != org.auraframework.def.DefDescriptor.DefType.TYPE) {
                nameParameters = null;
            }
            if (nameParameters != null) {
                // combine name with <generic params> if available
                name += nameParameters;
            }
            //
            // HACK!!!
            // This is what the old code did, as namespaces are very
            // special.
            //
            if (defType == DefType.NAMESPACE) {
                namespace = null;
            }
            if (namespace == null) {
                descriptorName =  String.format("%s", name);
            } else {
                String format = MARKUP_PREFIX.equals(prefix) ? "%s:%s" : "%s.%s";
                descriptorName = String.format(format, namespace, name);
            }
            if (prefix != null) {
                qualifiedName = String.format("%s://%s", prefix, descriptorName);
            }
            fullyQualifiedName = String.format("%s@%s", defType.getSType(), qualifiedName);
            hashCode = AuraUtil.hashCodeLowerCase(name, namespace, prefix, defType.ordinal());
            //
            // HACK!!!
            // This is what the old code did, as namespaces are very
            // special.
            //
            if (defType == DefType.NAMESPACE) {
                namespace = name;
            }
            return new DefDescriptorImpl<BT>(this);
        }

        /**
         * Sets the prefix for this instance.
         *
         * @param prefix The prefix.
         */
        public void setPrefix(String prefix) {
            if (AuraTextUtil.isNullEmptyOrWhitespace(prefix)) {
                prefix = Aura.getContextService().getCurrentContext().getDefaultPrefix(defType);
            }
            this.prefix = prefix;
        }

        /**
         * Sets the namespace for this instance.
         *
         * @param namespace The namespace.
         */
        public void setNamespace(String namespace) {
            if (AuraTextUtil.isNullEmptyOrWhitespace(namespace)) {
                this.namespace = null;
            } else {
                this.namespace = namespace;
            }
        }

        /**
         * Sets the name for this instance.
         *
         * @param name The name.
         */
        public void setName(String name) {
            this.name = name;
        }

        /**
         * Sets the nameParameters for this instance.
         *
         * @param nameParameters The nameParameters.
         */
        public void setNameParameters(String nameParameters) {
            this.nameParameters = nameParameters;
        }

        /**
         * Sets the qualifiedName for this instance.
         *
         * This is overwritten if prefix is set.
         *
         * @param qualifiedName The qualifiedName.
         */
        public void setQualifiedName(String qualifiedName) {
            this.qualifiedName = qualifiedName;
        }
    }
}
