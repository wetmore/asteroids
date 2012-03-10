window.onload = function() {
  var V = Vector2D;
  var g = new GEE({ fullscreen: true, context: '2d' });
  var pos, vel, acc, angle, thrust; //ship properties
  var angleDelta, thrustPower; //how much the ship turns
  var exhaust, exhAge, exhSpeed, exhParticles, exhSpread;
  var bullets, bulletSpeed, shotTimer, shotDelay;
  var i;
  var keys;
  var asteroids, astSegments;
  var bgColor, fgColor;
  var score;
  var image;
  var emeric;
  var paused;

  pos = new V.Vector(g.width/2, g.height/2);
  vel = new V.Vector(0, 0);
  acc = new V.Vector(0, 0);
  angle = 0;
  angleDelta = 0.1;
  thrust = 0;
  thrustPower = 0.2;
  bullets = [];
  bulletSpeed = 10;
  shotTimer = 0;
  shotDelay = 10;
  exhaust = [];
  exhAge = 20;
  exhSpeed = 7;
  exhParticles = 4;
  exhSpread = 0.2;
  asteroids = [];
  bgColor = 'black';
  fgColor = 'white';
  score = 0;
  font = '20pt Arial';
  astSegments = 10;
  paused = false;

  image = document.createElement('img');
  image.src = 'assets/template.png';
  emeric = false;

  g.ctx.font = font;  
  g.ctx.strokeStyle = fgColor;
  g.ctx.fillStyle = fgColor;

  keys = {
    'left': false, 'up': false, 'right': false, 'space': false,
    'a': false, 'shift': false, 's': false, 'p': false
  };

  g.keydown = function() {
    switch (g.keyCode) {
      case 37: keys.left = true; break;
      case 38: keys.up = true; break;
      case 39: keys.right = true; break;
      case 32: keys.space = true; break;
      case 65: keys.a = true; break;
      case 16: keys.shift = true; break;
      case 83: keys.s = true; break;
      case 69: keys.e = true; break;
      case 80: keys.p = true; break;
    }
  };

  g.keyup = function() {
    switch (g.keyCode) {
      case 37: keys.left = false; break;
      case 38: keys.up = false; break;
      case 39: keys.right = false; break;
      case 32: keys.space = false; break;
      case 65: keys.a = false; break;
      case 16: keys.shift = false; break;
      case 83: keys.s = false; break;
      case 69: keys.e = false; break;
      case 80: keys.p = false; break;
    }
  };

  function handleKeys() {
    if (!paused) {
      if (keys.left) {
        angle -= angleDelta;
      }
      if (keys.right) {
        angle += angleDelta;
      }
      if (keys.up) {
        thrust = thrustPower; 
        for (i = 0; i < exhParticles; i++) {
          var r = rand(-exhSpread, exhSpread);
          exhaust.push({
              'pos': new V.Vector(pos),
              'vel': new V.Vector(-exhSpeed * Math.cos(angle + r), -exhSpeed * Math.sin(angle + r)),
              'age': 0,
              'death': randInt(exhAge, exhAge + 40)
          });
          exhaust[exhaust.length - 1].vel.add(vel).mult(rand(.5, 1.5));
        }
      } else {
        thrust = 0;
      }
      if (keys.space) {
        if (shotTimer === 0) {
          bullets.push({
              'pos': new V.Vector(pos),
              'vel': new V.Vector(bulletSpeed * Math.cos(angle), bulletSpeed * Math.sin(angle))
          });
          shotTimer = shotDelay;
        }
      } else {
        shotTimer = 0;
      } 
      if (keys.a) { keys.a = false; spawnAsteroid(); }
      if (keys.shift) {
        keys.shift = false;
        for (i = 0; i < 2*Math.PI; i += Math.PI / 25) {
          bullets.push({
              'pos': new V.Vector(pos.x, pos.y),
              'vel': new V.Vector(bulletSpeed * Math.cos(i), bulletSpeed * Math.sin(i))
          }); 
        }
      }
      if (keys.s) {
        angle += Math.PI;
        keys.s = false;
      }
    }
    if (keys.e) {
      emeric = !emeric;
      keys.e = false;
    }
    if (keys.p) {
      paused = !paused;
      keys.p = false;
    }
  };

  function rangeMap(val, l1, h1, l2, h2) {
    return l2 + ((val - l1) / (h1 - l1)) * (h2 - l2);
  }

  function randInt(x, y) {
    return x + Math.floor(Math.random() * ((y - x) + 1));
  };
  
  function rand(x, y) {
    return x + Math.random() * (y - x);
  };

  function srand(x, y, s) {
    return x + Math.seedrandom(s) * (y - x);
  };

  function sq(n) {
    return n * n;
  };
  
  function boundBoxCollide(point, center, w, h) {
    return !(point.x < center.x - w/2 ||
             point.y < center.y - h/2 ||
             point.x > center.x + w/2 ||
             point.y > center.y + h/2);
  };

  function pointLineDist(pt, vertex1, vertex2) {
    var normal = new V.Vector(vertex1.y - vertex2.y, vertex2.x - vertex1.x);
    var u = ((pt.x - vertex1.x) * (vertex2.x - vertex1.x) + (pt.y - vertex1.y) * (vertex2.y - vertex1.y));
    u /= (sq(vertex2.x - vertex1.x) + sq(vertex2.y - vertex1.y));
    var closestLinePoint = V.add(vertex1, V.mult(V.sub(vertex2, vertex1), u));
    return V.sub(pt, closestLinePoint).dot(normal);
  };

  function createAsteroid(params) {
     
    asteroids.push({
        'size': params.size || 3,
        'pos': params.pos || new V.Vector(g.width / 2, g.height / 2),
        'vel': params.vel || new V.Vector(rand(-3, 3), rand(-3, 3)),
        'radius': params.radius || randInt(90, 120),
        'offs': params.offs || [],
        'rot': params.rot || rand(-0.02, 0.02),
        'angle': params.angle || 0
    });
    var roughness = params.roughness || 8;
    for (i = 0;i < astSegments;i++) {
      asteroids[asteroids.length - 1].offs.push(randInt(-roughness, roughness));
    }
  };

  function collisions() {
    for (i = 0; i < asteroids.length; i++) {
      var r = asteroids[i].radius;
      var a = asteroids[i];

      for (var j = 0; j < bullets.length; j++) {
        if (boundBoxCollide(bullets[j].pos, a.pos, 2*r, 2*r)) {
          var bpos = bullets[j].pos;          

          var vec = new V.Vector(bpos.x - a.pos.x, bpos.y - a.pos.y);
          var vec2 = new V.Vector(Math.cos(a.angle), Math.sin(a.angle));
          var ang = vec.angleBetween2Pi(vec2);
          ang = ang < 0 ? Math.PI + (Math.PI + ang) : ang;
          var pt = rangeMap(ang, 0, 2*Math.PI, astSegments, 0);
          pt = Math.floor(pt);
          pt2 = pt + 1 < astSegments ? pt + 1 : 0;
          //TODO clean this up
          var l1 = new V.Vector(a.pos.x+(r+a.offs[pt])*Math.cos(a.angle+(pt/astSegments)*2*Math.PI), a.pos.y+(r+a.offs[pt])*Math.sin(a.angle+(pt/astSegments)*2*Math.PI));
          var l2 = new V.Vector(a.pos.x+(r+a.offs[pt2])*Math.cos(a.angle+(pt2/astSegments)*2*Math.PI), a.pos.y+(r+a.offs[pt2])*Math.sin(a.angle+(pt2/astSegments)*2*Math.PI));

          if (pointLineDist(bpos, l2, l1) < 0) {
            bullets.splice(j, 1);
            j--;
            a.size--;
            switch (a.size) {
              case 2: a.radius = randInt(60, 70); break;
              case 1: a.radius = randInt(20, 30); break;
              case 0: a.radius = 0; break;
            }
            
            score += 10;
 
            if (a.size > 0) {
              for (var k = 0; k < 3 - a.size; k++) {
                createAsteroid({
                  'size': a.size,
                  'pos': new V.Vector(a.pos.x, a.pos.y),
                  'vel': V.add(new V.Vector(rand(-3, 3), rand(-3, 3)), a.vel),
                  'radius': a.size === 2 ? rand(60, 70) : rand(20, 30),
                });
              }
            }
          }
        }
      }
      //player collision
      if (boundBoxCollide(a.pos, pos, 2*r, 2*r)) {
        if (V.dist(pos, a.pos) < r + 25) {
          g.loop = false;
        }
      }
    }
  };

  function wrapEdges(p, w, h) {
    if (p.x < -w) p.x = g.width + w; 
    if (p.y < -h) p.y = g.height + h; 
    if (p.x > g.width + w) p.x = -w; 
    if (p.y > g.height + h) p.y = -h; 
  }

  function update() {
    //ship
    acc.x = thrust * Math.cos(angle);
    acc.y = thrust * Math.sin(angle);
    vel.add(acc);
    pos.add(vel);
    wrapEdges(pos, 10, 10);

    //bullets
    if (shotTimer > 0) shotTimer--;
    for (i = 0; i < bullets.length; i++) {
      bullets[i].pos.add(bullets[i].vel);
    }
    bullets = bullets.filter(function(v) {
      return !(v.pos.x < 0 || v.pos.y < 0 || v.pos.x > g.width || v.pos.y > g.height);
    });

    //thrust particles
    for (i = 0; i < exhaust.length; i++) {
      exhaust[i].pos.add(exhaust[i].vel);
      exhaust[i].age++;
    }
    exhaust = exhaust.filter(function(v) {
      return !(v.pos.x < 0 || v.pos.y < 0 || v.pos.x > g.width || v.pos.y > g.height || v.age >= v.death);
    });
    
    //asteroids
    asteroids = asteroids.filter(function(a) {
      return !(a.size <= 0);
    });

    for (i = 0; i < asteroids.length; i++) {
      asteroids[i].pos.add(asteroids[i].vel);
      asteroids[i].angle += asteroids[i].rot;
      wrapEdges(asteroids[i].pos, asteroids[i].radius, asteroids[i].radius);
    }
    
  }; 

  function render() {
    //render ship
    g.ctx.save();
    g.ctx.translate(pos.x, pos.y);
    g.ctx.rotate(angle);
    g.ctx.beginPath();
    g.ctx.moveTo(10, 0);
    g.ctx.lineTo(-10, 10);
    g.ctx.lineTo(-5, 0);
    g.ctx.lineTo(-10, -10);
    g.ctx.lineTo(10, 0);
    g.ctx.stroke();
    g.ctx.fill();
    g.ctx.closePath();
    g.ctx.restore();

    //bullets
    for (i = 0; i < bullets.length; i++) {
      g.ctx.fillRect(bullets[i].pos.x, bullets[i].pos.y, 5, 5);
    }

    //exhaust
    for (i = 0; i < exhaust.length; i++) {
      var eA = exhaust[i].age;
      var eSize = eA > 3 ? rangeMap(eA, 0, exhaust[i].death, 5, 0) : rangeMap(eA, 0, 3, 0, 5);
      for (var j = 1; j <= 3; j++) {
        var s = 5 * eSize * (1 - (j / 4));
        var alpha = sq(j / 3);
        g.ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        g.ctx.fillRect(exhaust[i].pos.x - s/2, exhaust[i].pos.y - s/2, s, s);
      }
    }

    //asteroids
    for (i = 0; i < asteroids.length; i++) {
      var r = asteroids[i].radius;
      g.ctx.save();
      g.ctx.translate(asteroids[i].pos.x, asteroids[i].pos.y);
      g.ctx.rotate(asteroids[i].angle);
      g.ctx.beginPath();
      g.ctx.moveTo(r, 0);
      for (var j = 0; j < astSegments; j++) {
        var theta = j * (2*Math.PI / astSegments);
        var o = asteroids[i].offs[j];
        g.ctx.lineTo((r + o) * Math.cos(theta), (r + o) * Math.sin(theta));
      }
      g.ctx.lineTo(r, 0);
      g.ctx.stroke();
      g.ctx.closePath();
      if (emeric) {
        g.ctx.clip();
        g.ctx.drawImage(image, -2*r, -2*r, 4*r, 4*r);
      }
      g.ctx.restore();
    }

    //text
    g.ctx.fillText('score: ' + score, 20, 40);
    g.ctx.fillText('fps: ' + Math.ceil(g.frameRate), 20, 65);
    if (paused) {
      g.ctx.fillText('paused', g.width / 2, 40);
    }
  };

  function line(x1, y1, x2, y2) {
    g.ctx.beginPath();
    g.ctx.moveTo(x1, y1);
    g.ctx.lineTo(x2, y2);
    g.ctx.stroke();
    g.ctx.closePath();
  };

  function spawnAsteroid() {
    var spawn;
    var r = randInt(90, 120);
    switch (randInt(0, 3)) {
      case 0: spawn = new V.Vector(rand(-r, g.width + r), -r);
      case 1: spawn = new V.Vector(g.width + r, rand(-r, g.height + r));
      case 2: spawn = new V.Vector(rand(-r, g.width + r), g.height + r);
      case 3: spawn = new V.Vector(-r, rand(-r, g.height + r));
    }
    createAsteroid({
        'pos': spawn,
        'radius': r
    });
  };

  g.draw = function() {
    g.ctx.clearRect(0, 0, g.width, g.height); //clear screen 
    g.ctx.fillStyle = bgColor;
    g.ctx.fillRect(0, 0, g.width, g.height);
    g.ctx.fillStyle = fgColor;
    handleKeys();
    if (!paused) {
      collisions();
      update();
    }
    render();
  }
};
