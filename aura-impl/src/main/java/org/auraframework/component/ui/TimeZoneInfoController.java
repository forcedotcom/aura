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
package org.auraframework.component.ui;

import java.io.*;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.util.IOUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.resource.ResourceLoader;

/**
 * Provide time zone information based on IANA (Olson) database (http://www.iana.org/time-zones).
 * 
 */
@Controller
public class TimeZoneInfoController {
    private static Map<String, String> cache = Collections.synchronizedMap(new HashMap<String, String>(1));

    @AuraEnabled
    public static TimeZoneInfo getTimeZoneInfo(@Key("timezoneId") String timezoneId) throws Exception {
        if (timezoneId == null) {
            return null; 
        }
        String info = cache.get(timezoneId);
        if (info == null) {
            info = readTZInfoFromFile(timezoneId);
            if (info != null) {
                cache.put(timezoneId, info);
            }
        }
        return new TimeZoneInfo(info);
    }
    
    private static String readTZInfoFromFile(String timezoneId) {
        ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
        String suffix = timezoneId.replace("/", "-");
        String resStr = "/aura/resources/walltime-js/olson/walltime-data_" + suffix + ".js";
        InputStream in = resourceLoader.getResourceAsStream(resStr);
        try {
            return in == null ? null : formatTZInfo(IOUtil.readText(new InputStreamReader(in)));
        } catch (IOException ioE) {
            return null;
        }
    }
    
    private static String formatTZInfo(String info) {
        StringBuffer result = new StringBuffer(info);
        int dataIndex = result.indexOf("window.WallTime.data");
        if (dataIndex < 0) {
            return info;
        }
        result = result.delete(0, dataIndex);
        int start = result.indexOf("{");
        if (start < 0) {
            start = 0;
        }
        int autoinitIndex = result.indexOf("window.WallTime.autoinit");
        if (autoinitIndex < 0) {
            autoinitIndex = result.length();
        }
        result = result.delete(autoinitIndex, result.length());
        int end = result.lastIndexOf("}");
        if (end < 0) {
            end = result.length();
        }
        return result.substring(start, end + 1);
    }
    
    public static class TimeZoneInfo implements JsonSerializable {
        
        private String info = null;
        
        public TimeZoneInfo(String info) {
            this.info = info;
        }
        
        public String getInfo(){
        	return this.info;
        }
        
        @Override
        public void serialize(Json json) throws IOException {
            if (this.info == null) {
                json.writeString("");
            } else {
                json.writeLiteral(this.info);
            }
        }
    }
}