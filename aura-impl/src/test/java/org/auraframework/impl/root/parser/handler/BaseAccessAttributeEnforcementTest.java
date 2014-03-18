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
package org.auraframework.impl.root.parser.handler;

import java.util.ArrayList;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.Source;
import org.auraframework.throwable.NoAccessException;

public abstract class BaseAccessAttributeEnforcementTest extends AuraImplTestCase {

	public BaseAccessAttributeEnforcementTest(String name) {
		super(name);
	}

	protected void verifyAccess(TestResource[] consumers) throws Exception {
		ArrayList<String> failures = new ArrayList<String>();

		for (TestResource consumer : consumers) {
			testConsumer = consumer;

			for (TestNamespace targetNamespace : TestNamespace.values()) {
				testResourceNamespace = targetNamespace;

				for (TestNamespace consumerNamespace : TestNamespace.values()) {					
					testConsumerNamespace = consumerNamespace;
					try {
						runTestCase();
					} catch (Throwable e) {
						failures.add(e.getMessage());
					}				
				}
			}
		}

		if (!failures.isEmpty()) {
			String message = "\n";
			for (int i = 0; i < failures.size(); i++) {
				message += failures.get(i);
				if (i != failures.size() - 1) {
					message += ",\n";
				}
			}

			fail("Test failed with " + failures.size() + " errors:" + message);
		}
	}

	protected void runTestCase() throws Exception {								
		String resourceSource;
		
		if(testResource == TestResource.RegisterEvent){		
			String eventSource = getResourceSource(TestResource.Event, "GLOBAL");
			DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(getDefClass(TestResource.Event), eventSource,
					getDefDescriptorName(TestResource.Event, true),
					(testResourceNamespace == TestNamespace.System || testResourceNamespace == TestNamespace.SystemOther ? true : false));
	
			String access = getAccess();
			String targetNamespace = getNamespaceValue(testResourceNamespace);			
			
			resourceSource = "<aura:component access='GLOBAL'>" +
							 "<aura:registerEvent name='testevent' type='"+targetNamespace+":"+eventDescriptor.getName()+"' " + (access != null ? "access='" + access + "'" : "") + " />" +			
							 "</aura:component> ";						
								
		} else{		
			resourceSource = getResourceSource();
								
		}
		
		// target
		DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(getDefClass(testResource), resourceSource,
				getDefDescriptorName(testResource, true),
				(testResourceNamespace == TestNamespace.System || testResourceNamespace == TestNamespace.SystemOther ? true : false));
								
		// consumer
		String consumerSource = getConsumerSource(descriptor.getName());
		DefDescriptor<? extends Definition> descriptorConsumer = getAuraTestingUtil().addSourceAutoCleanup(getDefClass(testConsumer), consumerSource,
				getDefDescriptorName(testConsumer, false),
				(testConsumerNamespace == TestNamespace.System || testConsumerNamespace == TestNamespace.SystemOther ? true : false));

		Source<? extends Definition> source = StringSourceLoader.getInstance().getSource(descriptorConsumer);
		try {
			Definition def = parser.parse(descriptorConsumer, source);
			def.validateDefinition();

			descriptorConsumer.getDef();

			if (!isValidTestCase()) {
				fail("Should have thrown Exception when " + testResourceNamespace + "." + testResource + " is " + testCase + " and used in "
						+ testConsumerNamespace + "." + testConsumer);
			}
		} catch (NoAccessException e) {
			if (isValidTestCase()) {
				fail("Should not have thrown Exception when " + testResourceNamespace + "." + testResource + " is " + testCase + " and used in "
						+ testConsumerNamespace + "." + testConsumer);
			}
		}
	}

	private String getDefDescriptorName(TestResource resource, boolean isTarget) {
		String name = null;
		String namespace = "";

		if (isTarget) {
			namespace = getNamespaceValue(testResourceNamespace);			
		} else {
			namespace = getNamespaceValue(testConsumerNamespace);			
		}

		switch (resource) {
		case Application:
			name = namespace + ":testapplication";
			break;

		case Component:
			name = namespace + ":testcomponent";
			break;

		case Interface:
			name = namespace + ":testinterface";
			break;

		case Attribute:
			name = namespace + ":testcomponent";
			break;

		case Event:
			name = namespace + ":testevent";
			break;
			
		case RegisterEvent:
			name = namespace + ":testregisterevent";
			break;			
		}

		return name;
	}

	private Class<? extends Definition> getDefClass(TestResource resource) {
		Class<? extends Definition> classDef = null;
		switch (resource) {
		case Application:
			classDef = ApplicationDef.class;
			break;
		case Component:
			classDef = ComponentDef.class;
			break;
		case Interface:
			classDef = InterfaceDef.class;
			break;
		case Attribute:
			classDef = ComponentDef.class;
			break;
		case Event:
			classDef = EventDef.class;
			break;
		case RegisterEvent:
			classDef = ComponentDef.class;
		}

		return classDef;
	}
	
	private String getResourceSource() {		
		return getResourceSource(testResource, getAccess());
	}

	private String getResourceSource(TestResource testResource, String access) {
		String resource = testResource.toString().toLowerCase();		
		String source = null;

		if (testResource == TestResource.Application || testResource == TestResource.Component) {
			String extensible = testResourceNamespace == TestNamespace.System || testResourceNamespace == TestNamespace.SystemOther ? " extensible='true'" : "";  
			source = "<aura:" + resource + extensible + (access != null ? " access='" + access + "'" : "") + " />";
		} else if (testResource == TestResource.Interface) {
			source = "<aura:interface " + (access != null ? "access='" + access + "'" : "") + " />";
		} else if (testResource == TestResource.Attribute) {
			source = "<aura:component access='GLOBAL'>";
			source += "<aura:attribute name='testattribute' type='String' " + (access != null ? "access='" + access + "'" : "") + " />";
			source += "</aura:component> ";
		} else if (testResource == TestResource.Event) {			
			source = "<aura:event type='COMPONENT' " + (access != null ? "access='" + access + "'" : "") + " />";
		} 
		/*
		else if (testResource == TestResource.RegisterEvent) {			
			source = "<aura:component access='GLOBAL'>";
			source += "<aura:registerEvent name='testevent' type='ui:change' " + (access != null ? "access='" + access + "'" : "") + " />";			
			source += "</aura:component> ";			
		}
		*/
		return source;
	}		

	private String getConsumerSource(String targetName) {
		String resourceName = testConsumer.toString().toLowerCase();

		String targetNamespace = getNamespaceValue(testResourceNamespace);		

		String source = null;
		String extendsClause = " extends='" + targetNamespace + ":" + targetName + "'";
		if (testResource == TestResource.Application) {
			source = "<aura:" + resourceName + " > ";
			source += "<" + targetNamespace + ":" + targetName + " /> ";
			source += "</aura:" + resourceName + "> ";
		} else if (testResource == TestResource.Component) {			
			source = "<aura:" + resourceName + "> ";
			source += "<" + targetNamespace + ":" + targetName + " /> ";
			source += "</aura:" + resourceName + "> ";			
		} else if (testResource == TestResource.Interface) {
			if (testConsumer == TestResource.Component) {
				source = "<aura:" + resourceName + " implements='" + targetNamespace + ":" + targetName + "' /> ";
			} else {
				source = "<aura:" + resourceName + extendsClause + " /> ";
			}
		} else if (testResource == TestResource.Attribute) {
			source = "<aura:" + resourceName + "> ";
			source += "<" + targetNamespace + ":" + targetName + " testattribute='' /> ";
			source += "</aura:" + resourceName + "> ";
		} else if (testResource == TestResource.Event) {			
			if (testConsumer == TestResource.Event) {				
				source = "<aura:event type='COMPONENT' " + extendsClause + " /> ";
			} else{
				source = "<aura:component>";				
				source += "<aura:registerEvent name='testevent' type='"+targetNamespace+":"+targetName+"' />";				
				source += "</aura:component> ";								
			}
		} else if (testResource == TestResource.RegisterEvent) {	
			source = "<aura:" + resourceName + "> ";
			source += "<" + targetNamespace + ":" + targetName + " testevent='{!c.action}' /> ";
			source += "</aura:" + resourceName + "> ";							
		}

		return source;
	}

	private String getAccess() {
		StringBuffer access = new StringBuffer();

		if (testCase.toString().contains("DEFAULT")) {
			return null;
		}

		boolean isDynamic = false;
		if (testCase.toString().endsWith("DYNAMIC")) {
			isDynamic = true;
		}

		if (testCase.toString().contains("GLOBAL")) {
			if (!isDynamic) {
				access.append("GLOBAL");
			} else {
				return "org.auraframework.test.TestAccessMethods.allowGlobal";
			}
		}

		if (testCase.toString().contains("PUBLIC")) {
			if (!isDynamic) {
				access.append("PUBLIC");
			} else {
				return "org.auraframework.test.TestAccessMethods.allowPublic";
			}
		}

		if (testCase.toString().contains("PRIVATE")) {
			if (!isDynamic) {
				access.append("PRIVATE");
			} else {
				return "org.auraframework.test.TestAccessMethods.allowPrivate";
			}
		}

		if (testCase.toString().contains("INTERNAL")) {
			if (!isDynamic) {
				access.append("INTERNAL");
			} else {
				return "org.auraframework.test.TestAccessMethods.allowInternal";
			}
		}

		return access.toString();
	}

	private boolean isValidTestCase() {
		String access = getAccess();

		if (access == null) {
			access = "PUBLIC";
		}

		if (access.startsWith("org.auraframework.test.TestAccessMethods.")) {
			String[] vals = access.split("\\.");
			String val = vals[vals.length - 1];

			access = val.toUpperCase();
		}

		if (testConsumerNamespace == TestNamespace.System || testConsumerNamespace == TestNamespace.SystemOther) {

			// TODO Revisit it again. system namespace has access to everything.
			// if(testResourceNamespace == TestNamespace.System ||
			// testResourceNamespace == TestNamespace.SystemOther){
			if (!access.equals("PRIVATE")) {
				return true;
			}
			// }

		} else {
			if (access.equals("GLOBAL")) {
				return true;
			}

			if (access.equals("PUBLIC") && testConsumerNamespace == testResourceNamespace) {
				return true;
			}
		}

		return false;
	}
	
	private String getNamespaceValue(TestNamespace namespace){
		switch (namespace) {
		case Custom:
			return StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE;

		case CustomOther:
			return StringSourceLoader.OTHER_CUSTOM_NAMESPACE;

		case SystemOther:
			return StringSourceLoader.OTHER_NAMESPACE;
			
		default:
			return StringSourceLoader.DEFAULT_NAMESPACE;			
		}
	}

	XMLParser parser = XMLParser.getInstance();

	protected TestCase testCase;
	protected TestResource testResource;
	protected TestResource testConsumer;
	protected TestNamespace testResourceNamespace;
	protected TestNamespace testConsumerNamespace;

	protected enum TestResource {
		Application, Component, Interface, Attribute, Event, RegisterEvent
	};

	protected enum TestNamespace {
		System, SystemOther, Custom, CustomOther
	};

	protected enum TestCase {
		DEFAULT, GLOBAL, PUBLIC, PRIVATE, INTERNAL
	};

}