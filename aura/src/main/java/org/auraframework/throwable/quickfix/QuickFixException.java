/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.throwable.quickfix;

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.system.Location;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraException;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.ImmutableList;

/**
 * An exception that contains a list of potential automated fixes
 * for the problem, which the client code or user can choose from
 * and invoke before retrying the original action that threw this
 * Exception.
 */
public abstract class QuickFixException extends AuraException implements JsonSerializable{
    private static final long serialVersionUID = 2050170532486579614L;
    private final List<AuraQuickFix> quickFixes;

    public QuickFixException(String message, Location l, AuraQuickFix... quickFixes) {
        super(message, l, null, null);
        this.quickFixes = (quickFixes == null) ? null : ImmutableList.copyOf(quickFixes);
    }

    /**
     * @return Returns the quickFixes.
     */
    public List<AuraQuickFix> getQuickFixes() {
        return quickFixes;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("message", getMessage());
        if (Aura.getContextService().isEstablished() && Aura.getContextService().getCurrentContext().getMode() != Mode.PROD) {
            json.writeMapEntry("stack", AuraExceptionUtil.getStackTrace(this));
            json.writeMapEntry("location", getLocation());
        }
        json.writeMapEntry("quickFixes", getQuickFixes());
        json.writeMapEnd();
    }
}
