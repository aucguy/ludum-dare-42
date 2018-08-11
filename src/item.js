base.registerModule('item', function() {
  var util = base.importModule('util');
  var ingredient = base.importModule('ingredient');
  
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
    },
    canBeMixed: function() {
      return false;
    },
    onMixed: function() {
      //abstract
    },
    onMoveFail: function() {
      //abstract
    },
    place: function(zone, draggable) {
      //abstract
    }
  });
  
  var PermanentItem = util.extend(Item, 'PermanentItem', {
    constructor: function PermanentItem(world, x, y, ingredient) {
      this.constructor$Item(world, x, y, ingredient);
    },
    onClick: function(point) {
      var moving = new MovingItem(this.world, this, point);
      this.world.dragHandler.createDraggable(moving);
    },
    place: function(zone, draggable) {
      zone.addItem(new CookingItem(this.world, draggable.sprite.position.x, draggable.sprite.position.y, this.ingredient));
    }
  });
  
  var CookingItem = util.extend(Item, 'CookingItem', {
    constructor: function CookingItem(world, x, y, ingredient) {
      this.constructor$Item(world, x, y, ingredient);
    },
    onClick: function(point) {
      var moving = new MovingItem(this.world, this, point)
      this.world.dragHandler.createDraggable(moving);
      this.sprite.alpha = 0.5;
    },
    canBeMixed: function() {
      return true;
    },
    onMixed: function() {
      this.kill();
    },
    onMoveFail: function() {
      this.sprite.alpha = 1;
    },
    place: function(zone, draggable) {
      this.sprite.alpha = 1;
      this.sprite.position.x = draggable.sprite.position.x;
      this.sprite.position.y = draggable.sprite.position.y;
    }
  });
  
  var MovingItem = util.extend(Item, 'MovingItem', {
    constructor: function MovingItem(world, item, point) {
      this.constructor$Item(world, item.sprite.position.x, item.sprite.position.y, item.ingredient);
      this.offset = new Phaser.Point(point.x - item.sprite.x, point.y - item.sprite.y);
      this.whenUsed = new Phaser.Signal();
      this.underlyingItem = item;
    },
    onMouseMove: function(position) {
      this.sprite.position.x = position.x - this.offset.x;
      this.sprite.position.y = position.y - this.offset.y;
    },
    onMouseUp: function(position) {
      this.kill();
      var zone = this.world.zones.getZone(position);
      if(zone !== null) {
        var overItem = zone.getItem(position);
        if(overItem !== null) {
          if(overItem.canBeMixed()) {
            var mixedIngredient = ingredient.mix(this.underlyingItem.ingredient, overItem.ingredient);
            if(mixedIngredient !== null) {
              var position = overItem.sprite.position;
              this.underlyingItem.onMixed();
              overItem.onMixed();
              zone.addItem(new CookingItem(this.world, position.x, position.y, mixedIngredient));
            } else {
              this.underlyingItem.onMoveFail();
            }
          } else {
            this.underlyingItem.onMoveFail();
          }
        } else if(zone.canPlaceItem(this)) {
          this.underlyingItem.place(zone, this);
        }
      } else {
        this.underlyingItem.onMoveFail();
      }
    },
    tryPlace: function(zone) {
      //abstract
    }
  });
  
  return {
    DragHandler: DragHandler,
    PermanentItem: PermanentItem
  }
});