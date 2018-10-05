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
package org.auraframework.pojo;

import java.io.Serializable;

/**
 * aura:description 
 * Holds aura:documentation description name and body
 */
public class Description implements Serializable {

    private static final long serialVersionUID = 1L;
    private final String name;
    private final String body;
    
    public Description(String name, String body) {
        this.name = name;
        this.body = body;
    }

    public String getName() {
        return name;
    }

    public String getBody() {
        return body;
    }
    
    @Override
    public String toString() {
        return this.body;
    }
}
