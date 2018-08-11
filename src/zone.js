base.registerModule('zone', function() {
  var util = base.importModule('util');
  var item = base.importModule('item');
  var ingredient = base.importModule('ingredient');
  
  var ZONE_BORDERS = false; //for debugging
  
  var ZoneContainer = util.extend(Object, 'ZoneContainer', {
    constructor: function ZoneContainer(world) {
      this.world = world;
      this.children = [];
    },
    createZones: function(data) {
      for(var i=0; i<data.zones.length; i++) {
        var zoneData = data.zones[i];
        var constructor = ZONE_CONSTRUCTORS[zoneData.type];
        var zone = constructor(this.world, zoneData);
        this.children.push(zone);
      }
      if(ZONE_BORDERS) {
        var bitmap = this.world.game.add.bitmapData(this.world.game.width, this.world.game.height);
        bitmap.context.save();
        bitmap.context.strokeStyle = '#FF0000';
        bitmap.context.lineWidth = 5;
        for(var i=0; i<this.children.length; i++) {
          var rect = this.children[i].rect;
          bitmap.context.beginPath();
          bitmap.context.rect(rect.left, rect.top, rect.width, rect.height);
          bitmap.context.closePath();
          bitmap.context.stroke();
        }
        bitmap.context.restore();
        this.world.game.add.sprite(0, 0, bitmap);
      }
    },
    getZone: function(position) {
      for(var i=0; i<this.children.length; i++) {
        if(this.children[i].rect.contains(position.x, position.y)) {
          return this.children[i];
        }
      }
      return null;
    },
    onClick: function(position) {
      var zone = this.getZone(position);
      if(zone !== null) {
        return zone.onClick(position);
      }
    }
  });
  
  var Zone = util.extend(Object, 'Zone', {
    constructor: function Zone(rect) {
      this.rect = rect; //Phaser.Rect
      this.items = []; //[Item]
    },
    getItem: function(position) {
     for(var i=0; i<this.items.length; i++) {
        if(this.items[i].containsPoint(position)) {
          return this.items[i];
        }
      }
      return null;
    },
    onClick: function(position) {
      var item = this.getItem(position);
      if(item !== null) {
        return item.onClick(position);
      }
    },
    addItem: function(item) {
      if(item.zone !== null) {
        item.zone.removeItem(item);
      }
      this.items.push(item);
      item.whenKill.add(function() {
        this.items.splice(this.items.indexOf(item), 1);
      }, this);
      item.zone = this;
    },
    removeItem: function(item) {
      this.items.splice(this.items.indexOf(item), 1);
    },
    canPlaceItem: function(draggable) {
      //items can't straddle borders
      if(!this.rect.containsRect(draggable.sprite.getBounds())) {
        return false;
      }
      for(var i=0; i<this.items.length; i++) {
        var item = this.items[i];
        if(item !== draggable && draggable.sprite.getBounds().intersects(item.sprite.getBounds())) {
          return false;
        }
      }
      return true;
    }
  });
  
  function constructZone(world, zoneData) {
    return new Zone(new Phaser.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
  }
  
  function constructPermanentZone(world, zoneData) {
    var zone = constructZone(world, zoneData);
    if(zoneData.items) {
      for(var i=0; i<zoneData.items.length; i++) {
        var itemData = zoneData.items[i];
        zone.addItem(new item.PermanentItem(world, itemData.x, itemData.y, new ingredient.Ingredient(itemData.graphic)));
      }
    }
    return zone;
  }
  
  var ZONE_CONSTRUCTORS = {
    order: constructZone,
    counter: constructZone,
    ingredient: constructPermanentZone,
    stove: constructZone,
    oven: constructZone,
    warm: constructZone
  }
  
  return {
    ZoneContainer: ZoneContainer,
  }
});