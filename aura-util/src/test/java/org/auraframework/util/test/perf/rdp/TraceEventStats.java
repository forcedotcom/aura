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
package org.auraframework.util.test.perf.rdp;

import java.util.Map;

public class TraceEventStats {
    private final TraceEvent event;
    private int count;
    private long totalMicros;
    private long startTime;
    private long endTime;
    private Map<String, Object> memoryCounters;

    public TraceEventStats(TraceEvent event) {
        this.event = event;
    }

    public String getName(){
        return event.getName();
    }

    public TraceEvent getEvent(){
        return event;
    }

    public Map<String, Object> getMemoryCounters(){
        return memoryCounters;
    }

    public Object getValue(){
        if(event.getType().equals(TraceEvent.Type.Duration) || event.getType().equals(TraceEvent.Type.Complete))
            return getTotalMillis();
        else if(event.getType().equals(TraceEvent.Type.Instant)){
            // For Memory category, return map of memory counters i.e jsHeapSizeUsed etc.
            if(event.getName().equals("UpdateCounters")){
                return getMemoryCounters();
            }
        }
        return count;

    }
    /**
     * @return number of times the event type appears in the timeline
     */
    public int getCount() {
        return count;
    }

    public void updateTotalMicros(long elapsedMicros){
        totalMicros+= elapsedMicros;
    }

    public void updateMemoryCounters(Map<String, Object> data){
        this.memoryCounters = data;
    }

    /**
     * @return cumulative milliseconds for this type of event in the timeline
     */
    public long getTotalMillis() {
        return totalMicros / 1000;
    }

    public void resetTime(){
        setStartTime(0);
        setEndTime(0);
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(long endTime) {
        this.endTime = endTime;
    }

    public long getStartTime() {
        return this.startTime;
    }

    public long getEndTime() {
        return this.endTime;
    }

    public void updateCount(){
        count++;
    }

    @Override
    public String toString() {
        return event.getName() + '[' + count + ',' + getTotalMillis() + "ms]";
    }
}
