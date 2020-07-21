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
//爆弾クラス
var Bomb = /** @class */ (function (_super) {
    __extends(Bomb, _super);
    function Bomb(pram) {
        var _this = _super.call(this, pram) || this;
        _this.px = 0;
        _this.py = 0;
        _this.power = 0;
        _this.cnt = 0;
        _this.arr = [];
        var spr = new g.FrameSprite({
            scene: pram.scene,
            src: pram.scene.assets["bomb"],
            width: 50,
            height: 50,
            frames: [0, 1],
            interval: 500,
            x: -6,
            y: -12
        });
        spr.start();
        _this.append(spr);
        return _this;
    }
    return Bomb;
}(g.E));
exports.Bomb = Bomb;
