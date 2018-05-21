
    
(function () {
    window.pageStartTime = (new Date()).getTime();
    window.Aura || (window.Aura = {});
    window.Aura.bootstrap || (window.Aura.bootstrap = {});
    window.Aura.appBootstrap = {
  "inlined":true,
  "data":{
    "app":{
      "componentDef":{
        "descriptor":"markup://performance:bootstrap"
      },
      "creationPath":"/*[0]"
    }
  }
};
;(function() {
    window.Aura.bootstrap.execBootstrapJs = window.performance && window.performance.now ? window.performance.now() : Date.now();
    window.Aura.appBootstrapStatus = "loaded";
    if (window.Aura.afterBootstrapReady && window.Aura.afterBootstrapReady.length) {
        var queue = window.Aura.afterBootstrapReady;
        window.Aura.afterBootstrapReady = [];
        for (var i = 0; i < queue.length; i++) {
           queue[i]();
        }
    }
}());

    var time = window.performance && window.performance.now ? window.performance.now.bind(performance) : function(){return Date.now();};
    window.Aura.bootstrap.execInlineJs = time();

    window.Aura.inlineJsLoaded = true;

    var auraConfig = {"deftype":"APPLICATION","ns":{"privileged":["privilegedNS","privilegedNS1","testPrivilegedNS1","testPrivilegedNS2"],"internal":["actionsTest","alpha","appCache","attributesTest","aura","auraNativeTest","auraStorage","auraStoragePerformanceTest","auraStorageTest","auradev","auradocs","aurajstest","auratest","beta","bootstrapTest","clientApiTest","clientLibraryTest","clientServiceTest","cmpQueryLanguage","componentTest","crossTabTest","definitionServiceImplTest","dependencyTest","docstest","expressionTest","facetTest","flavorTest","flavorTestAlt","frameworkPerformanceTest","gvpTest","handleEventTest","ifTest","injectActionTest","integrationService","iterationPerformanceTest","iterationTest","lintTest","listTest","loadLevelTest","locatorTest","lockerApiTest","lockerPerformance","lockerTest","lockerTestOtherNamespace","metricsPluginTest","miscTest","module","moduleTest","namespaceDefTest","performance","performanceTest","preloadTest","provider","renderingTest","schemas","secureModuleTest","secureothernamespace","setAttributesTest","string","string1","styleServiceTest","test","tokenProviderTest","tokenSanityTest","ui","uiExamples","uitest","updateTest","uriAddressable","utilTest","validationTest","valueChange"]},"host":"","context":{
  "mode":"DEV",
  "app":"performance:bootstrap",
  "pathPrefix":"",
  "fwuid":"xv2kUkKRMZ9TjUqX_nCfYg",
  "uad":1,
  "loaded":{
    "APPLICATION@markup://performance:bootstrap":"lo2rH2gGi8scH3j4sxxfrg"
  },
  "globalValueProviders":[
    {
      "type":"$Locale",
      "values":{
        "userLocaleLang":"en",
        "userLocaleCountry":"US",
        "language":"en",
        "country":"US",
        "variant":"",
        "langLocale":"en_US",
        "nameOfMonths":[
          {
            "fullName":"January",
            "shortName":"Jan"
          },
          {
            "fullName":"February",
            "shortName":"Feb"
          },
          {
            "fullName":"March",
            "shortName":"Mar"
          },
          {
            "fullName":"April",
            "shortName":"Apr"
          },
          {
            "fullName":"May",
            "shortName":"May"
          },
          {
            "fullName":"June",
            "shortName":"Jun"
          },
          {
            "fullName":"July",
            "shortName":"Jul"
          },
          {
            "fullName":"August",
            "shortName":"Aug"
          },
          {
            "fullName":"September",
            "shortName":"Sep"
          },
          {
            "fullName":"October",
            "shortName":"Oct"
          },
          {
            "fullName":"November",
            "shortName":"Nov"
          },
          {
            "fullName":"December",
            "shortName":"Dec"
          },
          {
            "fullName":"",
            "shortName":""
          }
        ],
        "nameOfWeekdays":[
          {
            "fullName":"Sunday",
            "shortName":"SUN"
          },
          {
            "fullName":"Monday",
            "shortName":"MON"
          },
          {
            "fullName":"Tuesday",
            "shortName":"TUE"
          },
          {
            "fullName":"Wednesday",
            "shortName":"WED"
          },
          {
            "fullName":"Thursday",
            "shortName":"THU"
          },
          {
            "fullName":"Friday",
            "shortName":"FRI"
          },
          {
            "fullName":"Saturday",
            "shortName":"SAT"
          }
        ],
        "labelForToday":"Today",
        "firstDayOfWeek":1,
        "timezone":"Australia/Sydney",
        "isEasternNameStyle":false,
        "dateFormat":"MMM d, yyyy",
        "datetimeFormat":"MMM d, yyyy h:mm:ss a",
        "timeFormat":"h:mm:ss a",
        "numberFormat":"#,##0.###",
        "decimal":".",
        "grouping":",",
        "zero":"0",
        "percentFormat":"#,##0%",
        "currencyFormat":"¤#,##0.00",
        "currencyCode":"USD",
        "currency":"$",
        "dir":"ltr"
      }
    },
    {
      "type":"$Browser",
      "values":{
        "isIE11":false,
        "isWEBKIT":false,
        "formFactor":"DESKTOP",
        "isIE10":false,
        "isBlackBerry":false,
        "isIE7":false,
        "isIE6":false,
        "isIE9":false,
        "isIE8":false,
        "isTablet":false,
        "isIPad":false,
        "isWindowsTablet":false,
        "isPhone":false,
        "isFIREFOX":false,
        "isWindowsPhone":false,
        "isAndroid":false,
        "isIPhone":false,
        "isIOS":false
      }
    },
    {
      "type":"$Global",
      "values":{
        "isVoiceOver":{
          "writable":true,
          "defaultValue":false
        },
        "dynamicTypeSize":{
          "writable":true,
          "defaultValue":""
        }
      }
    }
  ],
  "enableAccessChecks":true,
  "ls":1,
  "csp":1,
  "fr":1,
  "mna":{
    "alpha":"beta"
  },
  "c":1
},"attributes":{"jwt":"TESTJWT"},"descriptor":"markup://performance:bootstrap","pathPrefix":"","token":"aura","MaxParallelXHRCount":6,"XHRExclusivity":false};
    auraConfig.context.styleContext = {
  "c":"other",
  "cuid":106069776
};

    function auraPreInitBlock () {
        
    }

    function initFramework () {
        window.Aura = window.Aura || {};
        window.Aura.app = auraConfig["context"]["app"];
        window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || [];
        window.Aura.beforeFrameworkInit.push(auraPreInitBlock);
        window.Aura.inlineJsReady = time();

        if (!window.Aura.frameworkJsReady) {
            window.Aura.initConfig = auraConfig;
        } else {

            // LockerService must be initialized before scripts can be executed.
            $A.lockerService.initialize(auraConfig.context);

            // scripts inside custom templates with Locker active are stored
            // until now since we need LockerService before running

            var scripts = window.Aura.inlineJsLocker;
            if (scripts) {
                for (var i = 0; i < scripts.length; i++) {
                    $A.lockerService.runScript(scripts[i]["callback"], scripts[i]["namespace"]);
                }
                delete window.Aura.inlineJsLocker;
            }

            if (true) {
                $A.initAsync(auraConfig);
            } else if (false) {
                $A.initConfig(auraConfig);
            }
        }
    }

    // Error msg
    var x = document.getElementById('dismissError');
    if (x) {
        x.addEventListener("click", function () {
            var auraErrorMask = document.getElementById('auraErrorMask');
            if (window['$A']) {
                $A.util.removeClass(auraErrorMask, 'auraForcedErrorBox');
                $A.util.removeClass($A.util.getElement('auraErrorReload'), 'show');
            } else {
                document.body.removeChild(auraErrorMask);
            }
        });
    }

    setTimeout(initFramework, 0); // ensure async

    

    var appCssLoadingCount = 0;
    function onLoadStyleSheets(event) {
        var element = event.target;
        element.removeEventListener('load',onLoadStyleSheets);
        element.removeEventListener('error',onLoadStyleSheets);
        window.Aura.bootstrap.appCssLoading = (--appCssLoadingCount) > 0;
        if (!window.Aura.bootstrap.appCssLoading) {
            if (typeof window.Aura.bootstrap.appCssLoadedCallback === "function") {
                window.Aura.bootstrap.appCssLoadedCallback();
                window.Aura.bootstrap.appCssLoadedCallback = undefined;
            }
        }
    }



    var auraCss = document.getElementsByClassName('auraCss');
    var current;
    window.Aura.bootstrap.appCssLoading = auraCss.length > 0;
    for (var c=0,length=auraCss.length;c<length;c++) {
        current = auraCss[c];
        appCssLoadingCount++;
        current.addEventListener('load',onLoadStyleSheets);
        current.addEventListener('error',onLoadStyleSheets);
        current.href = current.getAttribute("data-href");
    }
}());

    