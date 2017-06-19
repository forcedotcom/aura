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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

public class Node implements JsonSerializable{

    DefDescriptor<? extends Definition> descriptor;
    List<Node> ingress = new ArrayList<>();
    List<Node> egress = new ArrayList<>();
    private int size = 0;

    public Node(DefDescriptor<? extends Definition> descr) {
        this.descriptor = descr;
    }

    public void addIngress(Node n) {
        this.ingress.add(n);
    }

    public void addEgress(Node n) {
        this.egress.add(n);
    }

    public void setOwnSize(int size) {
        this.size = size;
    }

    public DefDescriptor<? extends Definition> getDescriptor() {
        return this.descriptor;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("type", this.descriptor.getDefType().toString());
        json.writeMapEntry("ownSize", this.size);
        json.writeMapEntry("ingressNum", ingress.size());

        json.writeMapKey("callers");
        json.writeArrayBegin();
        for (Node n : ingress) {
            json.writeArrayEntry(n.toString());
        }
        json.writeArrayEnd();

        json.writeMapKey("callees");
        json.writeArrayBegin();
        for (Node n : egress) {
            json.writeArrayEntry(n.toString());
        }
        json.writeArrayEnd();

        json.writeMapEnd();
    }

    @Override
    public String toString() {
        return descriptor.getQualifiedName();
    }

}
