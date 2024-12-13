const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.font = "20px Arial";
ctx.fillStyle = "black";
ctx.strokeStyle = "black";
var viewport = {
  minx: -10,
  maxx: 10,
  miny: -10,
  maxy: 10,
  zoom: 1
}
const mouse = {
  down: false,
  zooming: false,
  start: {
    x: 0,
    y: 0
  },
  pos: {
    x: 0,
    y: 0
  },
  viewport: {
    minx: -10,
    maxx: 10,
    miny: -10,
    maxy: 10,
    zoom: 1
  }
}
function Clear() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
}
function Box() {
  const center = PointAt(0,0);
  ctx.fillRect(center.x - 40,center.y - 40,20,20);
}
function Circle(center,radius,color = "black") {
  center = PixelAt(center);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.fill();
}
function Display() {
  Clear();
  if(mouse.down || mouse.zooming) {
    Render(10,10);
  } else {
    Render(100,1);
  }
}
function Render(iterations = 10, res = 1) {
  for(var xx = 0; xx < canvas.width / res; xx++) {
    for(var yy = 0; yy < canvas.height / res; yy++) {
      const c = PointAt(xx*res,yy*res);
      var z = c;
      for(var i = 0; i < iterations; i++) {
        z = Iterate(z,c);
        if(PointMath(z,"magnitude") > 4) {
          break;
        }
      }
      if(PointMath(z,"magnitude") < 4) {
        ctx.fillRect(xx*res,yy*res,res,res);
      }
    }
  }
}
function Iterate(z,c) {
  return {
    x: z.x * z.x - z.y * z.y + c.x,
    y: 2 * z.x * z.y + c.y
  }
}
function PointMath(p1,type,p2 = false) {
  switch(type) {
      case("add"):
      return {x: p1.x + p2.x, y: p1.y - p2.y};
      case("subtract"):
      return {x: p1.x - p2.x, y: p1.y - p2.y};
      case("ndivide"):
      return {x: p1.x / p2, y: p1.y / p2};
      case("nmultiply"):
      return {x: p1.x * p2, y: p1.y * p2};
      case("negate"):
      return {x: - p1.x, y: - p1.y};
      case("midpoint"):
      return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
      case("magnitude"):
      return Math.sqrt(p1.x * p1.x + p1.y * p1.y);
      case("distance"):
      return PointMath(PointMath(p1,"subtract",p2),"magnitude");
  }
}
function Map(x,in_min,in_max,out_min,out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function MapPoint(p,in_min,in_max,out_min,out_max) {
  const output = {
    x: (p.x - in_min.x) * (out_max.x - out_min.x) / (in_max.x - in_min.x) + out_min.x,
    y: (p.y - in_min.y) * (out_max.y - out_min.y) / (in_max.y - in_min.y) + out_min.y,
  }
}
function PointAt(xx,yy = "") {
  if(yy === "") {
    return PointAt(xx.x,xx.y);
  }
  const x = Map(xx,0,canvas.width,viewport.minx,viewport.maxx);
  const y = Map(yy,0,canvas.height,viewport.miny,viewport.maxy);
  return {x: x, y: y};
}
function PixelAt(x,y = "") {
  if(y === "") {
    return PixelAt(x.x,x.y);
  }
  const xx = Map(x,viewport.minx,viewport.maxx,0,canvas.width);
  const yy = Map(y,viewport.miny,viewport.maxy,0,canvas.height);
  return {x: xx, y: yy};
}
function UpdateMouse(event) {
  if(event.type == "mousedown") {

  }
  else if(event.type == "mousemove") {

  }
  else if(event.type == "mouseup") {

  }
}
function Pan(viewport, point) {
  const newViewport = {
    minx: viewport.minx - point.x,
    maxx: viewport.maxx - point.x,
    miny: viewport.miny - point.y,
    maxy: viewport.maxy - point.y,
    zoom: viewport.zoom
  };
  return newViewport;
}
function GetPoint(preset) {
  switch(preset) {
    case("mouse"): return PointAt(mouse.pos);
    case("dragStart"): return PointAt(mouse.start);
    case("center"): return {x: 0, y: 0};
    case("screenCenter"): return PointAt({x: canvas.width / 2, y: canvas.height / 2})
  }
}
function Zoom(viewport, amount) {
  amount = Math.pow(2, amount);
  const newViewport = {
    minx: viewport.minx / amount,
    maxx: viewport.maxx / amount,
    miny: viewport.miny / amount,
    maxy: viewport.maxy / amount,
    zoom: viewport.zoom * amount
  };
  return newViewport;
}
function ZoomPoint(viewport, point, amount) {
  var newviewport = Pan(viewport, point);
  newviewport = Zoom(newviewport, amount);
  newviewport = Pan(newviewport, PointMath(point,"negate"));
  if(newviewport.zoom < 1) {
    return viewport;
  }
  return newviewport;
}
canvas.addEventListener("mousedown", function(event) {
  event.preventDefault();
  mouse.down = true;
  mouse.viewport = viewport;
  mouse.pos.x = mouse.start.x = event.pageX;
  mouse.pos.y = mouse.start.y = event.pageY;
  Display();
});
canvas.addEventListener("mousemove", function(event) {
  event.preventDefault();
  mouse.pos.x = event.pageX;
  mouse.pos.y = event.pageY;
  if(mouse.down)
    viewport = Pan(mouse.viewport, PointMath(PointAt(mouse.pos), "subtract", PointAt(mouse.start)));
  Display();
});
canvas.addEventListener("mouseup", function(event) {
  event.preventDefault();
  mouse.down = false;
  Display();
});
canvas.addEventListener("mousewheel", function(event) {
  event.preventDefault();
  mouse.zooming = true;
  const zoom = (event.wheelDelta > 0 ? 1 : -1);
  const pan = PointMath(GetPoint("mouse"),"subtract",GetPoint("mouseStart"));
  viewport = ZoomPoint(viewport, GetPoint("mouse"), (event.wheelDeltaY > 0 ? 1 : -1) * .1);
  //viewport = Pan(viewport, pan);
  Display();
  mouse.zooming = false;
});
Display()
