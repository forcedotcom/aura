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
package org.auraframework.instance;

import java.util.Map;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;

/**
 */
public class ComponentConfig {

    private DefDescriptor<ComponentDef> descriptor;
    private Map<String, Object> attributes;
    private boolean shouldSerializeToClient = false;

    public void setDescriptor(DefDescriptor<ComponentDef> descriptor) {
        this.descriptor = descriptor;
    }

    public DefDescriptor<ComponentDef> getDescriptor() {
        return this.descriptor;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    @Override
    public String toString() {
        return String.format("%s(%s)", this.getClass(), this.descriptor);
    }

	public boolean getShouldSerializeToClient() {
		return shouldSerializeToClient;
	}

	/**
	 * Indicates that the component should always be serialized to the client when it's created on the server
	 * regardless of whether or not it's client-side creatable. 
	 * 
	 * @param shouldSerializeToClient true if the component should be serialized to the client
	 */
	public void setShouldSerializeToClient(boolean shouldSerializeToClient) {
		this.shouldSerializeToClient = shouldSerializeToClient;
	}
}
