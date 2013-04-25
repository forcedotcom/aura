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
package org.auraframework.impl.loadLevel;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.auraframework.Aura;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

import org.apache.log4j.Logger;

import org.auraframework.throwable.AuraRuntimeException;

/**
 * A model to allow the client to control server speed.
 *
 * This model, in conjunction with {@link GatedModelController} provides a client side latch
 * mechanism on the server. The way this is managed is via the 'waitId' attribute to initialize
 * the model (which then freezes), and two functions on the controller: resumeGateId, and clearGateId
 *
 * Examples of usage are in loadLevelTest:lazyLoadHelper.cmp
 *
 * This is not intended to be overly robust against misuse, and it is particularly prone to issues
 * if multiple tests use the same gate id. This should be avoided.
 */
@Model
public class GatedModel {
    private static final Logger logger = Logger.getLogger("GatedModel");

    private static class LatchMemory {
        private final CountDownLatch latch = new CountDownLatch(1);
        private final long time = System.currentTimeMillis();
    }

    static private ConcurrentHashMap<String, LatchMemory> pending = new ConcurrentHashMap<String, LatchMemory>();

    public static CountDownLatch getLatch(String id) {
        LatchMemory latch = pending.get(id);
        if (latch != null && latch.time < System.currentTimeMillis() - 60000) {
            logger.error("Uncleared latch at "+id);
            pending.remove(id);
            latch = null;
        }
        if (latch == null) {
            pending.putIfAbsent(id, new LatchMemory());
            latch = pending.get(id);
        }
        return latch.latch;
    }

    public static void clearLatch(String id) {
        if (!pending.containsKey(id)) {
            logger.error("Unexpected key removal of "+id);
        }
        LatchMemory lm = pending.remove(id);
        if (lm.latch.getCount() > 0) {
            logger.error("Unreleased latch being removed at "+id);
        }
    }

    public GatedModel() throws Exception {
        Aura.getContextService().getCurrentContext().getComponents();
        Aura.getContextService().getCurrentContext().getGlobalProviders();
        String id = null;
        try {
            id = (String) Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes()
                    .getValue("waitId");
        } catch (Throwable t) {
            return;
        }
        if (id != null) {
            CountDownLatch latch = getLatch(id);
            if (!latch.await(60, TimeUnit.SECONDS)) {
                throw new AuraRuntimeException("Latch "+id+" never released");
            }
        }
    }

    @AuraEnabled
    public List<String> getStringList() {
        ArrayList<String> sl = new ArrayList<String>();
        sl.add("foo");
        sl.add("bar");
        sl.add("beer");
        return sl;
    }

    @AuraEnabled
    public String getString() {
        BaseComponent<?, ?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        String str = (String) component.getAttributes().getExpression("stringAttribute");
        return str;
    }
}
