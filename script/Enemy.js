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
//敵クラス
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(scene, num) {
        var _this = _super.call(this, {
            scene: scene,
            width: 38,
            height: 38
        }) || this;
        _this.px = 0;
        _this.py = 0;
        _this.isMove = false; //１マス移動中
        _this.move = function (maps) { };
        _this.hit = function () { };
        _this.roots = [];
        _this.life = 1;
        _this.isCollision = true; //当たり判定の有無
        _this.score = 0;
        var tl = require("@akashic-extension/akashic-timeline");
        _this.timeline = new tl.Timeline(scene);
        var scores = [300, 500, 400, 1000, 1500, 1200];
        _this.score = scores[num];
        var spr;
        var frames = [4 * (num % 3), 4 * (num % 3) + 1];
        if (num < 3) {
            spr = new g.FrameSprite({
                scene: scene,
                src: scene.assets["enemy"],
                width: 50,
                height: 75,
                frames: frames,
                interval: 300,
                x: -6,
                y: -37
            });
            _this.life = 1;
        }
        else {
            spr = new g.FrameSprite({
                scene: scene,
                src: scene.assets["enemy2"],
                width: 100,
                height: 100,
                frames: frames,
                interval: 300,
                x: -31,
                y: -62
            });
            _this.life = 2;
        }
        if (num % 3 === 0) {
            _this.roots = [0 /* ROAD */, 5 /* WAIT_FIRE */];
        }
        else if (num % 3 === 1) {
            _this.roots = [0 /* ROAD */];
        }
        else if (num % 3 === 2) {
            _this.roots = [0 /* ROAD */, 4 /* BLOCK */];
        }
        var dx = [1, 0, -1, 0]; //４方向
        var dy = [0, 1, 0, -1];
        //移動
        _this.move = function (maps) {
            if (!_this.isMove) {
                //移動可能な場所のリスト作成
                var arr = [];
                for (var i = 0; i < 4; i++) {
                    var x = _this.px + dx[i];
                    var y = _this.py + dy[i];
                    if ([5 /* WAIT_FIRE */, 2 /* BOMB */].indexOf(maps[_this.py][_this.px].num) !== -1) {
                        var ar = [5 /* WAIT_FIRE */];
                        if (ar.indexOf(maps[y][x].num) !== -1)
                            arr.push({ x: x, y: y });
                    }
                    else {
                        if (_this.roots.indexOf(maps[y][x].num) !== -1)
                            arr.push({ x: x, y: y });
                    }
                }
                //移動
                if (arr.length !== 0) {
                    var p_1 = arr[g.game.random.get(0, arr.length - 1)];
                    _this.isMove = true;
                    var x_1 = _this.x;
                    var y_1 = _this.y;
                    _this.timeline.create(_this).every(function (a, b) {
                        if (_this.life <= 0)
                            return;
                        _this.x = x_1 + (p_1.x * _this.width - x_1) * b;
                        _this.y = y_1 + (p_1.y * _this.height - y_1) * b;
                        _this.modified();
                    }, 500).call(function () {
                        _this.px = p_1.x;
                        _this.py = p_1.y;
                        _this.isMove = false;
                    });
                }
            }
        };
        //爆風に当たった時
        _this.hit = function () {
            _this.sprite.frames = [4 * (num % 3) + 2];
            _this.sprite.frameNumber = 0;
            _this.sprite.modified();
            _this.life--;
            _this.isCollision = false;
            if (_this.life > 0) {
                scene.setTimeout(function () {
                    _this.sprite.frames = frames;
                    _this.sprite.frameNumber = 0;
                    _this.sprite.modified();
                    _this.isCollision = true;
                }, 1300);
            }
            else {
                scene.setTimeout(function () {
                    _this.destroy();
                }, 1000);
            }
        };
        spr.start();
        _this.append(spr);
        _this.sprite = spr;
        return _this;
    }
    return Enemy;
}(g.E));
exports.Enemy = Enemy;
;
