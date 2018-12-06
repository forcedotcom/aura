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
package org.auraframework.modules;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.lwc.CompilerReport;
import org.lwc.classmember.ClassMember;
import org.lwc.decorator.DecoratorParameterValue;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

/**
 * POJO with the data ModulesCompilerService generates
 */
public final class ModulesCompilerData {

    public final Map<CodeType, String> codes;
    public final Set<String> bundleDependencies;
    public final Set<String> labels;
    public final Set<ClassMember> publicProperties;
    public final Set<ClassMember> publicMethods;
    public final Set<ClassMember> publicSlots;
    public final Set<WireDecoration> wireDecorations;
    public final CompilerReport compilerReport;

    public ModulesCompilerData(
            Map<CodeType, String> codes,
            Set<String> bundleDependencies,
            Set<String> labels,
            Set<ClassMember> publicProperties,
            Set<ClassMember> publicMethods,
            Set<ClassMember> publicSlots,
            Set<WireDecoration> wireDecorations) {
        this(codes, bundleDependencies, labels, publicProperties, publicMethods, publicSlots, wireDecorations, null);
    }

    public ModulesCompilerData(
            Map<CodeType, String> codes,
            Set<String> bundleDependencies,
            Set<String> labels,
            Set<ClassMember> publicProperties,
            Set<ClassMember> publicMethods,
            Set<ClassMember> publicSlots,
            Set<WireDecoration> wireDecorations,
            CompilerReport report) {
        this.codes = codes;
        this.bundleDependencies = bundleDependencies;
        this.labels = labels;
        this.publicProperties = publicProperties;
        this.publicMethods = publicMethods;
        this.publicSlots = publicSlots;
        this.wireDecorations = wireDecorations;
        this.compilerReport = report;
    }

    public static final class WireDecoration implements Serializable {
        private static final long serialVersionUID = 6260256431012350935L;
        public final String type;
        public final String name;
        public final WireAdapter adapter;
        public final Map<String, String> params;
        public final Map<String, DecoratorParameterValue> staticFields;

        public WireDecoration(
                String type,
                String name,
                WireAdapter adapter,
                Map<String, String> params,
                Map<String, DecoratorParameterValue> staticFields) {
            this.type = type;
            this.name = name;
            this.adapter = adapter;
            this.params = params;
            this.staticFields = staticFields;
        }
    }

    public static final class WireAdapter implements Serializable {
        private static final long serialVersionUID = 5266256731423939088L;
        public final String name;
        public final String reference;

        public WireAdapter(String name, String reference) {
            this.name = name;
            this.reference = reference;
        }
    }

}
