const DefaultMinValue = 5;
const DefaultMaxValue = 50;

export default class Bar {
    min = DefaultMinValue;
    max = DefaultMaxValue;
    label;
    title;

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    broza (x: string) {
        return x;
    }

    @method
    publicMethod () {
        console.log(`test`); // back-tick on purpose to test handling of back-ticks
    }

    handleClick() {
        this.counter += 1;
        const newData = [];
        this.data = newData;
        console.log('clicked');
    }
}