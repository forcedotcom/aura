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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class IncludeDefModel extends DefModel{
	
    IncludeDefModel(DefDescriptor<IncludeDef> descriptor) {
		super(descriptor);
	}

	public String getIncludeDefName() {
        if (this.descriptor.getDefType() == DefType.INCLUDE) {
        	@SuppressWarnings("unchecked")
			DefDescriptor<IncludeDef> include = (DefDescriptor<IncludeDef>) descriptor;
        	try {
				return include.getDef().getName();
			} catch (QuickFixException e) {
				e.printStackTrace();
			}
        }
        return null;
    }
	
    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("defType", getDefType());
        json.writeMapEntry("name", getName());
        json.writeMapEntry("fullname", getFullName());
        json.writeMapEntry("includeDefName", getIncludeDefName());
        json.writeMapEnd();
    }
}
