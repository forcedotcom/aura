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
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SVGDef;
import org.auraframework.http.AuraServlet;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.QuickFixException;

public class ResourceSvg extends AuraResourceImpl {
    private static final StringParam lookup = new StringParam(AuraServlet.AURA_PREFIX + "lookup", 0, false);
    private ServerService serverService = Aura.getServerService();

    public ResourceSvg() {
        super("resources.svg", Format.SVG, false);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException {
        try {
            //For Security and updating we require the host to validate the cache. Thus we need to overright
            //the original caching
            response.setHeader("Cache-Control", "no-cache");

            String fqn = lookup.get(request);
            if (fqn == null || fqn.isEmpty()) {
                fqn = context.getApplicationDescriptor().getQualifiedName();
            }
            DefDescriptor<SVGDef> svg = definitionService.getDefDescriptor(fqn, SVGDef.class);
            SVGDef def = svg.getDef();

            //Get the original etag if exists
            String etag = request.getHeader("If-None-Match");
            //generate the new etag from the definitions hash
            String hash = def.getOwnHash();
            //For security reasons, if the user fetches the svg from the browser directly we
            //force the browser to download the file
            if (request.getHeader("Referer") == null) {
                response.setContentType(null);
                response.setHeader("Content-Disposition", "attachment; filename=resources.svg");
                //Otherwise check the etag, if it matches that reply with a 304, unchanged
            } else if (etag != null && etag.equals(hash)) {
                response.setStatus(304);
                return;
            }
            //finally add the etag to the header and write the image
            response.setHeader("Etag", hash);
            serverService.writeAppSvg(svg, response.getWriter());
        } catch (QuickFixException qfe) {
            servletUtilAdapter.handleServletException(qfe, true, context, request, response, false);
        }
    }

    /**
     * @param serverService the serverService to set
     */
    public void setServerService(ServerService serverService) {
        this.serverService = serverService;
    }
}

