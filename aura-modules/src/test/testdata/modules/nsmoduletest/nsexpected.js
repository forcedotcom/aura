define('modules/nsmoduletest', ['@salesforce/css/customProperties', 'ns/bar', 'x/foo', 'lwc', 'ns/utils', 'some-module'], function (customProperties, _cBar, _xFoo, lwc, utils, someModule) {

    function factory(hostSelector, shadowSelector) {
        return `c-bar${shadowSelector},[is="c-bar"]${shadowSelector} {
    color: red;
}

x-foo${shadowSelector},[is="x-foo"]${shadowSelector} {
    color: black;
}`;
    }

    var stylesheet = {
        factory,
        hostAttribute: 'modules-nsmoduletest_nsmoduletest-host',
        shadowAttribute: 'modules-nsmoduletest_nsmoduletest',
    };

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

    if (stylesheet) {
        tmpl.stylesheet = stylesheet;
    }

    class Test extends lwc.LightningElement {
      render() {
        return _tmpl;
      }

    }

    return Test;

});
