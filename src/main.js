import * as util from '/lib/util.js';
import * as zone from './zone.js'
import * as item from './item.js';
import { getAsset } from '/lib/indexlib.js';

function init() {
  util.removeLoadingLogo();
  var game = new Phaser.Game({
    width: 640,
    height: 480,
    parent: 'gameContainer',
    canvasID: 'display',
    state: new CustomBootState()
  });
  game.state.add('play', new PlayState());
  return game;
}

var CustomBootState = util.extend(util.BootState, 'CustomBootState', {
  update: function() {
    this.state.start('play');
  }
});

var World = util.extend(Object, 'World', {
  constructor: function World(game) {
    this.game = game;
    this.dragHandler = new item.DragHandler(this);
    this.zones = new zone.ZoneContainer(this);
    this.zones.createZones(getAsset('config/zones'))
    this.status = new Status(this);
  },
  update: function(time) {
    this.zones.update(time);
    this.status.update(time);
  }
});

var Status = util.extend(Object, 'Status', {
  constructor: function Status(world) {
    this.world = world;
    this.text = this.world.game.add.text(16, 16);
    this.text.addColor('#FFFFFF', 0);
    this.money = 0;
  },
  update: function(time) {
    this.text.text = '$' + this.money;
  }
});

var PlayState = util.extend(Phaser.State, 'PlayState', {
  constructor: function PlayState() {
    this.constructor$State();
    this.world = null;
    this.timer = null;
  },
  create: function() {
    this.game.add.sprite(0, 0, 'image/background');
    this.world = new World(this.game);
    this.input.onDown.add(this.onClick, this);
    this.timer = this.game.time.create();
    this.timer.start();
    this.lastTime = this.timer.ms;
  },
  onClick: function(pointer) {
    this.world.zones.onClick(pointer.position);
  },
  update: function() {
    var currentTime = this.timer.ms;
    this.world.update(currentTime - this.lastTime);
    this.lastTime = currentTime;
  }
});

export {
  init
};