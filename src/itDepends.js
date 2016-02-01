'use strict';
/*!
* itDepends - v{{ version }}
* https://github.com/gerich-home/itDepends
* Copyright (c) 2016 Sergey Gerasimov; Licensed MSPL
*
* Lightweight dependency tracking library for JavaScript
*/
(function (rootObject, factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS or Node
        factory(exports);
    } else if (typeof define === 'function' && define['amd']) {
        // AMD anonymous module
        define([], factory);
    } else {
        // <script> tag: define the global `itDepends` object
        var exports = {};
        factory(exports);
        rootObject.itDepends = exports;
    }
}(this, function (exports) {
    var nop = function () { };
    var trackers = [nop];
    var nextId = 0;

    function notifyCurrentTracker(tracked) {
        trackers[trackers.length - 1](tracked);
    };

    exports.value = function (initialValue) {
        var currentValue = initialValue;

        var getValue = function () {
            notifyCurrentTracker(self);
            return currentValue;
        };

        var setValue = function (newValue) {
            if (currentValue !== newValue) {
                currentValue = newValue;
                self.valueVersion++;
            }
        };

        var self = function () {
            if (arguments.length === 0) {
                return getValue();
            }

            setValue(arguments[0]);
        };

        self.changedSince = function (version) {
            return self.valueVersion > version;
        };

        self.valueVersion = 0;

        return self;
    };
    exports.computed = function (calculator) {
        var id = ++nextId;
        var currentValue;
        var dependencies;

        var setValue = function (newValue) {
            if (currentValue !== newValue) {
                currentValue = newValue;
                self.valueVersion++;
            }
        };

        var atLeastOneDependencyChanged = function (visitor) {
            for (var i = 0; i < dependencies.length; i++) {
                var dependency = dependencies[i];

                if (dependency.trackedValue.changedSince(dependency.capturedVersion, visitor)) {
                    return true;
                }
            }

            return false;
        };

        var needRecalcCache = false;
        var needRecalc = function (visitor) {
            return needRecalcCache ||
            (needRecalcCache = !dependencies || atLeastOneDependencyChanged(visitor));
        };

        var self = function () {
            if (needRecalc({})) {
                needRecalcCache = false;
                dependencies = [];

                trackers.push(function (trackedValue) {
                    dependencies.push({
                        trackedValue: trackedValue,
                        capturedVersion: trackedValue.valueVersion
                    });
                });

                try {
                    setValue(calculator());
                } finally {
                    trackers.pop();
                }
            }

            notifyCurrentTracker(self);

            return currentValue;
        };

        self.changedSince = function (version, visitor) {
            if (visitor[id]) {
                return false;
            }

            visitor[id] = true;

            if (self.valueVersion > version) {
                return true;
            }

            return needRecalc(visitor);
        };

        self.valueVersion = 0;

        return self;
    };

    exports.promiseValue = function (promise, initialValue) {
        var currentValue = exports.value(initialValue);

        promise.then(currentValue);

        return exports.computed(currentValue);
    };
}));