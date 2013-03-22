/**
 * Utility functionality for hybrid apps.
 * Note: This JS module assumes the inclusion of the Cordova JS library
 */

/**
 * Utilify functions for logging
 */
cordova.define("salesforce/util/logger", function(require, exports, module) {
    var appStartTime = (new Date()).getTime();  // Used for debug timing measurements.

    /**
     * Logs text to a given section of the page.
     *   section - id of HTML section to log to.
     *   txt - The text (html) to log.
     */
    var log = function(section, txt) {
        console.log("jslog: " + txt);
        if ((typeof debugMode !== "undefined") && (debugMode === true)) {
            var now = new Date();
            var fullTxt = "<p><i><b>* At " + (now.getTime() - appStartTime) + "ms:</b></i> " + txt + "</p>";
            var sectionElt = document.getElementById(section);
            if (sectionElt) {
                sectionElt.style.display = "block";
                document.getElementById(section).innerHTML += fullTxt;
            }
        }
    };

    /**
     * Logs debug messages to a "debug console" section of the page.  Only
     * shows when debugMode (above) is set to true.
     *   txt - The text (html) to log to the console.
     */
    var logToConsole = function(txt) {
        log("console", txt);
    };

    /**
     * Use to log error messages to an "error console" section of the page.
     *   txt - The text (html) to log to the console.
     */
    var logError = function(txt) {
        log("errors", txt);
    };

    /**
     * Sanitizes a URL for logging, based on an array of querystring parameters whose
     * values should be sanitized.  The value of each querystring parameter, if found
     * in the URL, will be changed to '[redacted]'.  Useful for getting rid of secure
     * data on the querystring, so it doesn't get persisted in an app log for instance.
     *
     * origUrl            - Required - The URL to sanitize.
     * sanitizeParamArray - Required - An array of querystring parameters whose values
     *                                 should be sanitized.
     * Returns: The sanitzed URL.
     */
    var sanitizeUrlParamsForLogging = function(origUrl, sanitizeParamArray) {
        var trimmedOrigUrl = origUrl.trim();
        if (trimmedOrigUrl === '')
            return trimmedOrigUrl;
        
        if ((typeof sanitizeParamArray !== "object") || (sanitizeParamArray.length === 0))
            return trimmedOrigUrl;
        
        var redactedUrl = trimmedOrigUrl;
        for (var i = 0; i < sanitizeParamArray.length; i++) {
            var paramRedactRegexString = "^(.*[\\?&]" + sanitizeParamArray[i] + "=)([^&]+)(.*)$";
            var paramRedactRegex = new RegExp(paramRedactRegexString, "i");
            if (paramRedactRegex.test(redactedUrl))
                redactedUrl = redactedUrl.replace(paramRedactRegex, "$1[redacted]$3");
        }
        
        return redactedUrl;
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        logToConsole: logToConsole,
        logError: logError,
        sanitizeUrlParamsForLogging: sanitizeUrlParamsForLogging
    };
});

cordova.define("salesforce/util/event", function(require, exports, module) {

    var logger = require("salesforce/util/logger");

    /**
     * Enumeration of event types.
     */
    var EventType = {
        AUTHENTICATING: {code: 0, description: "Authenticating...", isError: false},
        STARTING: {code: 1, description: "Loading application", isError: false},
        OFFLINE: {code: 2, description: "Your device is offline. Can't continue.", isError: true}
    };
           
    /**
     * Dispatches event with current status text and success indicator.
     */
    var sendStatusEvent = function(statusEvent) {
        if (statusEvent.isError) {
            logger.logError(statusEvent.description);
        } else {
            logger.logToConsole(statusEvent.description);
        }
        cordova.fireDocumentEvent('bootstrapStatusEvent', statusEvent);
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        EventType: EventType,
        sendStatusEvent: sendStatusEvent
    };
});

/**
 * Utility functions used at startup 
 */
cordova.define("salesforce/util/bootstrap", function(require, exports, module) {

    var logger = require("salesforce/util/logger");

    /**
     * RemoteAppStartData constructor - Represents the data associated with bootstrapping a
     * 'remote' app, i.e. a hybrid app with its content managed as a traditional server-side
     * web app, such as a Visualforce app.
     *
     *   appStartUrl        - Required - The "start page" of the hybrid application.
     *   isAbsoluteUrl      - Optional - Whether or not the start URL is a fully-qualified URL.
     *                                   Defaults to false.
     *   shouldAuthenticate - Optional - Whether or not to authenticate prior to loading the
     *                                   application.  Defaults to true.
     */
    var RemoteAppStartData = function(appStartUrl, isAbsoluteUrl, shouldAuthenticate) {
        if (typeof appStartUrl !== "string" || appStartUrl.trim() === "") {
            logger.logError("appStartUrl cannot be empty");
            return;
        }
        this.appStartUrl = appStartUrl;
        this.isRemoteApp = true;
        this.isAbsoluteUrl = (typeof isAbsoluteUrl !== "boolean" ? false : isAbsoluteUrl);
        this.shouldAuthenticate = (typeof shouldAuthenticate !== "boolean" ? true : shouldAuthenticate);
    };

    /**
     * LocalAppStartData constructor - Represents the data associated with bootstrapping a
     * 'local' app, i.e. a hybrid app with its content managed through a local web page,
     * such as a traditional Cordova app.
     *
     *   appStartUrl        - Optional - The local "start page" of the hybrid application.
     *                                   Defaults to "index.html".
     *   shouldAuthenticate - Optional - Whether or not to authenticate prior to loading the
     *                                   application.  Defaults to true.
     */
    var LocalAppStartData = function(appStartUrl, shouldAuthenticate) {
        this.appStartUrl = (typeof appStartUrl !== "string" || appStartUrl.trim() === "" 
                            ? "index.html" : appStartUrl);
        this.isRemoteApp = false;
        this.isAbsoluteUrl = false;
        this.shouldAuthenticate = (typeof shouldAuthenticate !== "boolean" ? true : shouldAuthenticate);
    };


    /**
     * Handler for Cordova's "deviceready" event, signifying that Cordova is successfully
     * loaded.
     */
    var onDeviceReady = function() {
        logger.logToConsole("onDeviceReady called: Cordova is ready.");
        var oauth = require("salesforce/plugin/oauth");
        var event = require("salesforce/util/event");

        // Validate the start data configuration.
        if (!isValidStartData(startData)) {
            return;
        }
        
        // If the device is offline, the following situations require us to fall back to looking for
        // cached data:
        //   - The start data points to a remote (e.g. Visualforce) application.
        //   - The start data points to a local application, but authentication is required for that app.
        var isDeviceOnline = deviceIsOnline();
        if (!isDeviceOnline &&
            ((startData instanceof RemoteAppStartData)
             || startData.shouldAuthenticate)) {
            // Only attempt to load cached data if the app allows it.  Default is true (if attemptOfflineLoad
            // is undefined), for backwards compatibility.
            if ((typeof attemptOfflineLoad === 'undefined') || attemptOfflineLoad === true) {
                logger.logToConsole("Device is OFFLINE.  Trying to load cached app data.");
                oauth.getAppHomeUrl(function (urlString) {
                    if (urlString === "") {
                        event.sendStatusEvent(event.EventType.OFFLINE);
                    } else {
                        logger.logToConsole("Trying to load cached app at " + urlString);
                        loadUrl(urlString);
                    }
                });
            } else {
                event.sendStatusEvent(event.EventType.OFFLINE);
            }
        } else {
            logger.logToConsole("Device is ONLINE, OR app is not otherwise required to be online.");
            if (startData.shouldAuthenticate) {
                logger.logToConsole("Authenticating with key [" + remoteAccessConsumerKey + "] and uri [" + oauthRedirectURI + "]");
                event.sendStatusEvent(event.EventType.AUTHENTICATING);

                // Authenticate via the Salesforce OAuth plugin.
                var oauthProperties = new oauth.OAuthProperties(remoteAccessConsumerKey, 
                                                                oauthRedirectURI, 
                                                                oauthScopes);
                oauth.authenticate(loginSuccess, loginFailure, oauthProperties);
            } else {
                if (startData instanceof LocalAppStartData) {
                    loadUrl(buildLocalUrl(startData.appStartUrl));
                } else {
                    loadUrl(startData.appStartUrl);
                }
            }
        }
    };

    /**
     * Creates the local URL to load.
     *   page - The local page value used to create the URL.
     * 
     * Returns:
     *   The local URL start page for the app.
     */
    var buildLocalUrl = function(page) {
        if (device.platform == "Android") {
            return buildAppUrl("file:///android_asset/www", page);
        }
        else {
            return page; 
        }
    };

    /**
     * Creates a fullly qualified URL from server and page information.
     * Example:
     *   var fullUrl = buildAppUrl("https://na1.salesforce.com", "apex/MyVisualForcePage");
     *
     *   server - The server URL prefix.
     *   page   - The page information to append to the server.
     * Returns:
     *   Full URL to the user's page, e.g. https://na1.salesforce.com/apex/MyVisualForcePage.
     */
    var buildAppUrl = function(server, page) {
        var trimmedServer = server.trim();
        var trimmedPage = page.trim();
        if (trimmedServer === "")
            return trimmedPage;
        else if (trimmedPage === "")
            return trimmedServer;
        
        // Manage '/' between server and page URL on the page var side.
        if (trimmedServer.charAt(trimmedServer.length-1) === '/')
            trimmedServer = trimmedServer.substr(0, trimmedServer.length-1);
        
        if (trimmedPage === "" || trimmedPage === "/")
            return trimmedServer + "/";
        if (trimmedPage.charAt(0) !== '/')
            trimmedPage = "/" + trimmedPage;
        
        return trimmedServer + trimmedPage;
    };

    /**
     * Creates the initial entry page to the service, for pages that are hosted on Salesforce.
     * This function pretty much assumes OAuth authentication has occurred, as it requires
     * data that has been returned as part of the authentication process.
     *
     * instanceServer - Required - The instance where the page will be hosted.
     * startPage      - Required - The start page portion of the URL (e.g. /apex/MyPage).
     * accessToken    - Required - The access / SID token used to authenticate the user.
     *
     * Returns: The full URL required to load the requested start page on the service.
     */
    var buildFrontDoorUrl = function(instanceServer, startPage, accessToken) {
        var baseUrl = buildAppUrl(instanceServer, "/secur/frontdoor.jsp");
        var fullUrl = baseUrl + "?sid=" + encodeURIComponent(accessToken) 
            + "&retURL=" + encodeURIComponent(startPage) + "&display=touch";
        return fullUrl;
    };

    /**
     * Load the given URL, using Cordova on Android, and loading directly on other platforms.
     *   fullAppUrl       - The URL to load.
     */
    var loadUrl = function(fullAppUrl) {
        if (device.platform == "Android") {
            navigator.app.loadUrl(fullAppUrl , {clearHistory:true});
        }
        else {
            location.href = fullAppUrl;
        }
    };
    
    /**
     * Determine whether the device is online.
     */
    var deviceIsOnline = function() {
        var connType;
        if (navigator && navigator.connection) {
            connType = navigator.connection.type;
            logger.logToConsole("deviceIsOnline connType: " + connType);
        } else {
            logger.logToConsole("deviceIsOnline connType is undefined.");
        }
        
        if (typeof connType !== 'undefined') {
            // Cordova's connection object.  May be more accurate?
            return (connType != null && connType != Connection.NONE && connType != Connection.UNKNOWN);
        } else {
            // Default to browser facility.
    	    return navigator.onLine;
        }
    };

    /**
     * Validates that the start data conforms to the business rules.
     */
    var isValidStartData = function(startData) {
        if (!(startData instanceof LocalAppStartData || startData instanceof RemoteAppStartData)) {
            logger.logError("startData is not a valid object type.  Expecting LocalAppStartData or RemoteAppStartData.");
            return false;
        }
        
        if ((startData instanceof RemoteAppStartData)
            && startData.isAbsoluteUrl === false
            && startData.shouldAuthenticate === false) {
            logger.logError("startData.isAbsoluteUrl and startData.shouldAuthenticate cannot both be false for a remote app.  "
                            + "The instance URL determined from authentication is used to build the absolute URL.");
            return false;
        }
        
        return true;
    };

    /**
     * Success callback for the authenticate() method.
     */
    var loginSuccess = function(oauthCredentials) {
        logger.logToConsole("loginSuccess");
        var fullAppUrl;
        var event = require("salesforce/util/event");
        if (startData instanceof LocalAppStartData) {
            fullAppUrl =  buildLocalUrl(startData.appStartUrl);
        } else if (startData instanceof RemoteAppStartData) {
            if (startData.isAbsoluteUrl) {
                fullAppUrl = startData.appStartUrl;
            } else {
                fullAppUrl = buildFrontDoorUrl(oauthCredentials.instanceUrl, startData.appStartUrl, oauthCredentials.accessToken);
            }
        }
        logger.logToConsole("fullAppUrl: " + logger.sanitizeUrlParamsForLogging(fullAppUrl, [ "sid" ]));
        event.sendStatusEvent(event.EventType.STARTING);
        loadUrl(fullAppUrl);
    };
    
    /**
     * Error callback for the authenticate() method.
     * TODO: Is there more that we'd want to do here?
     */
    var loginFailure = function(result) {
        logger.logToConsole("loginFailure: " + result);
        logger.logError("loginFailure: " + result);
    };


    /**
     * Part of the module that is public
     */
    module.exports = {
        deviceIsOnline: deviceIsOnline,
        onDeviceReady: onDeviceReady,
        LocalAppStartData: LocalAppStartData,
        RemoteAppStartData: RemoteAppStartData
    };
});

/**
 * Helper function used to call the native side
 */
cordova.define("salesforce/util/exec", function(require, exports, module) {

    var exec = function(pluginVersion, successCB, errorCB, service, action, args) {
        var defaultSuccessCB = function() {
            console.log(service + ":" + action + " succeeded");
        };

        var defaultErrorCB = function() {
            console.log(service + ":" + action + " failed");
        };

        successCB = typeof successCB !== "function" ? defaultSuccessCB : successCB;
        error = typeof errorCB !== "function" ? defaultErrorCB : errorCB;

        args.unshift("pluginSDKVersion:" + pluginVersion);
        // NOTE: This code has been hacked by the Mobile Platform team in order to
        // have SFHybridApp work with both real cordova and mock cordova.
        var exec = cordova.exec;
        if(exec === "undefined" ) {
            exec = cordova.require("cordova/exec");
        }
        return exec(successCB, errorCB, service, action, args);
        // End Hack             
    };

    /**
     * Part of the module that is public
     */
    module.exports = {
        exec: exec
    };
});

cordova.define("salesforce/plugin/sdkinfo", function(require, exports, module) {
    // Version this js was shipped with
    var SDK_VERSION = "1.4";

    var SERVICE = "com.salesforce.sdkinfo";

    var exec = require("salesforce/util/exec").exec;

    /**
      * SDKInfo data structure
      */
    var SDKInfo = function(sdkVersion, forcePluginsAvailable, appName, appVersion) {
        this.sdkVersion = sdkVersion;
        this.forcePluginsAvailable = forcePluginsAvailable;
        this.appName = appName;
        this.appVersion = appVersion;
    };

    /**
     * Returns a populated SDKInfo object (via a callback)
     */
    var getInfo = function(successCB, errorCB) {
        exec(SDK_VERSION, successCB, errorCB, SERVICE, "getInfo", []);
    };


    /**
     * Part of the module that is public
     */
    module.exports = {
        getInfo: getInfo,

        // Constructor
        SDKInfo: SDKInfo
    };
});

// For backward compatibility
var SFHybridApp = {
    LocalAppStartData: cordova.require("salesforce/util/bootstrap").LocalAppStartData,
    RemoteAppStartData: cordova.require("salesforce/util/bootstrap").RemoteAppStartData,
    logToConsole: cordova.require("salesforce/util/logger").logToConsole,
    logError: cordova.require("salesforce/util/logger").logError
};
