import { Element } from "engine";

export default class InteropLegacyEvent extends Element {}

InteropLegacyEvent.interopMap = {
    exposeNativeEvent: {
        'click': true
    }
};

