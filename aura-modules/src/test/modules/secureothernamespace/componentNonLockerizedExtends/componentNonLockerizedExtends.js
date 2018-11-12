import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';

export default class ComponentNonLockerizedExtends extends LightningElement {
    @api COMPONENT = 'ComponentNonLockerizedExtends { NS: "securemoduletest" }';
    @api NAME = 'Non-Lockerized! [ParentClass]';

    @api BOOLEAN = false;
    @api NULL = null;
    @api UNDEFINED = undefined;
    @api NUMBER = 100;
    @api STRING = 'Hello!';
    @api SYMBOL = Symbol('ABC');

    @api BOOLEAN_OVERRIDE = 'true';
    @api NULL_OVERRIDE = undefined;
    @api UNDEFINED_OVERRIDE = null;
    @api NUMBER_OVERRIDE = 100;
    @api STRING_OVERRIDE = 'Hello!';
    @api SYMBOL_OVERRIDE = Symbol('ABC');

    @api WINDOW = window;
    @api DOCUMENT = document;
    @api ELEMENT = document.createElement('DIV');

    @api OBJECT = {
        'win': window,
        'doc': document,
        'el': document.createElement('DIV'),
        'winFunction': function() { return window; },
        'docFunction': function() { return document; },
        'elFunction': function() { return document.createElement('DIV'); },
        'winThisContextFunction': function() { return this.win },
        'docThisContextFunction': function() { return this.doc },
        'elThisContextFunction': function() { return this.el }
    };

    getWindow() {
        testUtil.assertEquals('[object Window]', window.toString(), 'Function "window" lockerized! [ParentClass]');
        return window;
    }
    getDocument() {
        testUtil.assertEquals('[object HTMLDocument]', document.toString(), 'Function "document" lockerized! [ParentClass]');
        return document;
    }
    getElement() {
        testUtil.assertEquals('[object HTMLDivElement]',document.createElement('DIV'), 'Function "element" lockerized! [ParentClass]');
        return document.createElement('DIV');
    }
    getWindowOverride() {
        return window;
    }
    getDocumentOverride() {
        return document;
    }
    getElementOverride() {
        return document.createElement('DIV');
    }
    getWindowThisContext() {
        testUtil.assertEquals('[object Window]', this.WINDOW.toString(), 'Function this context "window" lockerized! [ParentClass]');
        return this.WINDOW;
    }
    getDocumentThisContext() {
        testUtil.assertEquals('[object HTMLDocument]', this.DOCUMENT.toString(), 'Function this context "document" lockerized! [ParentClass]');
        return this.DOCUMENT;
    }
    getElementThisContext() {
        testUtil.assertEquals('[object HTMLDivElement]',this.ELEMENT, 'Function this context "element" lockerized! [ParentClass]');
        return this.ELEMENT;
    }
    getWindowReturn(win) {
        this.win = win;
        testUtil.assertEquals('[object Window]', this.win.toString(), 'Function return "window" lockerized! [ParentClass]');
        return this.win;
    }
    getDocumentReturn(doc) {
        this.doc = doc;
        testUtil.assertEquals('[object HTMLDocument]', this.doc.toString(), 'Function return "document" lockerized! [ParentClass]');
        return this.doc;
    }
    getElementReturn(el) {
        this.el = el;
        testUtil.assertEquals('[object HTMLDivElement]', this.el.toString(), 'Function return "element" lockerized! [ParentClass]');
        return this.el;
    }
    getWindowReturnFunction(winFunc) {
        this.win = winFunc();
        testUtil.assertEquals('[object Window]', this.win.toString(), 'Function return function "window" lockerized! [ParentClass]');
        return this.win;
    }
    getDocumentReturnFunction(docFunc) {
        this.docFunc = docFunc();
        testUtil.assertEquals('[object HTMLDocument]', this.docFunc.toString(), 'Function return function "document" lockerized! [ParentClass]');
        return this.docFunc;
    }
    getElementReturnFunction(elFunc) {
        this.elFunc = elFunc();
        testUtil.assertEquals('[object HTMLDivElement]', this.elFunc.toString(), 'Function return function "element" lockerized! [ParentClass]');
        return this.elFunc;
    }

    @api
    testBaseComponentPrimitives() {
        testUtil.assertEquals(false, this.BOOLEAN_OVERRIDE);
        testUtil.assertEquals(null, this.NULL_OVERRIDE);
        testUtil.assertEquals(undefined, this.UNDEFINED_OVERRIDE);
        testUtil.assertEquals(999, this.NUMBER_OVERRIDE);
        testUtil.assertEquals('Override!', this.STRING_OVERRIDE);
        testUtil.assertEquals('Symbol(XYZ)', this.SYMBOL_OVERRIDE.toString());
    }

    @api
    testBaseComponentObjects() {
        testUtil.assertEquals('[object Window]', this.WINDOW.toString(), 'Property "window" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.DOCUMENT.toString(), 'Property "document" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.ELEMENT.toString(), 'Property "element" lockerized! [ParentClass]');

        testUtil.assertEquals('[object Window]', this.OBJECT.win.toString(), 'Object "window" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.OBJECT.doc.toString(), 'Object "document" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.OBJECT.el.toString(), 'Object "element" lockerized! [ParentClass]');

        testUtil.assertEquals('[object Window]', this.OBJECT.winFunction().toString(), 'Object function "window" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.OBJECT.docFunction().toString(), 'Object function "document" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.OBJECT.elFunction().toString(), 'Object function "element" lockerized! [ParentClass]');

        testUtil.assertEquals('[object Window]', this.OBJECT.winThisContextFunction().toString(), 'Object this context "window" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.OBJECT.docThisContextFunction().toString(), 'Object this context "document" lockerized! [ParentClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.OBJECT.elThisContextFunction().toString(), 'Object this context "element" lockerized! [ParentClass]');
    }

    @api
    testBaseComponentFunctions() {
        testUtil.assertEquals('[object Window]', this.getWindow().toString(), 'Function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocument().toString(), 'Function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElement().toString(), 'Function "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWindowOverride().toString(), 'Function override "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentOverride().toString(), 'Function override "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]',this.getElementOverride().toString(), 'Function override "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.getWindowThisContext().toString(), 'Function this context "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentThisContext().toString(), 'Function this context "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]',this.getElementThisContext().toString(), 'Function this context "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWindowReturn(window).toString(), 'Function return "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentReturn(document).toString(), 'Function return "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElementReturn(document.createElement('DIV')).toString(), 'Function return "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWindowReturnFunction(function() { return window; }).toString(), 'Function return function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentReturnFunction(function() { return document; }).toString(), 'Function return function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElementReturnFunction(function() { return document.createElement('DIV'); }).toString(), 'Function return function "element" lockerized! [ChildClass]');
    }

    @api
    testBaseComponentCreatedPrimitives() {
        testUtil.assertEquals(false, this.BOOLEAN_SUPER);
        testUtil.assertEquals(null, this.NULL_SUPER);
        testUtil.assertEquals(undefined, this.UNDEFINED_SUPER);
        testUtil.assertEquals(200, this.NUMBER_SUPER);
        testUtil.assertEquals('Super!', this.STRING_SUPER);
        testUtil.assertEquals('Symbol(QWERTY)', this.SYMBOL_SUPER.toString());
    }

    @api
    testBaseComponentCreatedObjects() {
        testUtil.assertEquals('[object Window]', this.winSuper.toString(), '[Super] Property "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.docSuper.toString(), '[Super] Property "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.elSuper.toString(), '[Super] Property "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.objSuper.win.toString(), '[Super] Object "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.objSuper.doc.toString(), '[Super] Object  "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.objSuper.el.toString(), '[Super] Object "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.objSuper.winFunction().toString(), '[Super] Object function "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.objSuper.docFunction().toString(), '[Super] Object function "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.objSuper.elFunction().toString(), '[Super] Object function  "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.objSuper.winThisContextFunction().toString(), '[Super] Object this context "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.objSuper.docThisContextFunction().toString(), '[Super] Object this context "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.objSuper.elThisContextFunction().toString(), '[Super] Object this context "element" lockerized!');
    }

    @api
    testBaseComponentsCreatedFunctions() {
        testUtil.assertEquals('[object Window]', this.getWinSuper().toString(), '[Super] Function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocSuper().toString(), '[Super] Function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElSuper().toString(), '[Super] Function "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWinThisContextSuper().toString(), '[Super] Function this context "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocThisContextSuper().toString(), '[Super] Function this context "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]',this.getElThisContextSuper().toString(), '[Super] Function this context "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWinReturnSuper(window).toString(), '[Super] Function return "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocReturnSuper(document).toString(), '[Super] Function return "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElReturnSuper(document.createElement('DIV')).toString(), '[Super] Function return "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWinReturnFuncSuper(function() { return window; }).toString(), '[Super] Function return function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocReturnFuncSuper(function() { return document; }).toString(), '[Super] Function return function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElReturnFuncSuper(function() { return document.createElement('DIV'); }).toString(), '[Super] Function return function "element" lockerized! [ChildClass]');
    }
}
