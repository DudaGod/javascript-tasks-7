'use strict';

exports.wrap = function (val) {
    if (val === null) {
        return { value: val, isNull: isNull, valueOf: valueOf };
    }
    return val;
};

exports.init = function () {
    Object.defineProperty(Object.prototype, 'check', {
        get: function () {
            return checkNamespace(this);
        }
    });
};

function valueOf() {
    return this.value;
}

function isNull() {
    return this.valueOf() === null;
}

function checkNamespace(obj, isInvert) {
    isInvert = isInvert || false;

    var check = {
        containsKeys: getResult(checkContainsKeys, obj, isInvert),
        hasKeys: getResult(checkHasKeys, obj, isInvert),
        containsValues: getResult(checkContainsValues, obj, isInvert),
        hasValues: getResult(checkHasValues, obj, isInvert),
        hasValueType: getResult(checkHasValueType, obj, isInvert),
        hasLength: getResult(checkHasLength, obj, isInvert),
        hasParamsCount: getResult(checkHasParamsCount, obj, isInvert),
        hasWordsCount: getResult(checkHasWordsCount, obj, isInvert),
        isNull: getResult(isNull, obj, isInvert)
    };

    Object.defineProperty(check, 'not', {
        configurable: true,
        get: function () {
            return checkNamespace(obj, true);
        }
    });

    return check;
}

function getResult(func, obj, isInvert) {
    return function () {
        var res = func.apply(obj, arguments);
        if (isNaN(res)) {
            return res;
        }
        return isInvert ? !res : res;
    };
}

function checkContainsKeys(keys) {
    return definedFor.call(this, 'object', 'array') ?
        keys.every(item => this.hasOwnProperty(item), this) :
        undefined;
}

function checkHasKeys(keys) {
    if (!definedFor.call(this, 'object', 'array')) {
        return;
    }
    if (Object.keys(this).length !== keys.length) {
        return false;
    }
    return keys.every(item => Object.keys(this).indexOf(item) + 1, this);
}

function checkContainsValues(values) {
    return definedFor.call(this, 'object', 'array') ?
        values.every(item => getAllValues.call(this).indexOf(item) + 1, this) :
        undefined;
}

function checkHasValues(values) {
    if (!definedFor.call(this, 'object', 'array')) {
        return;
    }
    var allValues = getAllValues.call(this);
    if (allValues.length !== values.length) {
        return false;
    }
    return values.every(item => allValues.indexOf(item) + 1, this);
}

function checkHasValueType(key, type) {
    if (!definedFor.call(this, 'object', 'array')) {
        return;
    }
    var validTypes = [String, Number, Function, Array];
    return Boolean(this[key].constructor === type && validTypes.indexOf(type) + 1);
}

function checkHasLength(length) {
    return definedFor.call(this, 'array', 'string') ? this.length === length : undefined;
}

function checkHasParamsCount(count) {
    return definedFor.call(this, 'function') ? [].slice.call(this, arguments).length === count :
        undefined;
}

function checkHasWordsCount(count) {
    return definedFor.call(this, 'string') ? this.split(' ').length === count : undefined;
}

function definedFor() {
    var args = [].slice.call(arguments);
    return args.length ? args.some(item => typeof this === item ||
        this instanceof Array && item === 'array', this) : false;
}

function getAllValues() {
    return Object.keys(this).map(item => this[item], this);
}
