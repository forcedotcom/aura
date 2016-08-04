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
package org.auraframework.docs;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.ds.servicecomponent.ModelInstance;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 */
@ServiceComponentModelInstance
public class DocsTopicsModel implements ModelInstance {

    private DefinitionService definitionService;

    private final List<Node> applications;
    private final List<Node> components;
    private final List<Node> interfaces;
    private final List<Node> events;
    private final List<Node> librariesList;
    private final List<Node> tests;

    public DocsTopicsModel(DefinitionService definitionService) throws QuickFixException {
        this.definitionService = definitionService;
        applications = makeNodes("markup", DefType.APPLICATION);
        components = makeNodes("markup", DefType.COMPONENT);
        interfaces = makeNodes("markup", DefType.INTERFACE);
        events = makeNodes("markup", DefType.EVENT);
        librariesList = makeNodes("markup", DefType.LIBRARY);
        tests = makeNodes("js", DefType.TESTSUITE);
    }

    private <E extends Definition> List<Node> makeNodes(String prefix, DefType type) throws QuickFixException {
        // if (!Config.isProduction()) {
        List<Node> ret = Lists.newArrayList();

        Map<String, Node> namespaceNodes = Maps.newHashMap();
        DescriptorFilter matcher = new DescriptorFilter(String.format("%s://*:*", prefix), type);
        Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);
        for (DefDescriptor<?> desc : descriptors) {
            String namespace = desc.getNamespace();
            Node namespaceNode = namespaceNodes.get(desc.getNamespace());
            if (namespaceNode == null) {
                namespaceNode = new Node(namespace);
                namespaceNodes.put(namespace, namespaceNode);
                ret.add(namespaceNode);
            }
            namespaceNode.addChild(new Node(String.format("%s:%s", prefix.equals("markup") ? namespace : prefix
                    + "://" + namespace, desc.getName())));
        }
        Collections.sort(ret);
        return ret;
        // } else {
        // return null;
        // }
    }

    @AuraEnabled
    public List<Node> getApplications() {
        return applications;
    }

    @AuraEnabled
    public List<Node> getComponents() {
        return components;
    }

    @AuraEnabled
    public List<Node> getEvents() {
        return this.events;
    }

    @AuraEnabled
    public List<Node> getLibraries() {
        return this.librariesList;
    }

    @AuraEnabled
    public List<Node> getInterfaces() {
        return this.interfaces;
    }

    @AuraEnabled
    public List<Node> getTests() {
        return this.tests;
    }

    public static class Node implements JsonSerializable, Comparable<Node> {

        private final String title;
        private List<Node> children;

        public Node(String title) {
            this.title = title;
        }

        public void addChild(Node child) {
            if (this.children == null) {
                this.children = Lists.newArrayList();
            }
            this.children.add(child);
        }

        @Override
        public void serialize(Json json) throws IOException {
            if (children != null) {
                Collections.sort(children);
            }
            json.writeMapBegin();
            json.writeMapEntry("title", title);
            json.writeMapEntry("children", children);
            json.writeMapEnd();
        }

        public List<Node> getChildren() {
            return this.children;
        }

        public String getTitle() {
            return this.title;
        }

        @Override
        public int compareTo(Node o) {
            if (this.equals(o)) {
                return 0;
            }
            return title.compareTo(o.title);
        }

    }
}
