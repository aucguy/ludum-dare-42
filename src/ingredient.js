base.registerModule('ingredient', function() {
  var util = base.importModule('util');
  
  var Ingredient = util.extend(Object, 'Ingredient', {
    constructor: function Ingredient(graphic) {
      this.graphic = graphic;
    }
  });
  
  return {
    Ingredient: Ingredient
  };
});