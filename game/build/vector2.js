var Vector2D = (function () {
    //private
    var my = {},
    privateVariable = 1;
    function privateMethod() {
    return 4;
    }
    //public

    my.Vector = function (x,y) {
    this.x = x;
    this.y = y;
    }

    my.Vector.prototype.mag = function () {
    return Math.sqrt(this.x*this.x + this.y*this.y);
    //return Math.sqrt(v1.x*v1.x + v1.y*v1.y);
    };

    my.Vector.prototype.dot = function (v) {
    return this.x*v.x + this.y*v.y;
    };

    my.Vector.prototype.norm = function () {
      var mag = this.mag();
      return new my.Vector(this.x/mag,this.y/mag);
    };

    my.Vector.prototype.add = function (v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    };

    my.Vector.prototype.sub = function (v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    };

    my.Vector.prototype.mult = function (n) {
      this.x *= n;
      this.y *= n;
      return this;
    };

    my.Vector.prototype.div = function (n) {
      this.x /= n;
      this.y /= n;
      return this;
    };

    my.Vector.prototype.angleBetween = function (v) {
      return Math.acos(this.dot(v)/(this.mag()*v.mag()));
    };

    my.Vector.prototype.clone = function (v) {
      this.x = v.x;
      this.y = v.y;
    };

    my.Vector.prototype.dist = function (v1) {
      var v2 = this;
      return Math.sqrt((v2.x-v1.x)*(v2.x-v1.x)+(v2.y-v1.y)*(v2.y-v1.y));
    };
  
    return my;
}());
