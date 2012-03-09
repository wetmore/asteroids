var Vector2D = (function() {
  var my = {};
  // private function to create error messages if vector functions are given bad
  // arguments. Since incorrect arguments often lead to incorrect behavior
  // that js nonetheless lets occur (NaN, etc), some warning why the vectors
  // are breaking is nice
  var types = function(atypes) {
    var args = arguments.callee.caller.arguments;
    var which, type;
    for (var i=0; i < args.length; i++) {
      which = i === 0 ? 'first' : 'second';
      // we assume an object is a vector iff its keys are x and y, which correspond to
      // numbers. Might not be the most accurate, but it works for our purposes, and
      // prevents problems that would lead to NaN, etc 
      type = typeof args[i];
      if (type === 'object') {
        if (Object.keys(args[i]).toString() === 'x,y' &&
            typeof args[i].x === 'number' &&
            typeof args[i].y === 'number') {
          type = 'vector';
        }
      }
      if (type !== atypes[i]) {
        console.error(which + ' argument is ' + type + ', expected ' + atypes[i]);
        console.groupCollapsed('details');
        console.error('In function:\n' + args.callee);
        console.error('which was called by:\n' + args.callee.caller);
        console.groupEnd();
      }
    }
  };
  
  // constructor
  my.Vector = function(x, y) {
    if (typeof y !== 'undefined') { // arguments correspond to components
      types(['number', 'number']);
      this.x = x;
      this.y = y;
    } else { // interpret the first argument as a vector
      types(['vector']);
      this.clone(x);
    }
  };

  // clone function
  my.Vector.prototype.clone = function(v) { //clone
    types(['vector']);
    this.x = v.x;
    this.y = v.y;
  };

  // static vector operations
  // these operations return a new vector without changing the operands
  my.add = function(v1, v2) { 
    types(['vector', 'vector']);
    return new my.Vector(v1.x + v2.x, v1.y + v2.y);
  };

  my.sub = function(v1, v2) {
    types(['vector', 'vector']);
    return new my.Vector(v1.x - v2.x, v1.y - v2.y);
  };

  my.mult = function(v, n) {
    types(['vector', 'number']);
    return new my.Vector(n * v.x, n * v.y);
  };

  my.div = function(v, n) {
    types(['vector', 'number']);
    return new my.Vector(v.x / n, v.y / n);
  };

  // other static vector functions
  my.dist = function(v1, v2) {
    types(['vector', 'vector']);
    return Math.sqrt((v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y));
  }; 

  // modifying vector operations
  // these operations modify the first vector they operate on. They also return
  // the modified vector for chaining
  my.Vector.prototype.add = function(v) {
    types(['vector']);
    this.clone(my.add(this, v));
    return this;
  };

  my.Vector.prototype.sub = function(v) {
    types(['vector']);
    this.clone(my.sub(this, v));
    return this;
  };

  my.Vector.prototype.mult = function(n) {
    types(['number']);
    this.clone(my.mult(this, n));
    return this;
  };

  my.Vector.prototype.div = function(n) {
    types(['number']);
    this.clone(my.div(this, n));
    return this;
  };

  // other vector functions
  my.Vector.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  my.Vector.prototype.dot = function(v) {
    types(['vector']);
    return this.x * v.x + this.y * v.y;
  };

  my.Vector.prototype.norm = function() {
    var mag = this.mag();
    return new my.Vector(this.x / mag, this.y / mag);
  };

  my.Vector.prototype.angleBetween = function(v) {
    types(['vector']);
    return Math.acos(this.dot(v) / (this.mag() * v.mag()));
  };

  my.Vector.prototype.angleBetween2Pi = function(v) {
    types(['vector']);
    var v2 = this;
    return Math.atan2(v.x * v2.y - v2.x * v.y, v.x * v2.x + v.y * v2.y) % (2 * Math.PI);
  };

  my.Vector.prototype.dist = function(v) {
    types(['vector']);
    var v2 = this;
    return Math.sqrt((v2.x - v.x) * (v2.x - v.x) + (v2.y - v.y) * (v2.y - v.y));
  };

  return my;
}());
