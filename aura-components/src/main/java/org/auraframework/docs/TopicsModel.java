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
package org.auraframework.docs;

import java.io.IOException;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 */
@Model
public class TopicsModel {

    private final List<Node> applications;
    private final List<Node> components;
    private final List<Node> interfaces;
    private final List<Node> events;
    private final List<Node> tests;

    public TopicsModel() throws QuickFixException {

        applications = makeNodes("markup", ApplicationDef.class);
        components = makeNodes("markup", ComponentDef.class);
        interfaces = makeNodes("markup", InterfaceDef.class);
        events = makeNodes("markup", EventDef.class);
        tests = makeNodes("js", TestSuiteDef.class);
    }

    private <E extends Definition> List<Node> makeNodes(String prefix, Class<E> type) throws QuickFixException {
//        if (!Config.isProduction()) {
            String sep = prefix.equals("markup") ? ":" : ".";
            DefinitionService definitionService = Aura.getDefinitionService();

            List<Node> ret = Lists.newArrayList();

            Map<String, Node> namespaceNodes = Maps.newHashMap();
            DefDescriptor<E> matcher = definitionService.getDefDescriptor(String.format("%s://*%s*", prefix, sep),
                    type);
            Set<DefDescriptor<E>> descriptors = definitionService.find(matcher);
            for (DefDescriptor<E> desc : descriptors) {
                String namespace = desc.getNamespace();
                Node namespaceNode = namespaceNodes.get(desc.getNamespace());
                if (namespaceNode == null) {
                    namespaceNode = new Node(namespace);
                    namespaceNodes.put(namespace, namespaceNode);
                    ret.add(namespaceNode);
                }
                namespaceNode.addChild(new Node(String.format("%s%s%s", prefix.equals("markup") ? namespace : prefix
                        + "://" + namespace, sep, desc.getName())));
            }
            Collections.sort(ret);
            return ret;
//        } else {
//            return null;
//        }
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
            if(this.equals(o)){
                return 0;
            }
            return title.compareTo(o.title);
        }

    }
}
