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
({
  testAuraLWCCustomEventOnHostElement: function (cmp, event, helper) {
      var testUtils = cmp.get("v.testUtils");
      var module = cmp.find('parentSecure').getElement();
      var triggered = false;

      var customEvent = new CustomEvent('testAuraLWCCustomEventOnHostElement', {
          detail: {
              data: {
                  object: {
                      foo: 'bar',
                      bar: {
                          baz: 'foo'
                      }
                  },
                  array: [0, 1, 2],
                  string: 'foobar',
                  number: 1,
                  boolean: true,
                  domElement: document.querySelector('#div-aura-cmp'),
                  func: function () {
                      triggered = true;
                  },
                  win: window,
                  doc: document,
                  body: document.body,
                  head: document.head,
                  isSecure: true,
              }
          }
      });

      module.dispatchEvent(customEvent);
      testUtils.addWaitForWithFailureMessage(true, function () {
          return triggered;
      }, "Custom event handler was not triggered on component");
  },
  testAuraLWCApiMethodOnHostElement: function (cmp, event, helper) {
      var testUtils = cmp.get("v.testUtils");
      var module = cmp.find('parentSecure').getElement();
      var triggered = false;
      var fnParamTriggered = false;

      var data = {
          object: {
              foo: 'bar',
              bar: {
                  baz: 'foo'
              }
          },
          array: [0, 1, 2],
          string: 'foobar',
          number: 1,
          boolean: true,
          domElement: document.querySelector('#div-aura-cmp'),
          func: function () {
              fnParamTriggered = true;
          },
          win: window,
          doc: document,
          body: document.body,
          head: document.head,
          isSecure: true
      };

      var cb = function () { triggered = true; };

      module.testAuraLWCApiMethodOnHostElement(data, cb);

      testUtils.addWaitForWithFailureMessage(true, function () {
          return fnParamTriggered;
      }, "Function in Object parameter was not triggered");

      testUtils.addWaitForWithFailureMessage(true, function () {
          return triggered;
      }, "API method on SecureLWC element was not called");
  },
  testAuraLWCDomEventOnHostElement: function (cmp) {
      var testUtils = cmp.get("v.testUtils");
      var module = cmp.find('parentSecure').getElement();
      var triggered = false;
      var cb = function () {
          triggered = true;
      }

      module.callback = cb;
      module.click();

      testUtils.addWaitForWithFailureMessage(true, function () {
          return triggered;
      }, "DOM Event was not triggered on LWC host element");
  },
  testSLWC2AuraApiReturnValue: function (cmp) {
      var testUtils = cmp.get("v.testUtils");
      var module = cmp.find('parentSecure').getElement();
      var returned = module.testSLWC2AuraApiReturnValue();
      var complete = false;
      testUtils.assertEquals('bar', returned.object.foo, 'Expected object value mismatched');
      testUtils.assertEquals(3, returned.array.length, 'Expected array length mismatched');
      testUtils.assertEquals(0, returned.array[0], 'Expected array value mismatched');
      testUtils.assertEquals(1, returned.array[1], 'Expected array value mismatched');
      testUtils.assertEquals(2, returned.array[2], 'Expected array value mismatched');
      testUtils.assertEquals('foobar', returned.string, 'Expected string value mismatched');
      testUtils.assertEquals(1, returned.number, 'Expected number value mismatched');
      testUtils.assertEquals(true, returned.boolean, 'Expected boolean value mismatched');
      testUtils.assertEquals(
          'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
          returned.domElement.toString(),
          'Expected DOMElement value mismatched'
      );
      testUtils.assertEquals(
          'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
          returned.win.toString(),
          'Expected Window value mismatched'
      );
      testUtils.assertEquals(
          'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
          returned.doc.toString(),
          'Expected Document value mismatched'
      );
      testUtils.assertEquals(
          'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
          returned.body.toString(),
          'Expected body value mismatched'
      );
      testUtils.assertEquals(
          'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
          returned.head.toString(),
          'Expected head value mismatched'
      );
      testUtils.assertEquals(
          true,
          returned.func instanceof Function,
          'Expected function type mismatched'
      );
      returned.func(function () {
          complete = true;
      });

      testUtils.addWaitForWithFailureMessage(
          true,
          function () {
              return complete;
          },
          'Test did not complete in timely manner'
      )
  },
  testTemplateQuerySelectorReturnsSecureElement: function (cmp, event, helper) {
      var module = cmp.find('parentSecure').getElement();
      module.testTemplateQuerySelectorReturnsSecureElement();

      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components
  },
  testLWCCustomEventOnSelf: function (cmp, event, helper) {
      var module = cmp.find('parentSecure').getElement();
      module.testLWCCustomEventOnSelf();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components
  },
  // BUG: W-5058359
  testSecureLWC2SecureLWCCustomEvent: function (cmp) {
      var module = cmp.find('parentSecure').getElement();
      module.testSecureLWC2SecureLWCCustomEvent();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components
  },
  // BUG: W-5058359
  testSecureLWC2SecureLWCDomEvent: function (cmp) {
      var module = cmp.find('parentSecure').getElement();
      module.testSecureLWC2SecureLWCDomEvent();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components
  },
  // User Story: W-5058590
  _testSecureLWC2UnsecureLWCCustomEvent: function (cmp) {
      var module = cmp.find('parentSecure').getElement();
      module.testSecureLWC2UnsecureLWCCustomEvent();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components
  },
  // User Story: W-4808252
  _testSecureLWC2UnsecureLWCDOMEvent: function (cmp) {
      var testUtils = cmp.get("v.testUtils");
      var module = cmp.find('parentSecure').getElement();
      var triggered = false;
      module.testSecureLWC2UnsecureLWCDOMEvent(function () {
          triggered = true;
      });

      testUtils.addWaitForWithFailureMessage(
          true,
          function () {
              return triggered;
          },
          'Event handler was not triggered by the LWC component'
      );
  },
  // BUG W-5058711
  _testSecureLWC2SecureLWCCustomEventCrossNamespace: function (cmp) {
      var module = cmp.find('parentSecure').getElement();
      module.testSecureLWC2SecureLWCCustomEventCrossNamespace();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components      

  },
  // BUG W-5058711
  _testUnsecureLWC2SecureLWCCustomEventCrossNamespace: function (cmp) {
      var module = cmp.find('parentUnsecure').getElement();
      module.testUnsecureLWC2SecureLWCCustomEventCrossNamespace();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components      
  },
  // W-5058711
  _testUnsecureLWC2SecureLWCCustomEvent: function (cmp) {
      var module = cmp.find('parentUnsecure').getElement();
      module.testUnsecureLWC2SecureLWCCustomEvent();
      // TODO add wait for to make sure test executed successfully
      // currently there is an issue with passing function parameters to Secure LWC components      
  }
})