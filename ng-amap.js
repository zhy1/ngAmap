"use strict";

var aMapDirective = [ "$parse", "ngAMapHelper", "$rootElement", function($parse, ngAMapHelper, $rootElement) {
    return {
        restrict: "E",
        compile: function(element, attrs, transclude, ctrl) {
            window.AMap || ngAMapHelper.injectCode($rootElement, void 0);
            return {
                pre: function(scope, element, attrs, ctrl) {
                    function SyncMapGeneratorContext() {
                        element.html("").append('<div id="' + mapId + '"  style="' + elementStyles + '"></div>');
                    }
                    function AsyncMapImplements(firstLoadRunner) {
                        function eventHandler(event) {
                            if (event) {
                                var longitude = event.lnglat.getLng(), latitude = event.lnglat.getLat();
                                map.marker.setMap(map.map);
                                map.marker.setPosition([ longitude, latitude ]);
                                map.map.setCenter([ longitude, latitude ]);
                                if (scope) {
                                    scope.amap = scope.amap || {};
                                    scope.amap.marker = map.marker;
                                    scope.amap.longitude = longitude;
                                    scope.amap.latitude = latitude;
                                    scope.amap.location = [ longitude, latitude ];
                                }
                                map.Geocoder.getAddress([ longitude, latitude ], function(status, result) {
                                    if ("complete" === status && "OK" === result.info) {
                                        var addressComponent = result.regeocode.addressComponent, formattedAddress = result.regeocode.formattedAddress, map = ngAMapHelper.getMap();
                                        if (map[scope.$id]) {
                                            var current = map[scope.$id];
                                            current.map.setZoom(current.map.getZoom() + 2);
                                            scope.$apply(function() {
                                                if (scope) {
                                                    scope.amap = scope.amap || {};
                                                    scope.amap.zoom = current.map.getZoom();
                                                    scope.amap.addressComponent = addressComponent;
                                                    scope.amap.formattedAddress = formattedAddress;
                                                    scope.amap.address = formattedAddress;
                                                    scope.amap.district = addressComponent.district;
                                                    scope.amap.adcode = addressComponent.adcode;
                                                    scope.amap.city = addressComponent.province;
                                                }
                                            });
                                        }
                                        scope.amap && "function" == typeof scope.amap.whenMarkerMove && scope.amap.whenMarkerMove(status, result);
                                    }
                                });
                            }
                        }
                        if (window.AMap && window.AMap.Map) {
                            firstLoadRunner && firstLoadRunner();
                            var mapConfig = {
                                resizeEnable: !0,
                                zoom: 5,
                                center: [ ngAMapHelper.getLongitude() || 121, ngAMapHelper.getLatitude() || 21 ]
                            }, map = {};
                            map.map = new window.AMap.Map(mapId, mapConfig);
                            map.placeSearch = new window.AMap.PlaceSearch({
                                lang: "zh_cn",
                                pageSize: 50,
                                pageIndex: 0,
                                map: map.map,
                                panel: ngAMapHelper.getOptions().CONSTANT.PANEL,
                                extensions: "all"
                            });
                            map.marker = new window.AMap.Marker({
                                position: map.map.getCenter(),
                                draggable: !0,
                                cursor: "move",
                                raiseOnDrag: !0,
                                map: map.map,
                                visible: !0
                            });
                            window.AMap.plugin([ ngAMapHelper.getOptions().CONSTANT.TOOL_BAR, ngAMapHelper.getOptions().CONSTANT.SCALE ], function() {
                                map.map.addControl(new window.AMap.ToolBar());
                                map.map.addControl(new window.AMap.Scale());
                            });
                            map.Geocoder = new window.AMap.Geocoder({
                                radius: 1e3,
                                extensions: "all"
                            });
                            map.marker.on("mouseup", eventHandler);
                            map.map.on("click", eventHandler);
                            ngAMapHelper.addInstance({
                                id: scope.$id,
                                map: map
                            });
                            return map;
                        }
                    }
                    scope.$on("$destroy", function() {
                        ngAMapHelper.setDestroyList(scope, "DESTROY SCOPE OF CONTROLLER BEFORE EXIT");
                    });
                    var elementStyles = attrs.style, mapId = "map" + scope.$id, mapGenerator = function() {
                        if (ngAMapHelper.getDestroyList(scope)) {
                            ngAMapHelper.setDestroyList(scope, void 0);
                            ngAMapHelper.setDestroyList(scope, void 0);
                            ngAMapHelper.removeById(scope.$id);
                            clearInterval(waitPollingWhile);
                            return "RunningOver";
                        }
                        if (window.AMap) {
                            SyncMapGeneratorContext();
                            AsyncMapImplements();
                            clearInterval(waitPollingWhile);
                            return "RunningOk";
                        }
                        return "RunningNoYet";
                    }, waitPollingWhile = setInterval(mapGenerator, 500);
                },
                post: function(scope, element, attrs, ctrl) {}
            };
        },
        controller: function() {}
    };
} ], aMapProvider = function() {
    var $$options = {
        protocol: "http:",
        baseUrl: "//webapi.amap.com/maps",
        version: 1.3,
        key: "e8804b0ae9a290694a23325109273364",
        plugin: "AMap.Autocomplete,AMap.PlaceSearch,AMap.Geocoder",
        completed: "https://webapi.amap.com/maps?v=1.3&key=e8804b0ae9a290694a23325109273364&plugin=AMap.Autocomplete,AMap.PlaceSearch,AMap.Geocoder",
        longitude: 121,
        latitude: 21,
        CONSTANT: {
            PANEL: "panel",
            SELECT: "select",
            COMPLETE: "complete",
            OK: "OK",
            CLICK: "click",
            MOUSEDOWN: "mouseup",
            SCALE: "AMap.Scale",
            TOOL_BAR: "AMap.ToolBar",
            PLACE_SEARCH: "AMap.PlaceSearch"
        }
    }, $$exitsMapArray = {}, $$DestroyScopeArray = {};
    this.setOptions = function(options) {
        angular.extend($$options, options);
    };
    this.$get = [ "$rootElement", function($rootElement) {
        return {
            addInstance: function(newMapInstance) {
                if ($$exitsMapArray[newMapInstance.id]) throw new Error("scope Error");
                $$exitsMapArray[newMapInstance.id] = newMapInstance.map;
            },
            removeById: function(id) {
                $$exitsMapArray[id] = void 0;
            },
            setOptions: function(options) {
                $$options = angular.extend($$options, options);
            },
            getMap: function() {
                return $$exitsMapArray;
            },
            getOptions: function() {
                return $$options;
            },
            injectCode: function(element, callback) {
                function getScript(url, callback) {
                    function scriptOnload(node, callback) {
                        node.addEventListener("load", callback, !1);
                        node.addEventListener("error", function() {
                            console.error("404 error:", node.src);
                            callback("error");
                        }, !1);
                    }
                    var node = document.createElement("script");
                    !function(callback) {
                        scriptOnload(node, function(SystemCallback) {
                            callback && "function" == typeof callback && callback();
                        });
                    }(callback);
                    node.async = !0;
                    node.src = url;
                    return head.insertBefore(node, head.firstChild);
                }
                function originPrepend() {
                    var link = '<link rel="stylesheet" href="http://cache.amap.com/lbs/static/main1119.css" />', scripts = '<script src="http://cache.amap.com/lbs/static/es5.min.js"></script>';
                    element.prepend(scripts + link);
                }
                var head = document.getElementsByTagName("head")[0], aMapUrl = $$options.protocol + $$options.baseUrl + "?v=" + $$options.version + "&key=" + $$options.key + "&plugin=" + $$options.plugin;
                getScript(aMapUrl, function() {
                    originPrepend();
                    callback && callback();
                });
            },
            setDestroyList: function(scope, data) {
                $$DestroyScopeArray[scope.$id] = data;
            },
            getDestroyList: function(scope) {
                return $$DestroyScopeArray[scope.$id];
            },
            getLongitude: function() {
                return $$options.longitude;
            },
            getLatitude: function() {
                return $$options.latitude;
            }
        };
    } ];
}, aMapAutoComplete = [ "ngAMapHelper", function(ngAMapHelper) {
    return {
        restrict: "A",
        compile: function(element, attrs, transclude, ctrl) {
            return {
                post: function(scope, element, attrs, ctrl) {
                    function SyncMapGeneratorContext() {
                        element[0].id = inputId;
                    }
                    function WaitFor() {
                        waitForSecond++;
                        if (MapArray[scope.$id]) {
                            SyncMapGeneratorContext();
                            var map = MapArray[scope.$id], auto = window.AMap.plugin("AMap.Autocomplete", function() {
                                var autoOptions = {
                                    city: "",
                                    input: inputId
                                };
                                map.autocomplete = new AMap.Autocomplete(autoOptions);
                            });
                            window.AMap.event.addListener(map.autocomplete, "select", function(event) {
                                var position = event.poi, address = event.poi.address, district = event.poi.district, adcode = event.poi.adcode;
                                if (scope) {
                                    scope.amap = scope.amap || {};
                                    scope.amap.zoom = map.map.getZoom();
                                    scope.amap.map = map.map;
                                    scope.amap.address = address;
                                    scope.amap.district = district;
                                    scope.amap.adcode = adcode;
                                }
                                if ("" === event.poi.location) return "city didn't have location";
                                var location = event.poi.location, I = event.poi.location.I, L = event.poi.location.L;
                                map.map.setCenter([ I, L ]);
                                map.marker.setPosition([ I, L ]);
                                map.map.setZoom(17);
                                scope.amap.I = I;
                                scope.amap.L = L;
                                scope.amap.location = location;
                                scope.amap.position = position;
                                scope.amap.whenSelect && "function" == typeof scope.amap.whenSelect && scope.amap.whenSelect();
                            });
                            MapArray[scope.$id].auto = auto;
                            clearInterval(waitPollingWhile);
                        }
                        if (waitForSecond > 10) {
                            clearInterval(waitPollingWhile);
                            return "running failed at 10 attempts";
                        }
                    }
                    var MapArray = ngAMapHelper.getMap(), inputId = "ipt" + scope.$id, waitForSecond = 0, waitPollingWhile = setInterval(WaitFor, 500);
                }
            };
        },
        controller: function() {}
    };
} ];

angular.module("ngAMap", []).directive("aMap", aMapDirective).provider("ngAMapHelper", aMapProvider).directive("aMapAutoComplete", aMapAutoComplete);