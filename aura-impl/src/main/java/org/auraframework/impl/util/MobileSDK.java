package org.auraframework.impl.util;

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

import java.util.Objects;

/**
 * MobileSDK - Class to hold Mobile SDK Info
 */
public class MobileSDK {

    private String version;
    private String model;
    private String appName;
    private String appVersion;
    private String appType;
    private String appDeviceUid;
    private String appFeature;

    private MobileSDK(String version, String model, String appName, String appVersion, String appType, String appDeviceUid, String appFeature) {
        this.version = version;
        this.model = model;
        this.appName = appName;
        this.appVersion = appVersion;
        this.appType = appType;
        this.appDeviceUid = appDeviceUid;
        this.appFeature = appFeature;
    }

    public String getVersion() {
        return version;
    }

    public String getModel() {
        return model;
    }

    public String getAppName() {
        return appName;
    }

    public String getAppVersion() {
        return appVersion;
    }

    public String getAppType() {
        return appType;
    }
    
    public String getAppDeviceUid() {
        return appDeviceUid;
    }
    
    public String getAppFeature() {
        return appFeature;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("MobileSDK{");
        sb.append("version='").append(version).append('\'');
        sb.append(", model='").append(model).append('\'');
        sb.append(", appName='").append(appName).append('\'');
        sb.append(", appVersion='").append(appVersion).append('\'');
        sb.append(", appType='").append(appType).append('\'');
        sb.append(", appDeviceUid='").append(appDeviceUid).append('\'');
        sb.append(", appFeature='").append(appFeature).append('\'');
        sb.append('}');
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MobileSDK mobileSDK = (MobileSDK) o;
        return Objects.equals(version, mobileSDK.version) &&
                Objects.equals(model, mobileSDK.model) &&
                Objects.equals(appName, mobileSDK.appName) &&
                Objects.equals(appVersion, mobileSDK.appVersion) &&
                Objects.equals(appType, mobileSDK.appType) &&
                Objects.equals(appDeviceUid, mobileSDK.appDeviceUid) &&
                Objects.equals(appFeature, mobileSDK.appFeature);
    }

    @Override
    public int hashCode() {
        return Objects.hash(version, model, appName, appVersion, appType, appDeviceUid, appFeature);
    }

    public static class Builder {

        private String version;
        private String model;
        private String appName;
        private String appVersion;
        private String appType;
        private String appDeviceUid;
        private String appFeature;

        public Builder() {
        }

        public Builder version(String version){
            this.version = version;
            return this;
        }

        public Builder model(String device){
            this.model = device;
            return this;
        }

        public Builder appName(String appName){
            this.appName = appName;
            return this;
        }
        public Builder appVersion(String appVersion){
            this.appVersion = appVersion;
            return this;
        }

        public Builder appType(String appType){
            this.appType = appType;
            return this;
        }
        public Builder appDeviceUid(String appDeviceUid){
            this.appDeviceUid = appDeviceUid;
            return this;
        } 
        public Builder appFeature(String appFeature){
            this.appFeature = appFeature;
            return this;
        }
        public MobileSDK build(){
            return new MobileSDK(version, model, appName, appVersion, appType, appDeviceUid, appFeature);
        }
    }
}
