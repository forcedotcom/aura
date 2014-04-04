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
				return include.getDef().getLibraryName();
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
