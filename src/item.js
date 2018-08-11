base.registerModule('item', function() {
  var util = base.importModule('util');
  
  var DragHandler = util.extend(Object, 'DragHandler', {
    constructor: function DragHandler(world) {
      this.world = world;
      this.movingItem = null;
      this.world.game.input.addMoveCallback(this.onMouseMove, this);
      this.world.game.input.onUp.add(this.onMouseUp, this);
    },
    createDraggable: function(item, point) {
      if(this.movingItem !== null) {
        this.movingItem.kill();
      }
      this.movingItem = new MovingItem(this.world, item, point);
      this.movingItem.whenKill.add(function() {
        this.movingItem = null;
      }, this);
    },
    onMouseMove: function(pointer, x, y, clicked, event) {
      if(this.movingItem !== null) {
        this.movingItem.onMouseMove(pointer.position);
      }
    },
    onMouseUp: function(pointer) {
      if(this.movingItem !== null) {
        this.movingItem.onMouseUp(pointer.position);
      }
    }
  });
  
  var Item = util.extend(Object, 'Item', {
    constructor: function Item(world, x, y) {
      this.sprite = world.game.add.sprite(x, y, 'image/flour'); //Phaser.Sprite
      this.sprite.scale.x = 2;
      this.sprite.scale.y = 2;
      this.world = world;
      this.whenKill = new Phaser.Signal();
    },
    containsPoint: function(point) {
      return this.sprite.getBounds().contains(point.x, point.y);
    },
    onClick: function() {
    },
    kill: function() {
      this.sprite.kill();
      this.whenKill.dispatch();
    }
  });
  
  var CookingItem = util.extend(Item, 'CookingItem', {
    constructor: function CookingItem(world, x, y) {
      this.constructor$Item(world, x, y);
    }
  });
  
  var PermanentItem = util.extend(Item, 'PermanentItem', {
    onClick: function(point) {
      this.world.dragHandler.createDraggable(this, point);
    }
  });
  
  var MovingItem = util.extend(Item, 'MovingItem', {
    constructor: function MovingItem(world, item, point) {
      this.constructor$Item(world);
      this.offset = new Phaser.Point(point.x - item.sprite.x, point.y - item.sprite.y);
      this.sprite.position.x = item.sprite.position.x;
      this.sprite.position.y = item.sprite.position.y;
    },
    onMouseMove: function(position) {
      this.sprite.position.x = position.x - this.offset.x;
      this.sprite.position.y = position.y - this.offset.y;
    },
    onMouseUp: function(position) {
      this.kill();
      var zone = this.world.zones.getZone(position);
      if(zone !== null) {
        zone.addItem(new CookingItem(this.world, this.sprite.position.x, this.sprite.position.y));
      }
    }
  });
  
  return {
    DragHandler: DragHandler,
    PermanentItem: PermanentItem
  }
});