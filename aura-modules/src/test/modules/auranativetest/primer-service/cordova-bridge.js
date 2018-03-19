/*
* THIS IS JUST AN EXAMPLE OF A POSSIBLE INTEGRATION WITH CORDOVA
*/

// $A.get("$Label.test.task_mode_today");
const LABEL_EXAMPLE_MOCK =
`while(1);
{
  "actions":[
    {
      "id":"15;a",
      "state":"SUCCESS",
      "returnValue":"Today",
      "error":[

      ],
      "storable":true,
      "action":"aura://LabelController/ACTION$getLabel",
      "params":{
        "section":"test",
        "name":"task_mode_today"
      }
    }
  ],
  "context":{
    "mode":"DEV",
    "app":"nativeTest:hydration",
    "fwuid":"lXV6utBgzk7XJDutjC_Wjw",
    "loaded":{
      "APPLICATION@markup://nativeTest:hydration":"6EGW-xDVJdnzSa32EQvaXw"
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
          "timezone":"America/Los_Angeles",
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
          "isWEBKIT":true,
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
      },
      {
        "type":"$Label",
        "values":{
          "test":{
            "task_mode_today":"Today"
          }
        }
      }
    ],
    "enableAccessChecks":true,
    "ls":1,
    "m":1,
    "mna":{
      "alpha":"beta"
    },
    "services":[
      "markup://nativeTest:primerService"
    ]
  }
}`;

const ERROR_MOCK1_HTTP_STATUS_CODE = 200;
const ERROR_MOCK1_CONTENT =
`while(1);
*/{
  "event":{
    "descriptor":"markup://aura:invalidSession",
    "attributes":{
      "values":{
        "newToken":"HCQAHBgEMTAwMBQCGAcxMDAwMjA2GAcxMDAwMjA2ABQCGfMQlptS_K3a_z6Oder_yrUSnhb8pYKjtVgAGfMgjPuTfWw-1vmE8Yszmy8Grk3L6AqoWwc_TAJBFZtfn8cA"
      }
    }
  },
  "exceptionEvent":true
}/*ERROR*/`;

const ERROR_NO_TOKEN_MOCK_CONTENT =
`while(1);
*/{
  "event":{
    "descriptor":"markup://aura:invalidSession",
    "attributes":{
      "values":{
        "newToken": null
      }
    }
  },
  "exceptionEvent":true
}/*ERROR*/`;

const PRIMED_ACTIONS = [{status:200, responseText:LABEL_EXAMPLE_MOCK}]; // This will come from bridge
const ERROR_RESULT =   [{status: ERROR_MOCK1_HTTP_STATUS_CODE, responseText: ERROR_MOCK1_CONTENT}];
const ERROR_NO_TOKEN_RESULT =   [{status: ERROR_MOCK1_HTTP_STATUS_CODE, responseText: ERROR_NO_TOKEN_MOCK_CONTENT}];

// Returns a promise for when the bridge return the actions from native land
export async function getActionsFromBridge() {
    return PRIMED_ACTIONS;
}

// Sends actions to bridge
export async function sendActionsToBridge() {
    // TODO: connect wit the real cordova
    return true;
}

// Sends the error response with a token
export async function getErrorResponse() {
    return ERROR_RESULT;
}

// Sends the error response without a token
export async function getErrorResponseWithNoToken() {
    return ERROR_NO_TOKEN_RESULT;
}