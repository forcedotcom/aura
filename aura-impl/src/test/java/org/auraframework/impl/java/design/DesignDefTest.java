package org.auraframework.impl.java.design;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DesignDef;
import org.auraframework.impl.AuraImplTestCase;

public class DesignDefTest extends AuraImplTestCase {

    public DesignDefTest(String name) {
        super(name);
    }

    public void testLoadFakeDesignDefinition() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeComponent", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
    }

    public void testLoadFakeDesignWithAttributes() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeDesign", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
        Map<String, AttributeDesignDef> attrs = c.getAttributeDesignDefs();
        assertFalse("Unable to parse AttributeDesignDefs on DesignDef!", attrs == null || attrs.size() == 0);
        AttributeDesignDef attr = attrs.get("something");
        assertNotNull("AttributeDesignDef something not found!", attr);
    }
}
