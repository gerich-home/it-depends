'use strict';
/*!
* it-depends - v{{ version }}
* https://github.com/gerich-home/itDepends
* Copyright (c) 2016 Sergey Gerasimov; Licensed MSPL
*
* Lightweight dependency tracking library for JavaScript
*/
(function(rootObject, factory) {
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
}(this, function(exports) {
    var nop = function() {};
    var trackers = [nop];
    var nextId = 0;
    var lastWriteVersion = 0;

    function notifyCurrentTracker(id, observableValue, currentValue) {
        trackers[trackers.length - 1](id, observableValue, currentValue);
    };

    exports.value = function(initialValue) {
        var currentValue = initialValue;
        var id = ++nextId;

        var self = function() {
            notifyCurrentTracker(id, self, currentValue);
            return currentValue;
        };

        self.write = function(newValue) {
            if (currentValue !== newValue) {
                currentValue = newValue;
                lastWriteVersion++;
            }
        };

        return self;
    };

    exports.computed = function(calculator) {
        var currentValue;
        var dependencies = {};
        var id = ++nextId;
        var lastReadVersion = 0;

        var atLeastOneDependencyChanged = function() {
            for (var dependencyId in dependencies) {
                if (!dependencies.hasOwnProperty(dependencyId))
                    continue;

                var dependency = dependencies[dependencyId];

                if (dependency.observableValue() !== dependency.capturedValue) {
                    return true;
                }
            }

            return false;
        };

        var needRecalcCache = true;
        var needRecalc = function() {
            if (lastReadVersion !== lastWriteVersion) {
                needRecalcCache = atLeastOneDependencyChanged();
                lastReadVersion = lastWriteVersion;
            }

            return needRecalcCache;
        };

        var self = function() {
            if (needRecalc()) {
                dependencies = {};

                trackers.push(function(dependencyId, observableValue, capturedValue) {
                    if (dependencies[dependencyId])
                        return;

                    dependencies[dependencyId] = {
                        observableValue: observableValue,
                        capturedValue: capturedValue
                    };
                });

                try {
                    currentValue = calculator();
                } finally {
                    trackers.pop();
                }

                needRecalcCache = false;
            }

            notifyCurrentTracker(id, self, currentValue);

            return currentValue;
        };

        return self;
    };

    exports.promiseValue = function(promise, initialValue) {
        var currentValue = exports.value(initialValue);

        promise.then(currentValue.write);

        return exports.computed(currentValue);
    };
}));