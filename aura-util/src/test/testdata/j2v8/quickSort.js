function quickSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    var pivot = arr.splice(Math.floor(arr.length / 2), 1)[0];
    var left = [];
    var right = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return quickSort(left).concat([ pivot ], quickSort(right));
}

function orderedArray(size) {
    var arr = [];
    for (var i = 0; i < size; i++) {
        arr.push(i);
    }
    return arr;
}

quickSort(orderedArray(2000000));
console.log("quickSort: DONE");