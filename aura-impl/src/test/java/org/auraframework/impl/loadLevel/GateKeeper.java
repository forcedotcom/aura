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

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.auraframework.throwable.AuraRuntimeException;

/**
 * A 'gatekeeper' to controll and maintain gating between the client and server.
 *
 * This is a helper class used by GatedModel, GatedModelController, and AuraStorage tests.
 *
 * Examples of usage are in loadLevelTest:lazyLoadHelper.cmp
 *
 * This is not intended to be overly robust against misuse, and it is particularly prone to issues
 * if multiple tests use the same gate id. This should be avoided.
 */
public class GateKeeper {
    private static class Gate {
        private final CountDownLatch latch = new CountDownLatch(1);
        private final long time = System.currentTimeMillis();
    }

    static private ConcurrentHashMap<String, Gate> pending = new ConcurrentHashMap<String, Gate>();

    /**
     * Internal routine to get a gate.
     *
     * @param id the id for the gate (must not be null)
     * @return a gate (never null).
     */
    private static Gate getGate(String id) {
        Gate gate = pending.get(id);
        if (gate != null && gate.time < System.currentTimeMillis() - 60000) {
            pending.remove(id);
            throw new AuraRuntimeException("Uncleared gate of "+id);
        }
        if (gate == null) {
            pending.putIfAbsent(id, new Gate());
            gate = pending.get(id);
        }
        return gate;
    }

    /**
     * Wait for a gate to expire or be released.
     */
    public static void waitForGate(String id) throws InterruptedException {
        if (!getGate(id).latch.await(60, TimeUnit.SECONDS)) {
            throw new AuraRuntimeException("GateKeeper "+id
                                           +" never released - This is probably a test bug in a different test.");
        }
    }

    /**
     * Release a gate (can be waiting or not).
     */
    public static void releaseGate(String id) {
        Gate gate = getGate(id);
        if (gate.latch.getCount() <= 0) {
            throw new AuraRuntimeException("Double release of latch being removed at "+id);
        }
        gate.latch.countDown();
    }

    /**
     * Clear a gate (should be complete).
     */
    public static void clearGate(String id) {
        if (!pending.containsKey(id)) {
            throw new AuraRuntimeException("Unexpected key removal of "+id);
        }
        Gate gate = pending.remove(id);
        if (gate.latch.getCount() > 0) {
            throw new AuraRuntimeException("Unreleased latch being removed at "+id);
        }
    }
}
