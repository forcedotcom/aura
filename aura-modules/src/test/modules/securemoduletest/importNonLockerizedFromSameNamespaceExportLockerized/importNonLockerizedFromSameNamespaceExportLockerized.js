import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';
import defaultFunction, {
    BOOLEAN,
    NULL,
    UNDEFINED,
    NUMBER,
    STRING,
    SYMBOL,
    WINDOW,
    DOCUMENT,
    ELEMENT,
    OBJECT,
    getWindow,
    getDocument,
    getElement,
    getObject,
    getWindowFunction,
    getDocumentFunction,
    getElementFunction,
    getObjectFunction,
    getWindowReturn,
    getDocumentReturn,
    getElementReturn,
    getWindowReturnFunction,
    getDocumentReturnFunction,
    getElementReturnFunction
} from 'securemoduletest/moduleLockerizedExports';

export default class ImportNonLockerizedFromSameNamespaceExportLockerized extends LightningElement {
    @api NAME = 'ImportNonLockerizedFromSameNamespaceExportLockerized { NS: "securemoduletest" }';
    @api COMPONENT = 'Non-Lockerized! [Import]';

    @api
    testPrimitives() {
        testUtil.assertEquals(true, BOOLEAN);
        testUtil.assertEquals(null, NULL);
        testUtil.assertEquals(undefined, UNDEFINED);
        testUtil.assertEquals(100, NUMBER);
        testUtil.assertEquals('Hello!', STRING);
        testUtil.assertEquals('Symbol(ABC)', SYMBOL.toString());
    }

    @api
    testObjects() {
        testUtil.assertEquals('[object Window]', WINDOW.toString());
        testUtil.assertEquals('[object HTMLDocument]', DOCUMENT.toString());
        testUtil.assertEquals('[object HTMLDivElement]', ELEMENT.toString());
        this.testObject(OBJECT);
    }

    testObject(obj) {
        testUtil.assertEquals('[object Window]', obj.win.toString());
        testUtil.assertEquals('[object HTMLDocument]', obj.doc.toString());
        testUtil.assertEquals('[object HTMLDivElement]', obj.el.toString());
        testUtil.assertEquals('[object Window]', obj.winFunction().toString());
        testUtil.assertEquals('[object HTMLDocument]', obj.docFunction().toString());
        testUtil.assertEquals('[object HTMLDivElement]', obj.elFunction().toString());
        testUtil.assertEquals('[object Window]', obj.winThisContext.toString());
        testUtil.assertEquals('[object HTMLDocument]', obj.docThisContext.toString());
        testUtil.assertEquals('[object HTMLDivElement]', obj.elThisContext.toString());
        testUtil.assertEquals('[object Window]', obj.winThisContextFunction().toString());
        testUtil.assertEquals('[object HTMLDocument]', obj.docThisContextFunction().toString());
        testUtil.assertEquals('[object HTMLDivElement]', obj.elThisContextFunction().toString());
    }

    @api
    testFunctions() {
        testUtil.assertEquals('[object Window]', getWindow().toString());
        testUtil.assertEquals('[object HTMLDocument]', getDocument().toString());
        testUtil.assertEquals('[object HTMLDivElement]', getElement().toString());
        this.testObject(getObject());

        let getWin = getWindowFunction();
        let getDoc = getDocumentFunction();
        let getEl = getElementFunction();
        let getObj = getObjectFunction();
        testUtil.assertEquals('[object Window]', getWin().toString());
        testUtil.assertEquals('[object HTMLDocument]', getDoc().toString());
        testUtil.assertEquals('[object HTMLDivElement]', getEl().toString());
        this.testObject(getObj());

        testUtil.assertEquals('[object Window]', getWindowReturn(window).toString());
        testUtil.assertEquals('[object HTMLDocument]', getDocumentReturn(document).toString());
        testUtil.assertEquals('[object HTMLDivElement]', getElementReturn(document.createElement('DIV')).toString());
        testUtil.assertEquals('[object Window]', getWindowReturnFunction(function() { return window; }).toString());
        testUtil.assertEquals('[object HTMLDocument]', getDocumentReturnFunction(function() { return document; }).toString());
        testUtil.assertEquals('[object HTMLDivElement]', getElementReturnFunction(function() { return document.createElement('DIV'); }).toString());
    }

    @api
    testDefault() {
        let iterator = defaultFunction();

        let firstYield = iterator.next();
        testUtil.assertEquals({ value: window, done: false }, firstYield);
        testUtil.assertEquals('[object Window]', firstYield.value.toString());

        let secondYield = iterator.next();
        testUtil.assertEquals({ value: document, done: false }, secondYield);
        testUtil.assertEquals('[object HTMLDocument]', secondYield.value.toString());

        let thirdYield = iterator.next();
        testUtil.assertEquals({ value: document.createElement('DIV'), done: false }, thirdYield);
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', thirdYield.value.toString());

        let finalReturn = iterator.next();
        testUtil.assertEquals({ value: 'Default!', done: true }, finalReturn);
    }
}
