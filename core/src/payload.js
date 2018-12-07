"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base64url_1 = require("base64url");
function isNonEmptyJson(property) {
    if (!isJson(property)) {
        return false;
    }
    for (var key in property) {
        if (property.hasOwnProperty(key)) {
            return true;
        }
    }
    return false;
}
exports.isNonEmptyJson = isNonEmptyJson;
function isJson(property) {
    return (typeof property !== 'undefined' && property !== null &&
        (property.constructor === {}.constructor || property.constructor === [].constructor));
}
exports.isJson = isJson;
function payloadBuilder(base64Encode) {
    var dict = {};
    var add = function (key, value) {
        if (value != null && value !== '') {
            dict[key] = value;
        }
    };
    var addDict = function (dict) {
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                add(key, dict[key]);
            }
        }
    };
    var addJson = function (keyIfEncoded, keyIfNotEncoded, json) {
        if (isNonEmptyJson(json)) {
            var str = JSON.stringify(json);
            if (base64Encode) {
                add(keyIfEncoded, base64url_1.default.encode(str));
            }
            else {
                add(keyIfNotEncoded, str);
            }
        }
    };
    return {
        add: add,
        addDict: addDict,
        addJson: addJson,
        build: function () {
            return dict;
        }
    };
}
exports.payloadBuilder = payloadBuilder;
//# sourceMappingURL=payload.js.map