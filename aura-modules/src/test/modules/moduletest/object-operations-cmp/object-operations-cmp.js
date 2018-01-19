import { Element, track, api } from 'engine';

export default class ObjectOperationsCmp extends Element {
    @track assignVal = { inner: "i'm default value." };
    @track constructedObject;
    @track createdObj;
    @track protoOfObj;
    @track isObj = false;

    @track unshiftVal = ["i'm default unshift value"];
    @track shiftVal = ["i shoudn't be here", "i should be here after shift"];
    @track concatVal = ["i'm default value for concat. "];

    @api
    get getObjectAssign() {
        return this.assignVal.inner + this.assignVal.outer;
    }
    @api
    get getArrayUnshift() {
        return this.unshiftVal.join('');
    }
    @api
    get getArrayShift() {
        return this.shiftVal.join('');
    }
    @api
    get getArrayConcat() {
        return this.concatVal.join('');
    }
    @api
    get getObjectConstructor() {
        return this.constructedObject.constructor.name;
    }
    @api
    get getObjectCreate() {
        return this.createdObj.name;
    }
    @api
    get getObjProtoOf() {
        return this.protoOfObj.name;
    }
    @api
    get getIsObj() {
        return this.isObj;
    }

    connectedCallback() {
        this.assignVal = Object.assign({}, this.assignVal, { outer: " i'm value from object.assign operation"});
        this.unshiftVal.unshift("i'm unshift value. ");
        this.shiftVal.shift();
        this.concatVal = this.concatVal.concat(["i'm concatenated value"]);
        this.constructedObject = { name: 'object constructor'};
        this.createdObj = Object.create({ name: 'created via Object.create'});
        this.protoOfObj = Object.getPrototypeOf(Object.create({ name: 'accessed via Object.getPrototypeOf'}));
        this.isObj = Object.is('foo', 'foo');
    }
}