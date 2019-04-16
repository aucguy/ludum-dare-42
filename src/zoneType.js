import * as util from '/lib/util.js';

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

export {
  ZONE_TYPES
};