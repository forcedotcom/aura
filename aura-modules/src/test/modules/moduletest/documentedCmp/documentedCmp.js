import { LightningElement, api } from "lwc";

/**
 * This component is documented.
 * @slot default Default slot description
 * @slot named Named slot description
 */
export default class DocumentedCmp extends LightningElement {
    /**
     * Whether this thing is enabled.
     *
     * @type {boolean}
     * @default false
     */
    @api enabled = false;

    /**
     * This parameter is required 
     * 
     * @type {Boolean}
     * @default undefined
     * @required
     */
    @api isRequired;

    /**
     * @type {string|object}
     */
    @api variant;

    // private
    _something = "something";

    /**
     * Fear is the mind-killer.
     *
     * @type {string}
     */
    @api get something() {
        return this._something;
    }

    set something(value) {
        this.something = value;
    }

    /* private, and this isn't jsdoc */
    privateMethod() {
    }
    
    /**
     * Method description
     */
    @api
    publicMethod() {
    }
    
    /**
     * Method description for publicMethodWithParameters
     * 
     * @param {String} param1 description for param1
     * @param {Object} [param2] description for param2
     */
    @api
    publicMethodWithParameters(param1, param2) {
        // To prevent unused warnings
        this.publicMethod(param1, param2);
    }
}
