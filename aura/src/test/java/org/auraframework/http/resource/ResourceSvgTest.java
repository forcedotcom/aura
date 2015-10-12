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

package org.auraframework.http.resource;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.test.util.UnitTestCase;
import org.mockito.Mockito;

public class ResourceSvgTest extends UnitTestCase {

	public ResourceSvgTest(String name) {
		super(name);
	}
	
	/**
     * Unit Test, Name is API!.
     */
    public void testName() {
        assertEquals("resources.svg", new ResourceSvg().getName());
    }

    /**
     * Unit Test, Format is API!.
     */
    public void testFormat() {
        assertEquals(Format.SVG, new ResourceSvg().getFormat());
    }
    
    /**
     * Verify that we set the correct contentType to response
     */
    public void testSetContentType() {
    	ResourceSvg resourceSvg = new ResourceSvg();
    	ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
    	resourceSvg.setServletUtilAdapter(servletUtilAdapter);
    	Mockito.when(servletUtilAdapter.getContentType(AuraContext.Format.SVG))
        .thenReturn("image/svg+xml");
    	
    	DummyHttpServletResponse response = new DummyHttpServletResponse() {
            String contentType = "defaultType";

            @Override
            public String getContentType() {
                return this.contentType;
            }

            @Override
            public void setContentType(String contentType) {
                this.contentType = contentType;
            }
        };
    	
    	resourceSvg.setContentType(response);
    	
    	assertEquals("image/svg+xml", response.getContentType());
    }
}
