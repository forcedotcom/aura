package org.auraframework.test.root.parser.handler;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class RequiredVersionDefHandlerTest extends AuraImplTestCase {

	public RequiredVersionDefHandlerTest(String name) {
		super(name);
	}
	
	public void testRequiredVersionPositiveCase() throws Exception {
		String markup = "<aura:require namespace='auratest' version='1.0'/>";
		DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
        desc.getDef();
    }
	
	//test when namespace is missing, same thing apply to version
	public void testRequiredVersionMissNamespace() throws Exception {
		String markup = "<aura:require version='1.0'/>";
		try {
			DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
			desc.getDef();
			fail("we are suppose to error out when namespace is missing");
		} catch (Exception e) {
			checkExceptionContains(e, InvalidDefinitionException.class,
                    "Attribute 'namespace' and 'version' are required on <aura:require>");
		}
    }
	
	//test when namespace is empty, samething apply to version
	public void testRequiredVersionEmptyNamespace() throws Exception {
		String markup = "<aura:require namespace='' version='1.0'/>";
		try {
			DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
			desc.getDef();
			fail("we are suppose to error out when namespace is empty");
		} catch (Exception e) {
			checkExceptionContains(e, InvalidDefinitionException.class,
                    "Attribute 'namespace' and 'version' are required on <aura:require>");
		}
        
    }
	
	//test when namespace doesn't exsit -- there is currently no check for that.
	public void _testRequiredVersionInvalidNamespace() throws Exception {
		String markup = "<aura:require namespace='I do not exist' version='1.0'/>";
		try { 
			DefDescriptor<ComponentDef> desc = getSimpleCmpDesc(markup);
			desc.getDef();
			fail("we don't error out when namespace doesn't exist?");
		} catch (Exception e) {
			//System.out.println(e.getMessage());
		}
    }

    private DefDescriptor<ComponentDef> getSimpleCmpDesc(String markup) {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, "", markup));
        return cmpDesc;
    }

}
