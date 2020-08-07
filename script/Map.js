"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
;
//マップクラス
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map(scene, x, y, num) {
        var _this = _super.call(this, {
            scene: scene,
            src: scene.assets["map"],
            x: x * 38,
            y: y * 38,
            width: 38,
            height: 38,
            frames: [0, 1, 4, 0, 2, 0, 4],
            frameNumber: num
        }) || this;
        _this.num = num;
        _this.colors = ["green", "#404040", "blue", "green", "orange", "#00A000"];
        _this.bomb = null;
        _this.fireCnt = 0;
        _this.setNum = function (num) {
            _this.num = num;
            _this.frameNumber = num;
            _this.modified();
        };
        return _this;
    }
    return Map;
}(g.FrameSprite));
exports.Map = Map;
;
