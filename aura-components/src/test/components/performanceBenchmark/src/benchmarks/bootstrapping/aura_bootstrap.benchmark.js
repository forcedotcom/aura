const $A = window.$A;
const aura = window.Aura;

var instanceConstructor;

const auraConfig = {"deftype":"APPLICATION","ns":{"privileged":["privilegedNS","privilegedNS1","testPrivilegedNS1","testPrivilegedNS2"],"internal":["actionsTest","alpha","appCache","attributesTest","aura","auraNativeTest","auraStorage","auraStoragePerformanceTest","auraStorageTest","auradev","auradocs","aurajstest","auratest","beta","bootstrapTest","clientApiTest","clientLibraryTest","clientServiceTest","cmpQueryLanguage","componentTest","crossTabTest","definitionServiceImplTest","dependencyTest","docstest","expressionTest","facetTest","flavorTest","flavorTestAlt","frameworkPerformanceTest","gvpTest","handleEventTest","ifTest","injectActionTest","integrationService","iterationPerformanceTest","iterationTest","lintTest","listTest","loadLevelTest","locatorTest","lockerApiTest","lockerPerformance","lockerTest","lockerTestOtherNamespace","metricsPluginTest","miscTest","module","moduleTest","namespaceDefTest","performance","performanceTest","preloadTest","provider","renderingTest","schemas","secureModuleTest","secureothernamespace","setAttributesTest","string","string1","styleServiceTest","test","tokenProviderTest","tokenSanityTest","ui","uiExamples","uitest","updateTest","uriAddressable","utilTest","validationTest","valueChange"]},"host":"","context":{
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

describe("aura_bootstrap", () => {

    benchmark('new_aura_instance', () => {
        before(() => {
            instanceConstructor = $A.constructor;
        });

        run(() => {
            return new instanceConstructor;
        });
    });

    benchmark('init_framework', () => {
        run( async () => {
            await $A.initAsync(auraConfig);
        });
    });
});