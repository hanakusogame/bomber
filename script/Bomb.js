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
    function Bomb(pram, mapBase) {
        var _this = _super.call(this, pram) || this;
        _this.px = 0;
        _this.py = 0;
        _this.power = 0; //火力
        _this.cnt = 0;
        _this.arr = []; //爆風
        _this.type = 0; //種類
        var scene = pram.scene;
        var spr = new g.FrameSprite({
            scene: pram.scene,
            src: pram.scene.assets["bomb"],
            width: 60,
            height: 60,
            frames: [0, 1],
            interval: 500,
            x: -11,
            y: -22
        });
        spr.start();
        _this.append(spr);
        //爆風作成
        var fires = [];
        for (var i = 0; i < 21; i++) {
            var spr_1 = new g.FrameSprite({
                scene: scene,
                src: scene.assets["fire"],
                width: 38,
                height: 38,
                frames: [0, 1, 2, 3]
            });
            spr_1.hide();
            fires.push(spr_1);
            mapBase.append(spr_1);
        }
        //初期化
        _this.init = function (px, py, player) {
            _this.px = px;
            _this.py = py;
            _this.type = player.bombType;
            if (_this.type !== 3) {
                _this.power = player.power;
            }
            else {
                _this.power = scene.random.get(1, 5);
            }
            if (_this.type !== 1) {
                _this.cnt = player.time / 30;
            }
            else {
                _this.cnt = 1000; //適当
            }
            spr.frames = [_this.type * 2, _this.type * 2 + 1];
            spr.frameNumber = 0;
            spr.modified();
            _this.touchable = (_this.type === 1);
        };
        _this.pointDown.add(function () {
            _this.cnt = 0;
        });
        var dx = [1, 0, -1, 0]; //４方向
        var dy = [0, 1, 0, -1];
        //爆破の範囲設定
        _this.setArea = function (maps) {
            var arr = [];
            for (var i = 0; i < 4; i++) {
                var x = _this.px;
                var y = _this.py;
                for (var j = 0; j < _this.power; j++) {
                    x += dx[i];
                    y += dy[i];
                    var map = maps[y][x];
                    if (map.num === 2 /* BOMB */ || map.num === 6 /* WAIT_BOMB */ || map.num === 4 /* BLOCK */ || map.num === 1 /* WALL */) {
                        break;
                    }
                    map.setNum(5 /* WAIT_FIRE */);
                    arr.push({ x: x, y: y, time: j + 1, angle: i * 90, num: 0 });
                }
            }
            _this.arr = arr;
        };
        //爆破
        _this.blast = function (maps) {
            _this.hide();
            scene.playSound("se_bomb");
            //範囲を取得
            var arr = [];
            arr.push({ x: _this.px, y: _this.py, time: 0, angle: 0, num: 0 });
            for (var i = 0; i < 4; i++) {
                var x = _this.px;
                var y = _this.py;
                for (var j = 0; j < _this.power; j++) {
                    x += dx[i];
                    y += dy[i];
                    var map = maps[y][x];
                    if (map.num === 1 /* WALL */)
                        break;
                    var num = 1;
                    if (j + 1 === _this.power)
                        num = 2;
                    if (map.num === 4 /* BLOCK */)
                        num = 3;
                    arr.push({ x: x, y: y, time: j + 1, angle: i * 90, num: num });
                    if (map.num === 2 /* BOMB */ || map.num === 4 /* BLOCK */) {
                        break;
                    }
                }
            }
            var itemArr = [];
            var fireCnt = 0;
            //爆風表示
            arr.forEach(function (p) {
                var map = maps[p.y][p.x];
                if (map.num === 4 /* BLOCK */) {
                    if (scene.random.get(0, 8) === 0 || Bomb.dropCnt % 11 === 4) {
                        itemArr.push({ x: p.x, y: p.y, num: 0 });
                    }
                    else if (Bomb.dropCnt % 6 === 1) {
                        itemArr.push({ x: p.x, y: p.y, num: 1 });
                    }
                    Bomb.dropCnt++;
                }
                scene.setTimeout(function () {
                    if (map.num === 2 /* BOMB */) {
                        map.bomb.cnt = 0;
                        map.bomb = null;
                    }
                    map.setNum(3 /* FIRE */);
                    map.fireCnt++;
                    var fire = fires[fireCnt % fires.length];
                    fire.moveTo(map.x, map.y);
                    fire.frameNumber = p.num;
                    fire.angle = p.angle;
                    fire.modified();
                    fire.show();
                    fireCnt++;
                }, p.time * ((10 - _this.power) * 10));
            });
            //爆風を消す
            scene.setTimeout(function () {
                arr.forEach(function (p) {
                    var map = maps[p.y][p.x];
                    map.fireCnt--;
                    if (map.fireCnt <= 0 && map.num !== 2 /* BOMB */) {
                        map.setNum(0 /* ROAD */);
                    }
                });
                fires.forEach(function (e) {
                    e.hide();
                });
            }, 1000);
            return itemArr;
        };
        return _this;
    }
    Bomb.dropCnt = 0;
    return Bomb;
}(g.E));
exports.Bomb = Bomb;
