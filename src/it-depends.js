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

    function notifyCurrentTracker(descriptor) {
        trackers[trackers.length - 1](descriptor);
    };

    exports.value = function (initialValue) {
        var currentValue = initialValue;

        var self = function () {
            notifyCurrentTracker(descriptor);
            return currentValue;
        };
		
		self.write = function (newValue){
            if (currentValue !== newValue) {
                currentValue = newValue;
                descriptor.valueVersion++;
            }
		};

		var descriptor = {
			changedSince: function (version) {
				return descriptor.valueVersion > version;
			},
			valueVersion: 0,
			id: ++nextId
		};

        return self;
    };

    exports.computed = function (calculator) {
        var currentValue;
        var dependencies;

        var setValue = function (newValue) {
            if (currentValue !== newValue) {
                currentValue = newValue;
                descriptor.valueVersion++;
            }
        };

        var atLeastOneDependencyChanged = function (visitor) {
            for (var dependencyId in dependencies) {
                if (!dependencies.hasOwnProperty(dependencyId))
                    continue;

                var dependency = dependencies[dependencyId];

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
                dependencies = {};

                trackers.push(function (trackedValue, dependencyId) {
                    if (dependencies[dependencyId])
                        return;

                    dependencies[dependencyId] ={
                        trackedValue: trackedValue,
                        capturedVersion: trackedValue.valueVersion
                    };
                });

                try {
                    setValue(calculator());
                } finally {
                    trackers.pop();
                }
            }

            notifyCurrentTracker(descriptor);

            return currentValue;
        };

		var descriptor = {
			changedSince: function (version, visitor) {
				if (visitor[descriptor.id]) {
					return false;
				}

				visitor[descriptor.id] = true;

				if (descriptor.valueVersion > version) {
					return true;
				}

				return needRecalc(visitor);
			},
			valueVersion: 0,
			id: ++nextId
		};

        return self;
    };

    exports.promiseValue = function (promise, initialValue) {
        var currentValue = exports.value(initialValue);

        promise.then(currentValue);

        return exports.computed(currentValue);
    };
}));