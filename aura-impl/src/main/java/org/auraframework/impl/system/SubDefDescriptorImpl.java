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
import org.auraframework.service.LoggingService;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 * subdef impl, passes most stuff except for name through to the parent
 * descriptor
 */
public class SubDefDescriptorImpl<T extends Definition, P extends Definition> implements SubDefDescriptor<T, P> {
    private static final long serialVersionUID = -4922652464026095847L;
    protected final String name;
    protected final String qualifiedName;
    protected final String descriptorName;
    protected final DefType defType;
    protected final DefDescriptor<P> parentDescriptor;
    private final int hashCode;

    /**
     * Pattern for subDefDescriptors: java://foo.bar.baz/ACTION$getUser Group 1
     * = parent name = java://foo.bar.baz Group 2 = defType = ACTION Group 3 =
     * name = getUser
     */
    public static final Pattern SUBDEF_PATTERN = Pattern.compile("\\A((?:[\\w\\\\*]+://)?.*)/(\\w+)\\$(\\w+)\\z");

    protected SubDefDescriptorImpl(DefDescriptor<P> parentDescriptor, String subName, Class<T> defClass) {
        if (AuraTextUtil.isNullEmptyOrWhitespace(subName)) {
            throw new AuraRuntimeException("Sub definition name cannot be null");
        }
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        try {
            this.parentDescriptor = parentDescriptor;
            this.name = subName;
            this.defType = DefType.getDefType(defClass);
            this.qualifiedName = String.format("%s/%s$%s", parentDescriptor.getQualifiedName(), defType.toString(),
                    name);
            this.descriptorName = String.format("%s/%s$%s", parentDescriptor.getDescriptorName(), defType.toString(),
                    name);
            this.hashCode = this.qualifiedName.toLowerCase().hashCode();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_DEF_DESCRIPTOR_CREATION);
        }
        loggingService.incrementNum(LoggingService.DEF_DESCRIPTOR_COUNT);
    }

    @Override
    public DefDescriptor<P> getParentDescriptor() {
        return parentDescriptor;
    }

    @Override
    public DefType getDefType() {
        return defType;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getNamespace() {
        return parentDescriptor.getNamespace();
    }

    @Override
    public String getPrefix() {
        return parentDescriptor.getPrefix();
    }

    /**
     * @return Returns isParameterized.
     */
    @Override
    public boolean isParameterized() {
        return false;
    }

    @Override
    public String getNameParameters() {
        return null;
    }

    @Override
    public String getQualifiedName() {
        return qualifiedName;
    }

    @Override
    public String getDescriptorName() {
        return descriptorName;
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
        if (o instanceof SubDefDescriptorImpl) {
            SubDefDescriptorImpl<?, ?> e = (SubDefDescriptorImpl<?, ?>) o;
            return defType == e.defType && name.equals(e.name) && parentDescriptor.equals(e.parentDescriptor);
        }
        return false;
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    public static <Sub extends Definition, Par extends Definition> SubDefDescriptor<Sub, Par> getInstance(String name,
            DefDescriptor<Par> pDesc, Class<Sub> defClass) {
        return new SubDefDescriptorImpl<Sub, Par>(pDesc, name, defClass);
    }

    public static <Sub extends Definition, Par extends Definition> SubDefDescriptor<Sub, Par> getInstance(
            String qualifiedName, Class<Sub> defClass, Class<Par> parClass) {

        Matcher matcher = SUBDEF_PATTERN.matcher(qualifiedName);
        if (matcher.matches()) {
            String parentName = matcher.group(1);
            String name = matcher.group(3);
            DefDescriptor<Par> parentDescriptor = DefDescriptorImpl.getInstance(parentName, parClass);
            return getInstance(name, parentDescriptor, defClass);

        } else {
            throw new AuraRuntimeException(String.format("Invalid Descriptor Format: %s", qualifiedName));
        }
    }

    @Override
    public T getDef() throws QuickFixException {
        return getParentDescriptor().getDef().getSubDefinition(this);
    }

    @Override
    public boolean exists() {
        throw new AuraError("cannot check existence of a subdef as it requires compiling the parent def");
    }

    /**
     * Compares one {@link DefDescriptor} to another. Sorting uses (only) the
     * qualified name, case insensitively. Per {@link Comparable}'s spec, throws
     * {@link ClassCastException} if {@code arg} is not a {@code DefDescriptor}.
     */
    @Override
    public int compareTo(DefDescriptor<?> other) {
        return DefDescriptorImpl.compare(this, other);
    }
}
