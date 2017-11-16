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
package org.auraframework.components.perf;

import java.util.HashMap;
import java.util.Map;

public class Graph {
    private Node root;
    private Map<String, Node> nodes;

    public Graph(Node node) {
        this.root = node;
        this.nodes = new HashMap<>();
        nodes.put(node.getDescriptor().getQualifiedName(), node);
    }

    public void addNodeIfAbsent(Node node) {
        if (nodes.containsKey(node.getDescriptor().getQualifiedName())) {
            return;
        }
        nodes.put(node.getDescriptor().getQualifiedName(), node);
    }

    public void addEdge(Node from, Node to) {
        from.addEgress(to);
        to.addIngress(from);
    }

    public Node findNode(String descriptor) {
        return this.nodes.get(descriptor);
    }

    public Node getRoot() {
        return this.root;
    }

    public Map<String, Node> getNodes() {
        return this.nodes;
    }
}
