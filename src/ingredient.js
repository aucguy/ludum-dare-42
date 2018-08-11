base.registerModule('ingredient', function() {
  var util = base.importModule('util');
  
  var Ingredient = util.extend(Object, 'Ingredient', {
    constructor: function Ingredient(graphic) {
      this.graphic = graphic;
    }
  });
  
  function mix(a, b) {
    if(a.graphic === 'image/flour' && b.graphic === 'image/yeast' ||
      b.graphic === 'image/flour' && a.graphic === 'image/yeast') {
      return new Ingredient('image/water');
    } else {
      return null;
    }
  }
  
  return {
    Ingredient: Ingredient,
    mix: mix
  };
});