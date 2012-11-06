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

import org.auraframework.def.DefDescriptor;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

public class DefModel implements JsonSerializable, Comparable<DefModel>{

    private final DefDescriptor<?> descriptor;

    DefModel(DefDescriptor<?> descriptor){
        this.descriptor = descriptor;
    }

    public String getDescriptor() {
        return descriptor.getQualifiedName();
    }

    public String getDefType(){
        return descriptor.getDefType().name().toLowerCase();
    }

    public String getFullName(){
        if(descriptor.getPrefix().equals("markup")){
            return String.format("%s:%s", descriptor.getNamespace(), descriptor.getName());
        }else{
            return getDescriptor();
        }
    }

    public String getName(){
        if(descriptor.getPrefix().equals("markup")){
            return AuraTextUtil.initCap(getDefType());
        }else{
            return String.format("%s://%s", descriptor.getPrefix(), getDefType());
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("defType", getDefType());
        json.writeMapEntry("name", getName());
        json.writeMapEntry("fullname", getFullName());
        json.writeMapEnd();
    }

    @Override
    public int compareTo(DefModel o) {
        return getFullName().compareTo(o.getFullName());
    }

}
