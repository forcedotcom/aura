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
package org.auraframework.util.type;

import java.io.IOException;

import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

public class CustomPairType implements JsonSerializable {
    private String strMember = null;
    private int intMember;

    public CustomPairType(String s, int i) {
        strMember = s;
        intMember = i;
    }

    public void setIntMember(int intMember) {
        this.intMember = intMember;
    }

    public int getIntMember() {
        return intMember;
    }

    public void setStrMember(String strMember) {
        this.strMember = strMember;
    }

    public String getStrMember() {
        return strMember;
    }

    @Override
    public int hashCode() {
        return this.intMember + this.strMember.hashCode();
    }

    @Override
    public boolean equals(Object other) {
        if (other instanceof CustomPairType) {
            if (((CustomPairType) other).getStrMember().equals(getStrMember())
                    && ((CustomPairType) other).getIntMember() == getIntMember()) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("strMember", getStrMember());
        json.writeMapEntry("intMember", getIntMember());
        json.writeMapEnd();

    }

}
