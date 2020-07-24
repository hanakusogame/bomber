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
//アイテムクラス
var Item = /** @class */ (function (_super) {
    __extends(Item, _super);
    function Item(scene, px, py, num) {
        var _this = _super.call(this, {
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            frames: [0, 1],
            x: px * 38 - 11,
            y: py * 38 - 11,
            frameNumber: num,
            touchable: true,
            interval: 800
        }) || this;
        _this.px = px;
        _this.py = py;
        _this.num = num;
        _this.start();
        return _this;
    }
    return Item;
}(g.FrameSprite));
exports.Item = Item;
;
