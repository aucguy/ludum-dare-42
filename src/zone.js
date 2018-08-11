base.registerModule('zone', function() {
  var util = base.importModule('util');
  var item = base.importModule('item');
  
  var ZoneContainer = util.extend(Object, 'ZoneContainer', {
    constructor: function ZoneContainer(world) {
      this.children = [new PermanentZone( new Phaser.Rectangle(0, 0, 640, 480), world)];
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
    onClick: function(position) {
      for(var i=0; i<this.items.length; i++) {
        if(this.items[i].containsPoint(position)) {
          this.items[i].onClick(position);
        }
      }
    },
    addItem: function(item) {
      this.items.push(item);
      item.onKill.add(function() {
        this.items.splice(this.items.indexOf(item), 1);
      }, this);
    }
  });
  
  var PermanentZone = util.extend(Zone, 'PermanentZone', {
    constructor: function PermanentZone(rect, world) {
      this.constructor$Zone(rect);
      this.addItem(new item.PermanentItem(world, 16, 16));
    }
  });
  
  return {
    ZoneContainer: ZoneContainer,
    PermanentZone: PermanentZone
  }
});