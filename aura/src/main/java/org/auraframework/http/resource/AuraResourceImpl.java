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

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraResource;

public abstract class AuraResourceImpl implements AuraResource {
    private final String name;
    private final Format format;

    protected DefinitionService definitionService = Aura.getDefinitionService();
    protected ServletUtilAdapter servletUtilAdapter = Aura.getServletUtilAdapter();

    public AuraResourceImpl(String name, Format format) {
        this(name, format, false);
    }
    
    @Deprecated
    public AuraResourceImpl(String name, Format format, boolean CSRFProtect) {
        this.name = name;
        this.format = format;
    }

    @Override
    public void setContentType(HttpServletResponse response) {
    	response.setContentType( this.servletUtilAdapter.getContentType(this.format) );
    }
    
    @Override
    public abstract void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException;

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Format getFormat() {
        return format;
    }

    /**
     * Injection override.
     *
     * @param definitionService the definitionService to set
     */
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    /**
     * Injection override.
     *
     * @param servletUtilAdapter the servletUtilAdapter to set
     */
    public void setServletUtilAdapter(ServletUtilAdapter servletUtilAdapter) {
        this.servletUtilAdapter = servletUtilAdapter;
    }

    @Deprecated
	@Override
	public boolean isCSRFProtect() {
		return false;
	}
};

