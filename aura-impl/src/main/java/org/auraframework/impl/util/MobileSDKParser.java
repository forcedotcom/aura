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

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * MobileSDKParser - Parses user agent to retrieve MobileSDK Info.
 *
 *
 */
public class MobileSDKParser {
    
    public static final String SALESFORCE_MOBILE_SDK = "salesforcemobilesdk/";
 
    public static final Pattern SALESFORCE_MOBILE_SDK_GENERIC_PATTERN = Pattern.compile("(?<version>[Ss]alesforce[Mm]obile[Ss][Dd][Kk]\\/[^\\s]+)\\s+[^\\(]+\\((?<model>.+?)\\)\\s+(?<appName>.+?)\\/(?<appVersion>[^\\s]+)\\s+(\\(.+?\\)\\s+)?(?<appType>[^\\s]+)\\s+(?<uid>[^\\s]+)\\s+(?<ftr>[^\\s]+).*");

    public static final String MOBILE_SDK_VERSION = "version";
    public static final String MOBILE_SDK_MODEL = "model";
    public static final String MOBILE_SDK_APP_NAME = "appName";
    public static final String MOBILE_SDK_APP_VERSION = "appVersion";
    public static final String MOBILE_SDK_APP_TYPE = "appType";
    public static final String MOBILE_SDK_APP_DEVICE_UID = "uid";
    public static final String MOBILE_SDK_APP_FEATURE = "ftr";
    /**
     * 
     *
     * Refer to this doc https://salesforce.quip.com/DpJBA9gevL1D for examples and UserAgent format for Mobile apps.
     *
     * @param userAgent Input String
     * @return Optional of MobileSDK for valid SalesforceMobileSDK user agents and Optional of empty for invalid user agents.
     */
    public static Optional<MobileSDK> parse(String userAgent) {

		if (userAgent == null || !userAgent.regionMatches(true, 0, SALESFORCE_MOBILE_SDK, 0, SALESFORCE_MOBILE_SDK.length())) {
			return Optional.empty();
		}

		Matcher matcher = SALESFORCE_MOBILE_SDK_GENERIC_PATTERN.matcher(userAgent);

		if (!matcher.matches()) {
			return Optional.empty();
		}

		MobileSDK mobileSDK = new MobileSDK.Builder().
							version(matcher.group(MOBILE_SDK_VERSION))
							.model(matcher.group(MOBILE_SDK_MODEL))
							.appName(matcher.group(MOBILE_SDK_APP_NAME))
							.appVersion(matcher.group(MOBILE_SDK_APP_VERSION))
							.appType(matcher.group(MOBILE_SDK_APP_TYPE))
							.appDeviceUid(matcher.group(MOBILE_SDK_APP_DEVICE_UID))
							.appFeature(matcher.group(MOBILE_SDK_APP_FEATURE))
							.build();

		return Optional.of(mobileSDK);
		
    }
}
