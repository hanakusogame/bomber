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
//プレイヤークラス(右側のステータス表示)
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    //コンストラクタ
    function Player(scene) {
        var _this = _super.call(this, {
            scene: scene
        }) || this;
        _this.power = 2;
        _this.powerMax = 5;
        _this.bomb = 2;
        _this.bombMax = 5;
        _this.bombType = 0;
        _this.time = 3000;
        //初期化
        _this.init = function () {
            _this.power = 2;
            _this.bomb = 2;
            _this.setBombType(0);
        };
        //火力アップ
        _this.addPower = function () {
            if (_this.power < _this.powerMax) {
                _this.power++;
                _this.labelPower.text = "" + _this.power;
                _this.labelPower.invalidate();
            }
        };
        //爆弾数アップ
        _this.addBomb = function () {
            if (_this.bomb < _this.bombMax) {
                _this.bomb++;
                _this.labelBomb.text = "" + _this.bomb;
                _this.labelBomb.invalidate();
            }
        };
        //爆弾の種類設定
        _this.setBombType = function (num) {
            var maxBombs = [5, 4, 3, 5, 8];
            var maxPowers = [5, 4, 3, 5, 5];
            _this.bombType = num;
            _this.bombMax = maxBombs[num];
            _this.powerMax = maxPowers[num];
            //種類ごとの上限に補正
            _this.power = Math.min(_this.power, _this.powerMax);
            _this.bomb = Math.min(_this.bomb, _this.bombMax);
            _this.labelPower.text = "" + _this.power;
            _this.labelPower.invalidate();
            _this.labelBomb.text = "" + _this.bomb;
            _this.labelBomb.invalidate();
        };
        //火力表示用
        var sprPowerBase = new g.Sprite({
            scene: scene,
            src: scene.assets["item_base"],
            x: 515,
            y: 102,
            opacity: 0.7
        });
        _this.append(sprPowerBase);
        var sprPower = new g.Sprite({
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            x: 520,
            y: 100,
            srcX: 60
        });
        _this.append(sprPower);
        _this.labelPower = new g.Label({
            scene: scene,
            font: scene.numFont,
            fontSize: 32,
            text: "2",
            x: 590,
            y: 115
        });
        _this.append(_this.labelPower);
        //爆弾数表示用
        var sprBombBase = new g.Sprite({
            scene: scene,
            src: scene.assets["item_base"],
            x: 515,
            y: 182,
            opacity: 0.7
        });
        _this.append(sprBombBase);
        var sprBomb = new g.Sprite({
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            x: 520,
            y: 180
        });
        _this.append(sprBomb);
        _this.labelBomb = new g.Label({
            scene: scene,
            font: scene.numFont,
            fontSize: 32,
            text: "2",
            x: 590,
            y: 195
        });
        _this.append(_this.labelBomb);
        return _this;
    }
    return Player;
}(g.E));
exports.Player = Player;
