base.registerModule('item', function() {
  var util = base.importModule('util');
  
  var DragHandler = util.extend(Object, 'DragHandler', {
    constructor: function DragHandler(world) {
      this.world = world;
      this.movingItem = null;
      this.world.game.input.addMoveCallback(this.onMouseMove, this);
      this.world.game.input.onUp.add(this.onMouseUp, this);
    },
    createDraggable: function(moving) {
      if(this.movingItem !== null) {
        this.movingItem.kill();
      }
      this.movingItem = moving;
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
    constructor: function Item(world, x, y, ingredient) {
      this.sprite = world.game.add.sprite(x, y, ingredient.graphic);
      this.sprite.scale.x = 2;
      this.sprite.scale.y = 2;
      this.world = world;
      this.ingredient = ingredient;
      this.whenKill = new Phaser.Signal();
    },
    containsPoint: function(point) {
      return this.sprite.getBounds().contains(point.x, point.y);
    },
    onClick: function() {
      //abstract
    },
    kill: function() {
      this.sprite.kill();
      this.whenKill.dispatch();
    }
  });
  
  var PermanentItem = util.extend(Item, 'PermanentItem', {
    constructor: function PermanentItem(world, x, y, ingredient) {
      this.constructor$Item(world, x, y, ingredient);
    },
    onClick: function(point) {
      var moving = new MovingPermanentItem(this.world, this, point);
      this.world.dragHandler.createDraggable(moving);
    }
  });
  
  var CookingItem = util.extend(Item, 'CookingItem', {
    constructor: function CookingItem(world, x, y, ingredient) {
      this.constructor$Item(world, x, y, ingredient);
    },
    onClick: function(point) {
      var moving = new MovingCookingItem(this.world, this, point)
      this.world.dragHandler.createDraggable(moving);
      this.sprite.alpha = 0.5;
    }
  });
  
  var MovingItem = util.extend(Item, 'MovingItem', {
    constructor: function MovingItem(world, item, point) {
      this.constructor$Item(world, item.sprite.position.x, item.sprite.position.y, item.ingredient);
      this.offset = new Phaser.Point(point.x - item.sprite.x, point.y - item.sprite.y);
      this.whenUsed = new Phaser.Signal();
    },
    onMouseMove: function(position) {
      this.sprite.position.x = position.x - this.offset.x;
      this.sprite.position.y = position.y - this.offset.y;
    },
    onMouseUp: function(position) {
      this.kill();
      var zone = this.world.zones.getZone(position);
      if(zone !== null) {
        this.tryPlace(zone);
      }
    },
    tryPlace: function(zone) {
      //abstract
    }
  });
  
  var MovingPermanentItem = util.extend(MovingItem, 'MovingPermanentItem', {
    constructor: function MovingPermanentItem(world, item, point) {
      this.constructor$MovingItem(world, item, point);
    },
    tryPlace: function(zone) {
      zone.addItem(new CookingItem(this.world, this.sprite.position.x, this.sprite.position.y, this.ingredient));
    }
  });
  
  var MovingCookingItem = util.extend(MovingItem, 'MovingCookingItem', {
    constructor: function MovingCookingItem(world, item, point) {
      this.constructor$MovingItem(world, item, point);
      this.item = item;
    },
    tryPlace: function(zone) {
      this.item.sprite.alpha = 1;
      this.item.sprite.position.x = this.sprite.position.x;
      this.item.sprite.position.y = this.sprite.position.y;
    }
  });
  
  return {
    DragHandler: DragHandler,
    PermanentItem: PermanentItem
  }
});