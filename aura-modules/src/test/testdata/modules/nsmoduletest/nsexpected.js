define('modules/nsmoduletest', ['@salesforce/css/customProperties', 'ns/bar', 'x/foo', 'lwc', 'ns/utils', 'some-module'], function (customProperties, _cBar, _xFoo, lwc, utils, someModule) {

    function style(token) {
       return `c-bar[${token}],[is="c-bar"][${token}] {
    color: red;
}

x-foo[${token}],[is="x-foo"][${token}] {
    color: black;
}`;
    }

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element
      } = $api;

      return [api_custom_element("c-bar", _cBar, {
        key: 1
      }, []), api_custom_element("x-foo", _xFoo, {
        key: 2
      }, [])];
    }

    if (style) {
        tmpl.hostToken = 'modules-nsmoduletest_nsmoduletest-host';
        tmpl.shadowToken = 'modules-nsmoduletest_nsmoduletest';

        const style$$1 = document.createElement('style');
        style$$1.type = 'text/css';
        style$$1.dataset.token = 'modules-nsmoduletest_nsmoduletest';
        style$$1.textContent = style('modules-nsmoduletest_nsmoduletest');
        document.head.appendChild(style$$1);
    }

    class Test extends lwc.LightningElement {
      render() {
        return tmpl;
      }

    }

    return Test;

});