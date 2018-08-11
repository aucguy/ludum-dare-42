base.registerModule('zoneType', function() {
  var util = base.importModule('util');
  
  var ZoneType = util.extend(Object, 'ZoneType', {
    constructor: function ZoneType(name) {
      this.name = name;
    }
  });
  
  var ZONE_TYPES = {
    ORDER: new ZoneType('order'),
    WARM: new ZoneType('warm'),
    STOVE: new ZoneType('stove'),
    OVEN: new ZoneType('oven'),
    COUNTER: new ZoneType('counter'),
    INGREDIENTS: new ZoneType('ingredients'),
    GARBAGE: new ZoneType('garbage')
  };
  
  return {
    ZONE_TYPES: ZONE_TYPES
  }
});