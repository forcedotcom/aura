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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.NamespaceXMLParser;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class NamespaceDefHandlerTest extends AuraImplTestCase {

	public NamespaceDefHandlerTest(String name) {
		super(name);
	}
	
	/**
	 * Verify the namespaceXMLParser works.
	 * @throws Exception
	 */
	public void testNamespaceXMLParser() throws Exception {
	    	DefDescriptor<NamespaceDef> descriptor = DefDescriptorImpl.getInstance("namespace"+":fakeNamespaceFile", NamespaceDef.class);
	    	StringSource<NamespaceDef> source = new StringSource<>(
	                descriptor,
	                "<aura:namespace>"+
					    "<style>"+
					        "<tokens>"+
					            "<FOO>red</FOO>"+
					            "<GRADIENT>to bottom, hsl(0, 80%, 70%), #bada55</GRADIENT>"+
					        "</tokens>"+
					        "body{"+
				                "margin: 0;"+
				                "padding: 0;"+
				            "}"+
					    "</style>"+
					"</aura:namespace>",
	                "myID", Format.XML);
	    	NamespaceXMLParser parser = new NamespaceXMLParser();
	    	NamespaceDef def = parser.parse(descriptor, source);
	        assertNotNull(def);
	        assertEquals("red", def.getStyleTokens().get("FOO"));
	}
	
	/**
	 * Verify the namespaceXMLParser error out when we put other tags (we only accept <style>) inside <aura:namespace>.
	 * the string source we use is a copy from namespaceDefTest/namespaceDefTest.xml
	 * @throws Exception
	 */
	public void testNamespaceXMLParserErrorOut() throws Exception {
	    	DefDescriptor<NamespaceDef> descriptor = DefDescriptorImpl.getInstance("namespace"+":fakeNamespaceFile", NamespaceDef.class);
	    	StringSource<NamespaceDef> source = new StringSource<>(
	                descriptor,
	                "<aura:namespace>"+
					    "<bla>"+
					    "</bla>"+
					"</aura:namespace>",
	                "myID", Format.XML);
	    	NamespaceXMLParser parser = new NamespaceXMLParser();
	    	NamespaceDef def = parser.parse(descriptor, source);
	    	try {
	    		def.validateDefinition();
	    		fail("Should have thrown AuraException because non-style tag inside aura:namespace");
	        } catch (InvalidDefinitionException e) {
	        	checkExceptionContains(e, InvalidDefinitionException.class, 
	                    "Found unexpected tag bla");
	        }
	}

}
