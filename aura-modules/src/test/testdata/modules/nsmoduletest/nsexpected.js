define('modules/nsmoduletest', ['ns/bar', 'x/foo', 'lwc', 'ns/utils', 'some-module'], function (_cBar, _xFoo, lwc, utils, someModule) {

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return `
c-bar${shadowSelector} {color: red;}
x-foo${shadowSelector} {color: black;}
`;
    }
    var stylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element
      } = $api;

      return [api_custom_element("c-bar", _cBar, {
        key: 2
      }, []), api_custom_element("x-foo", _xFoo, {
        key: 3
      }, [])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);

    if (stylesheets) {
      tmpl.stylesheets = {
        stylesheets,
        hostAttribute: "modules-nsmoduletest_nsmoduletest-host",
        shadowAttribute: "modules-nsmoduletest_nsmoduletest"
      };
    }

    class Test extends lwc.LightningElement {
      render() {
        return _tmpl;
      }

    }

    return Test;

});