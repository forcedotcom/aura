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
import java.util.List;

import org.auraframework.def.DocumentationDef;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

public class DocumentationDefModel implements JsonSerializable {

	private final DocumentationDef docDef;

	DocumentationDefModel(DocumentationDef docDef) {
		this.docDef = docDef;
	}

	public String getDescriptor() {
		return this.docDef.getDescriptor().getQualifiedName();
	}
	
	public List<String> getDescriptions() {
		return this.docDef.getDescriptions();
	}
	
	public boolean getHasExamples() {
		return !this.docDef.getExampleDefs().isEmpty();
	}

	@Override
	public void serialize(Json json) throws IOException {
		json.writeMapBegin();
		json.writeMapEntry("descriptor", getDescriptor());
		json.writeMapEntry("descriptions", getDescriptions());
		json.writeMapEntry("hasExamples", getHasExamples());
		json.writeMapEnd();
	}
}