base.registerModule('main', function() {
  var util = base.importModule('util');
  var zone = base.importModule('zone');
  var item = base.importModule('item');
  
  function init() {
    util.removeLoadingScreen();
    var game = new Phaser.Game({
      width: 640,
      height: 480,
      parent: 'gameContainer',
      canvasID: 'display',
      state: new CustomBootState()
    });
    game.state.add('play', new PlayState());
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
      this.zones.createZones(base.getAsset('config/zones'))
    },
    update: function() {
      this.zones.update();
    }
  });
  
  var PlayState = util.extend(Phaser.State, 'PlayState', {
    constructor: function PlayState() {
      this.constructor$State();
    },
    create: function() {
      this.game.add.sprite(0, 0, 'image/background');
      this.world = new World(this.game);
      this.input.onDown.add(this.onClick, this);
    },
    onClick: function(pointer) {
      this.world.zones.onClick(pointer.position);
    },
    update: function() {
      this.world.update();
    }
  });
  
  return {
    init: init
  }
});