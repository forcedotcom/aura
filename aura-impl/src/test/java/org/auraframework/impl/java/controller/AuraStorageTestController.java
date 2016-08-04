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
package org.auraframework.impl.java.controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.BackgroundAction;
import org.auraframework.system.Annotations.CabooseAction;
import org.auraframework.system.Annotations.Key;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import javax.inject.Inject;
import java.io.IOException;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@ServiceComponent
public class AuraStorageTestController implements Controller {

    @Inject
    private TestContextAdapter testContextAdapter;

    @Inject
    private InstanceService instanceService;

    public ConcurrentHashMap<String, Integer> staticCounter = new ConcurrentHashMap<>();
    private Map<String, Map<String, Semaphore>> pending = new ConcurrentHashMap<>();
    private Map<String, List<Object>> buffer = Maps.newHashMap();
    private Map<String, Semaphore> executorLocks = new ConcurrentHashMap<>();

    private enum Command {
        RESET, WAIT, RESUME, APPEND, READ, STAMP, SLEEP, COPY;
    }

    @AuraEnabled
    public List<Object> execute(@Key("commands") String commands) throws Exception {
        String testName = testContextAdapter.getTestContext().getName();
        List<Object> result = Lists.newLinkedList();
        getExecutorLock(testName);
        try {
            for (String command : commands.split(";")) {
                String args[] = command.trim().split(" ", 2);
                String cmdArg = args.length > 1 ? args[1].trim() : "";
                Command cmd = Command.valueOf(args[0].trim().toUpperCase());
                switch (cmd) {
                case RESET:
                    /*
                     * When releasing blocked threads, those threads may continue running a set of commands that may
                     * create, remove, or update more semaphores. So, release blocked threads, clean up dangling
                     * semaphores, and repeat until all semaphores are gone.
                     */
                    for (Map<String, Semaphore> sems = pending.get(testName); sems != null && !sems.isEmpty(); sems = pending
                            .get(testName)) {
                        for (Iterator<Entry<String, Semaphore>> iterator = sems.entrySet().iterator(); iterator
                                .hasNext();) {
                            Semaphore current = iterator.next().getValue();
                            if (current.hasQueuedThreads()) {
                                current.release();
                            } else {
                                iterator.remove();
                            }
                        }
                        releaseExecutorLock(testName);
                        Thread.yield();
                        getExecutorLock(testName);
                    }
                    buffer.remove(testName);
                    break;
                case WAIT://let current action wait on cmdArg
                    Semaphore sem = getSemaphore(testName, cmdArg, true);
                    releaseExecutorLock(testName);
                    try {
                        if (!sem.tryAcquire(240, TimeUnit.SECONDS)) {
                            throw new AuraRuntimeException("Timed out waiting to acquire " + testName + ":" + cmdArg);
                        }
                    } finally {
                        getExecutorLock(testName);
                        if (!sem.hasQueuedThreads()) {
                            removeSemaphore(testName, cmdArg);
                        }
                    }
                    break;
                case RESUME://signal action that wait on cmdArg to continue
                    getSemaphore(testName, cmdArg, true).release();
                    break;
                case APPEND://add cmdArg to buffer
                    getBuffer(testName).add(cmdArg);
                    break;
                case READ: //get and remove info from buffer
                    List<Object> temp = buffer.remove(testName);
                    if (temp != null) {
                        result.addAll(temp);
                    }
                    break;
                case COPY://get info from buffer
                	List<Object> temp2 = buffer.get(testName);
                    if (temp2 != null) {
                        result.addAll(temp2);
                    }
                    break;
                case STAMP:
                    getBuffer(testName).add(new Date().getTime());
                    break;
                case SLEEP:
                    long millis = 500;
                    try {
                        millis = Long.parseLong(cmdArg);
                    } catch (Throwable t) {
                    }
                    try {
                        releaseExecutorLock(testName);
                        Thread.sleep(millis);
                    } finally {
                        getExecutorLock(testName);

                    }
                    break;
                }
            }
            return result;
        } finally {
            releaseExecutorLock(testName);
        }
    }

    @AuraEnabled
    @BackgroundAction
    public List<Object> executeBackground(@Key("commands") String commands) throws Exception {
        return execute(commands);
    }

    @AuraEnabled
    @CabooseAction
    public List<Object> executeCaboose(@Key("commands") String commands) throws Exception {
        return execute(commands);
    }

    @AuraEnabled
    public void block(@Key("testName") String testName) {
        getSemaphore(testName, null, true);
    }

    @AuraEnabled
    public void resume(@Key("testName") String testName) {
        getSemaphore(testName, null, false).release();
        removeSemaphore(testName, null);
    }

    @AuraEnabled
    public Record fetchDataRecord(@Key("testName") String testName) throws Exception {
        staticCounter.putIfAbsent(testName, 0);
        AuraStorageTestController.Record r = new AuraStorageTestController.Record(staticCounter.get(testName),
                "StorageController");
        staticCounter.put(testName, new Integer(staticCounter.get(testName).intValue() + 1));
        Semaphore lock = getSemaphore(testName, null, false);
        if (lock != null) {
            if (!lock.tryAcquire(15, TimeUnit.SECONDS)) {
                return null;
            }
        }
        return r;
    }

    /**
     * Create extra components, return value of the action is the same but getComponents() of the action differ, should
     * cause Action refresh to trigger a callback in the client
     */
    @AuraEnabled
    public RecordWithComponents fetchDataRecordWithComponents(@Key("testName") String testName,
                                                              @Key("extraComponentsCreated") Boolean extraComponentsCreated) throws Exception {
        staticCounter.putIfAbsent(testName, 0);
        // Create extra components the second time this server action is called.
        if (extraComponentsCreated != null && extraComponentsCreated && staticCounter.get(testName).intValue() == 1) {
            // Reset the counter so action return value is the same
            staticCounter.put(testName, 0);
            Map<String, Object> attr = Maps.newHashMap();
            // W-1859020 - W-1859020 - Revert to auraStorageTest:playerFacet
            // attr.put("value", ""+System.currentTimeMillis());
            instanceService.getInstance("uitest:hasModel", ComponentDef.class, attr);
        }
        AuraStorageTestController.RecordWithComponents r = new AuraStorageTestController.RecordWithComponents(
                staticCounter.get(testName),
                "StorageController");
        staticCounter.put(testName, new Integer(staticCounter.get(testName).intValue() + 1));
        Semaphore lock = getSemaphore(testName, null, false);
        if (lock != null) {
            if (!lock.tryAcquire(15, TimeUnit.SECONDS)) {
                return null;
            }
        }
        return r;
    }

    @AuraEnabled
    public int getInt(@Key("param") int param) throws Exception {
        return param;
    }

    @AuraEnabled
    public void resetCounter(@Key("testName") String testName) {
        if (testName != null) {
            staticCounter.remove(testName);
            removeSemaphore(testName, null);
            return;
        } else {
            for (String s : staticCounter.keySet()) {
                staticCounter.remove(s);
                removeSemaphore(s, null);
            }
        }
    }

    @AuraEnabled
    public void setCounter(@Key("testName") String testName, @Key("value") Integer value) {
        staticCounter.put(testName, value);
    }

    @AuraEnabled
    public List<Integer> string(@Key("testName") String testName, @Key("param1") Integer param1) {
        staticCounter.putIfAbsent(testName, 0);
        List<Integer> ret = Lists.newArrayList();
        ret.add(staticCounter.get(testName));
        ret.add(param1);
        staticCounter.put(testName, new Integer(staticCounter.get(testName).intValue() + 1));
        return ret;

    }

    @AuraEnabled
    public List<Integer> substring(@Key("testName") String testName, @Key("param1") Integer param1) {
        staticCounter.putIfAbsent(testName, 0);
        List<Integer> ret = Lists.newArrayList();
        ret.add(staticCounter.get(testName));
        ret.add(param1);
        staticCounter.put(testName, new Integer(staticCounter.get(testName).intValue() + 1));
        return ret;
    }

    /**
     * Object to represent return value for controller.
     */
    static class Record implements JsonSerializable {
        Integer counterValue;
        Object obj;

        Record(Integer counter, Object o) {
            this.counterValue = counter;
            this.obj = o;
        }

        public Integer getCounterValue() {
            return counterValue;
        }

        public Object getObject() {
            return obj;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("Counter", getCounterValue());
            json.writeMapEntry("Data", getObject() == null ? "" : getObject());
            json.writeMapEnd();
        }
    }

    /**
     * Object to represent return value for controller.
     */
    class RecordWithComponents implements JsonSerializable {
        Integer counterValue;
        Object obj;
        Component cmp;

        RecordWithComponents(Integer counter, Object o) {
            this.counterValue = counter;
            this.obj = o;
            Map<String, Object> attr = Maps.newHashMap();
            // attr.put("name", ""+ counterValue);
            // attr.put("nickName", "Counter" + counterValue);
            attr.put("class", "class_t " + counterValue);
            try {
                // W-1859020 - Revert to auraStorageTest:playerFacet
                // cmp = Aura.getInstanceService().getInstance("auraStorageTest:playerFacet", ComponentDef.class, attr);
                cmp = instanceService.getInstance("uitest:hasModel", ComponentDef.class, attr);
            } catch (QuickFixException e) {
                // Do nothing
            }
        }

        public Integer getCounterValue() {
            return counterValue;
        }

        public Object getObject() {
            return obj;
        }

        public Component getComponent() {
            return cmp;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("Counter", getCounterValue());
            json.writeMapEntry("Data", getObject() == null ? "" : getObject());
            if (getComponent() != null) {
                json.writeMapEntry("Component", getComponent());
            }
            json.writeMapEnd();
        }
    }

    private void getExecutorLock(String key) {
        Semaphore sem;
        synchronized (executorLocks) {
            sem = executorLocks.get(key);
            if (sem == null) {
                sem = new Semaphore(1, true);
                executorLocks.put(key, sem);
            }
        }
        sem.acquireUninterruptibly();
    }

    private void releaseExecutorLock(String key) {
        synchronized (executorLocks) {
            Semaphore sem = executorLocks.get(key);
            if (sem == null) {
                return;
            }
            sem.release();
            if (!sem.hasQueuedThreads()) {
                executorLocks.remove(key);
            }
        }
    }

    private Semaphore getSemaphore(String key, String subKey, boolean create) {
        if (key == null) {
            key = testContextAdapter.getTestContext().getName();
        }
        synchronized (pending) {
            Map<String, Semaphore> subSet = pending.get(key);
            if (subSet == null) {
                if (!create) {
                    return null;
                }
                subSet = new ConcurrentHashMap<>();
                pending.put(key, subSet);
            }

            if (subKey == null) {
                subKey = "";
            }
            Semaphore sem = subSet.get(subKey);
            if (sem == null) {
                if (!create) {
                    return null;
                }
                sem = new Semaphore(0, true);
                subSet.put(subKey, sem);
            }
            return sem;
        }
    }

    private void removeSemaphore(String key, String subKey) {
        if (key == null) {
            key = testContextAdapter.getTestContext().getName();
        }
        synchronized (pending) {
            Map<String, Semaphore> subSet = pending.get(key);
            if (subSet == null) {
                return;
            }
            if (subKey == null) {
                subKey = "";
            }
            subSet.remove(subKey);
            if (subSet.isEmpty()) {
                pending.remove(key);
            }
        }
    }

    private synchronized List<Object> getBuffer(String key) {
        List<Object> list = buffer.get(key);
        if (list == null) {
            list = Lists.newLinkedList();
            buffer.put(key, list);
        }
        return list;
    }
}
