// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
var shape_counter = 0;
function Shape(x, y, w, h, fill) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.id =  "id" + shape_counter;
  shape_counter++;
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.fillRect(this.x, this.y, this.w, this.h);
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas) {
  // **** First some setup! ****
  
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');
  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****
  
  this.valid = false; // when set to false, the canvas will redraw everything
  this.shapes = [];  // the collection of things to be drawn
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;
  
  // **** Then events! ****
  
  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this;
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].contains(mx, my)) {
        var mySel = shapes[i];
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        myState.valid = false;
        return;
      }
    }
    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }
  }, true);
  canvas.addEventListener('mousemove', function(e) {
    if (myState.dragging){
      var mouse = myState.getMouse(e);
      // We don't want to drag the object by its top-left corner, we want to drag it
      // from where we clicked. Thats why we saved the offset and use it here
      myState.selection.x = mouse.x - myState.dragoffx;
      myState.selection.y = mouse.y - myState.dragoffy;   
      myState.valid = false; // Something's dragging so we must redraw
    }
  }, true);
  canvas.addEventListener('mouseup', function(e) {
    myState.dragging = false;
  }, true);
  // double click for making new shapes
  canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e);
    myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
  }, true);
  
  // **** Options! ****
  
  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;  
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape);
  var shapeString = "<div class='ie-shape-desc' id='shape"+shape.id+"' data-shapeid='"+shape.id+"'>Shape ID:" + shape.id +"</div>";
  var shapeContainer = $('#ie-shapes-container').html();
  $('#ie-shapes-container').html(shapeContainer + shapeString);
  this.valid = false;
}

CanvasState.prototype.removeShape = function(shape)
{
  function typeOf(obj) 
  {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
  }
  var l = (this.shapes.length);
  for (var i = 0; i < l; i++ )
  {
    var id = this.shapes[i].id;
    if (id === shape.id)
    {
      var index = i;
      console.log(this.shapes);
      this.shapes.splice(i,1);
      console.log(this.shapes)
      var shapeIdString = "#shape"+shape.id;
      $(shapeIdString).remove();
      this.valid = false;
    }
  }
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();
    
    // ** Add stuff you want drawn in the background all the time here **
    
    // draw all shapes
    var l = shapes.length;
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];
      // We can skip the drawing of elements that have moved off the screen:
      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
    }
    
    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }
    
    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
init();

function init() {
 // var s = new CanvasState(document.getElementById('canvas1'));
  //s.addShape(new Shape(40,40,50,50)); // The default is gray
  //s.addShape(new Shape(60,140,40,60, 'lightskyblue'));
  // Lets make some partially transparent
  //s.addShape(new Shape(80,150,60,30, 'rgba(127, 255, 212, .5)'));
  //s.addShape(new Shape(125,80,30,80, 'rgba(245, 222, 179, .7)'));
}
function ImageTools(toolbar, canvasState)
{
  this.init = function(toolbar, canvasState)
  {
    this.canvas = document.getElementById('canvas1');
    this.toolbar = toolbar;
    this.button_start_resize = $('#ie-start-resize');
    this.button_resize = $('#ie-button-resize');
    this.button_draw_selector = $('#ie-draw-selector');
    this.button_remove_shape = $('#ie-remove-shape');
    this.resize_spec_form =  $('#ie-resize-spec-form');
    this.canvasState = canvasState;

  }
  this.listeners = function()
  {
    // Listen for first resize button to open modal
    $(this.button_start_resize).on('click', function(){
      $(this.resize_spec_form).show();
    }.bind(this))
    // Listen to submit resize button, effect change on the canvas
    $(this.button_resize).on('click', function(){
      var height = $('#ie-resize-height').val();
      var width = $('#ie-resize-width').val();
      this.resizeCanvas(width, height, this.canvas);
    }.bind(this))
    // Listen for Draw Selector button to put everything in "draw selector mode"
    $(this.button_draw_selector).on('click',function(){
      console.log('in selector mode!');
      document.body.style.cursor = 'crosshair';
      this.drawSelectorMode();
    }.bind(this))
    $(this.button_remove_shape).on('click',function(){
      this.removeShape(this.canvasState);
    }.bind(this))
  }
  this.init(toolbar, canvasState);
  this.listeners();
}

ImageTools.prototype.resizeCanvas = function(w,h, canvas)
{
  canvas.height = h;
  canvas.width = w;
}
ImageTools.prototype.dragSelector = function()
{

}
ImageTools.prototype.listenForSelectorClick = function()
{
    var drag = false;
  $(this.canvas).on('mousedown',function(e){
    drag = true;
    var coords = this.canvasState.getMouse(e);
    var thickness = $('#ie-selector-thickness').val();
    if (thickness == null || thickness === "")
    {
      thickness = 1;
    }
    // create new shape on mousedown event
    var newShape = new Shape(coords.x,coords.y,1,thickness,'#333')
    var shapeId = newShape.id;
    this.canvasState.addShape(newShape);

    // Adding mousemove listener function
    $(this.canvas).on('mousemove', function(e){
      if (drag === true)
      {
        //while dragging is true, continue to add to shape.x equalto mouse.x
        console.log('inside dragging function');
        var current = this.canvasState.getMouse(e);
        var offsetX = newShape.x + current.x;
        console.log(offsetX);
        newShape.w = offsetX;
        this.canvasState.valid = false;         
      }
    }.bind(this))
  }.bind(this));
  $(this.canvas).on('mouseup', function(e){
    console.log('mouse is up now!');
    drag = false;
  });
}

// Puts ImageTools into selector mode
ImageTools.prototype.drawSelectorMode = function(e)
{
  console.log('inside drawSelectorMode() function');
  this.listenForSelectorClick();
}

ImageTools.prototype.removeShape = function(canvas)
{
 var selectedShape = canvas.selection;
 canvas.removeShape(selectedShape);
}
var toolbar = document.getElementById('ie-tools-container');
var newCanvasState = new CanvasState(document.getElementById('canvas1'));
var imagetools = new ImageTools(toolbar,newCanvasState);

// Now go make something amazing!
