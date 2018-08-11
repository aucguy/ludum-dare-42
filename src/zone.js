base.registerModule('zone', function() {
  var util = base.importModule('util');
  var item = base.importModule('item');
  
  var Zone = util.extend(Object, 'Zone', {
    constructor: function Zone(rect) {
      this.rect = rect; //Phaser.Rect
      this.items = null; //[Item]
    },
    onClick: function(position) {
      for(var i=0; i<this.items.length; i++) {
        if(this.items[i].containsPoint(position)) {
          this.items[i].onClick(position);
        }
      }
    }
  });
  
  var PermanentZone = util.extend(Zone, 'PermanentZone', {
    constructor: function(game, rect, dragHandler) {
      this.constructor$Zone(rect);
      this.items = [];
      this.addItem(new item.PermanentItem(game, dragHandler));
    },
    addItem: function(item) {
      this.items.push(item);
      item.onKill.add(function() {
        this.items.splice(this.items.indexOf(item), 1);
      }, this);
    }
  });
  
  return {
    PermanentZone: PermanentZone
  }
});