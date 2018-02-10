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
var s;
var selector_canvas;
var shape_counter = 0;
function Shape(x, y, w, h, fill, canvas, type = null, scaleW = null, scaleH = null) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.id =  "id" + shape_counter;
  this.right = this.x + this.w;
  this.left = this.x;
  this.top = this.y;
  this.bottom = this.y + this.h;
  this.canvas_id = canvas;
  this.layer = shape_counter;
  this.type = type;

  if (this.type === "scale")
  {
      
      console.log('inside scale function prototype');

  }
  shape_counter++;
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
  if (this.type === 'image')
  {
    var img_source = this.fill['image'];
    var image = new Image();
    image.src = img_source;
    this.h = image.height;
    this.w = image.width;
    ctx.drawImage(image,this.x,this.y);
    return;
  }
  if (this.type === 'text')
  {
    var text_string = this.fill['text'];
    console.log('matched text')
    console.log(this);
    var font_string = this.fontSize+"px Arial";
    
    var Paint = {
        RECTANGLE_STROKE_STYLE : 'black',
        RECTANGLE_LINE_WIDTH : 1,
        VALUE_FONT : font_string,
        VALUE_FILL_STYLE : this.textColor
    }
    canvas = document.getElementById('canvas1');
    // Obtains the context 2d of the canvas 
    // It may return null
    var ctx2d = canvas.getContext('2d');
    
    if (ctx2d) {
        // draw rectangular
        ctx2d.strokeStyle=Paint.RECTANGLE_STROKE_STYLE;
        ctx2d.lineWidth = Paint.RECTANGLE_LINE_WIDTH;
        ctx2d.strokeRect(this.x, this.y, this.w, this.h);
        
        // draw text (this.val)
        ctx2d.textBaseline = "middle";
        ctx2d.font = Paint.VALUE_FONT;
        ctx2d.fillStyle = Paint.VALUE_FILL_STYLE;
        // ctx2d.measureText(text).width/2 
        // returns the text width (given the supplied font) / 2
        textX = this.x+this.w/2-ctx2d.measureText(text_string).width/2;
        textY = this.y+this.h/2;
        ctx2d.fillText(text_string, this.x+10, this.y+10);
    } else {
        // Do something meaningful
    }

  }
  if (this.type === 'scale')
  {
    var img_source = this.fill['image'];
    var image = new Image();
    image.src = img_source;
    image.height = this.h;
    image.width = this.w;
    ctx.drawImage(image,this.x,this.y, this.w, this.h);
    return;

  }
  else
  {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

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
      // remove the "selected" warning from the watcher area
      var selected_div = document.getElementById('ie-tracker-selected');
      if (shapes[i].contains(mx, my)) {
        var mySel = shapes[i];
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        console.log(shapes[i]);
        var shape_string = "shape"+shapes[i].id;
        console.log(shape_string);
        var shape_tracker = document.getElementById(shape_string);
        shape_tracker.append(selected_div);
        $(selected_div).show();
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
  
  // **** Options! ****
  
  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;  
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape);
  var shapeString = "<div class='ie-shape-desc' id='shape"+shape.id+"' data-shapeid='"+shape.id+"'>Shape ID:" + shape.id +"<button onclick='outsideLayerUp(this)'class='ie-layer-up' id='shape-"+shape.id+"'>UP</button><button onclick='outsideLayerDown(this)' id='shape-"+shape.id+"' class='ie-layer-down'>DOWN</button><span style='display:block; width:100%; height:20px; background-color:"+shape.fill+";' class='ie-color'></span></div>";
  var shapeContainer = $('#ie-shapes-container').html();
  $('#ie-shapes-container').html(shapeContainer + shapeString);
  this.valid = false;
}

CanvasState.prototype.removeShape = function(shape)
{
  console.log(shape);
  var l = this.shapes.length;
  for (var i = 0; i < l; i++ )
  {
    console.log(this.shapes[i]);
    var id = this.shapes[i].id;
    if ((id === shape.id))
    {
      console.log('passed the ID test for removeShape funciton');
      // Send the layer that''s being removed to the sortLayers() function;
      this.sortLayers(this.shapes[i].layer);
      var index = i;
      console.log(this.shapes);
      this.shapes.splice(i,1);
      console.log(this.shapes)
      var shapeIdString = "#shape"+shape.id;
      var shapes_container = $('#ie-shapes-container');
      $('#ie-tracker-selected').appendTo(shapes_container);
      
      
      $(shapeIdString).remove();
      // A shape has been removed, therefore, the counter must be set back 1
      shape_counter = shape_counter -1;
      this.valid = false;
    }
  }
}
CanvasState.prototype.sortLayers = function(layer)
{
  for (var i =0; i < s.shapes.length; i++)
  {
    if (s.shapes[i].layer > layer)
    {
      s.shapes[i].layer = s.shapes[i].layer -1;
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
    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }
  }
}
    
    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  
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
//init();

function init() {
  s = new CanvasState(document.getElementById('canvas1'));
  s.addShape(new Shape(40,40,50,50, "#4286f4")); // The default is gray
  s.addShape(new Shape(60,140,40,60, '#dcf442'));
   //Lets make some partially transparent
  s.addShape(new Shape(80,150,60,30, 'rgba(127, 255, 212, 1)'));
  s.addShape(new Shape(125,80,30,80, 'rgba(245, 222, 179, 1)'));
}
/**
* Author: Brian Moniz
* ImageTools uses the CanvasState prototype to manipulate images within the HTML5 canvas element within the browser
* Site: http://slcutahdesign.com
* 
*/
function ImageTools(canvas)
{
  this.canvas = canvas;
  this.selector_mode = false;
  // Original Canvas State
  this.canvasState = s;
  this.image_hider = document.getElementById('ie-image-hider');
  this.selectorCanvas = document.getElementById('selector-canvas');
  this.file_input = document.getElementById('ie-file-input');
  this.text_input = document.getElementById('ie-text-input');
  this.input_scale_image = document.getElementById('ie-scale-image');
  this.button_new_layer = $('#ie-new-layer');
  this.button_add_layer = $('#ie-button-add-new-layer');
  this.button_remove_selected = $('#ie-remove-shape');
  this.button_selector_mode = $('#ie-selector-mode');
  this.button_selector_mode_off = $('#ie-select-mode-off'); 
  this.button_clear_selector = $('#ie-clear-selector');
  this.button_start_resize = $('#ie-start-resize');
  this.button_resize = $('#ie-button-resize');
  this.button_upload_unhide = $('#ie-upload');
  this.button_text = $('#ie-text');
  this.button_add_text = $('#ie-add-text');
  this.button_scale_image = $('#ie-button-scale-image');

  // Listeners
  this.button_scale_image.on('click', function(){
    $('#ie-scale-image-container').show();
  });
  $('#ie-scale-image').change(this.scaleImage);
  $('#ie-image').change(this.handleImage);
  $(this.button_upload_unhide).on('click', function(){
    $(this.file_input).css({"display":"block"});
  }.bind(this))
  $(this.button_new_layer).on('click', this.newLayer);
  $(this.button_start_resize).on('click', function(){
    $('#ie-resize-spec-form').show();
  });
  $(this.button_resize).on('click', this.resizeCanvas);
  $(this.button_remove_selected).on('click', this.removeSelected);
  $(this.button_selector_mode).on('click', this.selectorMode);
  $(this.button_clear_selector).on('click', function(){
    this.clear(this.selectorCanvas);
  }.bind(this));
  $(this.button_text).on('click', function(){
    $(this.text_input).show();
  }.bind(this))
  $(this.button_add_text).on('click', function(){
    this.addText(this.canvasState, this.canvas);
    $('#ie-text-input').hide();
  }.bind(this));

  bState = this;
}
ImageTools.prototype.getPixels = function(image)
{

    var c = document.getElementById('canvas1');
    var ctx = c.getContext('2d');
        ctx.drawImage(img,0,0);
        return ctx.getImageData(0,0,c.width,c.height);
}

/**
* ImageTools.prototype.addText 
* Will first create a shape with dimensions, then fill the shape with the text, hopefully
*
*
*/

ImageTools.prototype.addText = function(canvasState, canvas)
{
  var text = $('#ie-text-value').val();
  var color = $('#ie-text-color-value').val();
  var fontSize = $('#ie-text-font-size').val();
  var height = $('#ie-text-height').val();
  var width = $('#ie-text-width').val();
  console.log('TEXT VALUE: ' + text);
  console.log('COLOR VALUE: ' + color);
  console.log('FONTSIZE VALUE: ' + fontSize);
  console.log('HEIGHT VALUE: ' + height);
  console.log('WIDTH VALUE: ' + width);
  var fill = {"text":text};
  // Create new shape for the text here
  newShape = new Shape(0,0, width, height, fill, canvas);
  newShape.fontSize = fontSize;
  newShape.textColor = color; 
  newShape.type = 'text';
  // add shape to shapes array
  console.log(s);
  canvasState.addShape(newShape);
}
/**
* ImageTools.prototype.clear(canvas)
* clears the given canvas
* @param canvas
*/
ImageTools.prototype.clear = function(canvas)
{
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
/**
*
* ImageTools.prototype.selectMode() 
* will turn on selector mdoe, which will add a new cancas element directly positioned above the canvas1 element
* #selector-canvas
*/
ImageTools.prototype.selectorMode = function()
{
  // Set Selector mode to ture (reference it later I'm sure)
  selectorCanvas = document.getElementById('selector-canvas');
  // Create canvas state for selector mode
  this.selector_ctx = selectorCanvas.getContext('2d');
  this.selector_mode = true;
  var selectorCanvasState = new CanvasState(selectorCanvas);
  bState.zIndex(selectorCanvas, 100);
  console.log(selectorCanvas);
  console.log(selectorCanvasState);
  bState.drawSelector(selectorCanvasState);
}


/**
* While in selectorMode needs to turn fof all event listeners for CanvasState
* 
*
*/

ImageTools.prototype.selectorModeOff = function()
{

}

/**
*
* ImageTools.prototype.drawSelector()
* @param selectorCanvas, z-index of 100 to make sure it's not touching lower canvas(s)
*
*/
ImageTools.prototype.drawSelector = function(selectorCanvasState)
{
  this.mouseDown = false;
    this.selectorShape;
    var drawSelectorMove = function(e)
    {
      console.log('inside mousemove function');
              var coords = selectorCanvasState.getMouse(e);
              var mouseX = coords.x
              var mouseY = coords.y;
              var offsetX = mouseX - this.selectorShape.x;
              var offsetY = mouseY - this.selectorShape.y;
              console.log(offsetX);
              this.selectorShape.w = offsetX;
              this.selectorShape.h = offsetY;
              selectorCanvasState.valid = false;
    }
    $(selectorCanvas).on('mousedown', function(e)
    {
      this.mouseDown = true;
      console.log('inside mousedown function in drawselector');
      console.log(selectorCanvasState.getMouse(e));
      e.stopPropagation();
      var coords = selectorCanvasState.getMouse(e);
      this.selectorShape = new Shape(coords.x,coords.y,1,1,'rgba(225,225,225,0.5)',selectorCanvas.id);
      // MAke sure to add the shape to the shapes array in CanvasState class
      selectorCanvasState.addShape(this.selectorShape);
      console.log(selectorCanvasState.shapes);
      // keep it inside this mousedown function
      if (this.mouseDown = true)
      {
        selectorCanvas.addEventListener('mousemove', drawSelectorMove);
      }
      e.stopPropagation();
    });

    $(selectorCanvas).on('mouseup', function(e)
    {
      console.log('inside mouseup funciton');
      this.mouseDown = false;
      bState.zIndex(selectorCanvas, -1);

      e.stopPropagation();
    });

}
ImageTools.prototype.arrayMove = function (arr, fromIndex, toIndex)
{
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

ImageTools.prototype.compare =  function(a,b) 
{
  if (a.layer < b.layer)
    return -1;
  if (a.layer > b.layer)
    return 1;
  return 0;
}


ImageTools.prototype.moveTrackerBox =  function(element,direction)
{
  if (direction === 'down')
  {
    sibling = element.nextSibling;
    $(element).insertAfter(sibling); 
  }
  if (direction === 'up')
  {
    sibling = element.previousSibling;
    $(element).insertBefore(sibling);
  }
}
/**
* ImageTools.prototype.findLayer(shapeID)
* @param shapeID - id string of the shape we are looking for
* @return the layer value of the selected shape
*
*/
ImageTools.prototype.findLayer = function(shapeID)
{
  for (var i = 0; i < s.shapes.length; i++)
  {
    var test = (s.shapes[i].id === shapeID);
    if (test)
    {
      return s.shapes[i].layer;
    }
  }
}


/**
*
*
*
*/

ImageTools.prototype.handleImage = function(e)
{
      // This function mounts image onto HMTL5 Canvas

        var reader = new FileReader();
        reader.onload = function(event)
        {
            //var img = new Image();
            //var current_img_height =  0;
            function objectifyImage(i) 
        {
            var img_obj = new Image();
            img_obj.src = i;
            orig_image = img_obj;
            return img_obj;
        }  

      var canvas = document.getElementById('canvas1');
      var context = canvas.getContext('2d');
      i = event.target.result;
      i_obj = objectifyImage(i);
      console.log(i);
      var dataArray = {"image": i};
      var newImgShape = new Shape(0,0,i_obj.width,i_obj.height,dataArray,canvas);
      newImgShape.type = 'image';
      console.log(newImgShape);
      s.addShape(newImgShape);
     $('#ie-file-input').hide();

      }

            
        
        
  reader.readAsDataURL(e.target.files[0]);
}
/**
* ImageTools.prototype.resizeCanvas()
* Resizes canvas while also saving the shapes from being deleted
* @canvas
* @shapes
*/
ImageTools.prototype.resizeCanvas = function()
{
  var shapes = s.shapes;
  var canvas = document.getElementById('canvas1');
  console.log('inside resizeCanvas() function');
  var width = $('#ie-resize-width').val();
  var height = $('#ie-resize-height').val();
  if (!width || !height)
  {
    alert('you need both widht and height');
  }
  else
  {
    canvas.height = height;
    canvas.width = width;
    s = new CanvasState(canvas);
    s.shapes = shapes;
    s.valid = false;
    $('#ie-resize-spec-form').hide();
  }
}
ImageTools.prototype.findShape = function(shapeID)
{
  for (var i = 0; i < s.shapes.length; i++)
  {
    var test = (s.shapes[i].id === shapeID);
    if (test)
    {
      return s.shapes[i];
    }
  }
}

ImageTools.prototype.changeLayer = function(shape, direction)
{
  if (direction === 'up')
  {

  }

}
 

ImageTools.prototype.shapeByLayer = function(layer)
{
  for (var i = 0; i < s.shapes.length; i++)
  {

    var test = s.shapes[i].layer;

    if ( test === layer)
    {
      console.log('in the if part of the shapeByLayer function');
      return s.shapes[i];
    }
  }
}

/**
* ImageTools.prototype.layerPriorityDown
* Changes how draw array is sorted, layer properties on shape object
*
*/

ImageTools.prototype.layerPriorityDown = function(element)
{
  console.log('inside priorityDown func');
  var shapeb4 = s.shapes;
  var spec_shape_length = s.shapes.length - 1;
  var target = element;
  var parent = target.parentNode;
  var shapeID = target.id;
  var shapeID = shapeID.split('-');
  var shapeID = shapeID[1];
  var layer = bState.findLayer(shapeID);
  console.log(layer);
  var actualShape = bState.findShape(shapeID);
  // Make sure layer isn't already at the top
  if (layer === 0)
  {
    alert('you can\'t move it down, its at the bottom!');
  }
  console.log(layer);
  var actualShape = bState.findShape(shapeID);
  console.log(actualShape);
  var newLayer = layer-1;
  console.log(newLayer);
  var changeShape = bState.shapeByLayer(newLayer);
  actualShape.layer = newLayer;
  changeShape.layer = layer;

  // Move trackerbox to proper position
  bState.moveTrackerBox(parent, 'up');



  s.valid = false;
  var testArray = s.shapes;
  for (var i = 0; i < testArray.length; i++)
  {

  }
  var sorted = testArray.sort(bState.compare);
  console.log(sorted);
}


/**
* ImageTools.prototype.layerPriorityUp
* Changes how draw array is sorted, changes layer value in shape objects
*
*/
ImageTools.prototype.layerPriorityUp = function(element)
{

  var shapeb4 = s.shapes;
  var spec_shape_length = s.shapes.length - 1;
  var target = element;
  var parent = target.parentNode;
  var shapeID = target.id;
  var shapeID = shapeID.split('-');
  var shapeID = shapeID[1];
  var layer = bState.findLayer(shapeID);
  console.log(layer);
  var actualShape = bState.findShape(shapeID);
  // Make sure layer isn't already at the top
  if (layer === (s.shapes.length -1))
  {
    alert('you can\'t move it up, its at the top!');
  }
  console.log(layer);
  var newLayer = layer+1;
  console.log(newLayer);
  var changeShape = bState.shapeByLayer(newLayer);

  // Move trackerbox to proper position
  bState.moveTrackerBox(parent, 'down');


  // Some tricks to make the layers be sorted properly in the array for drawing
  for (var i = 0; i < s.shapes.length; i++)
  {
    if (s.shapes[i].id === shapeID)
    {
      console.log('passed the id  test!!');
      // test here to see if it's at the end of the array
      var testLength = s.shapes.length;
      var testIndex = i+1;
      console.log("Shapes array  length"+testLength);
      console.log("Test Index New:" + testIndex);
      //var brandNew = s.shapes[i]
      var actualShape = s.shapes[i];
      var newIndex = i+1;
      var movedShape = s.shapes[i+1];
      // need to change layer number here
      s.shapes[i].layer = s.shapes[i].layer = i+1;;
      s.shapes[i+1].layer = s.shapes[i++].layer - 1;
    }
  }
  s.valid = false;
  var testArray = s.shapes;
  for (var i = 0; i < testArray.length; i++)
  {

  }
  var sorted = testArray.sort(bState.compare);
  console.log(sorted);
}

/**
* ImageTools.prototype.zIndex()
* @param z-index
* @param element
*/
ImageTools.prototype.zIndex = function(element, param)
{
  $(element).css({"z-index":param});
}



/**
*
* Creates a new layer using canvas state width and height (s)
*
*/
ImageTools.prototype.newLayer = function()
{
  $('#ie-new-layer-holder').show();
  var makeLayer = function()
  {
    var color = $('#ie-layer-color').val();
    var newHeight = $('#ie-layer-height').val();
    var newWidth = $('#ie-layer-width').val();
    if (newHeight === null)
    {
      newHeight = 10;
    }
    if (newWidth === null)
    {
      newWidth = 10;
    }
    var newShape = new Shape(0,0,newWidth,newHeight,color);
    s.addShape(newShape);
    console.log('in the makelayer function!');
    $('#ie-new-layer-holder').hide();
  }
  $('#ie-button-add-new-layer').on('click', makeLayer);
}


/**
* ImageTools.prototype.createListener()
* @param element
* @param action
* @param func
*/
ImageTools.prototype.createListener = function(element, action, func)
{
  $(element).on(action, func);

}
/**
*
* Uses CanvasState.prototype.removeShape (That I wrote on top) to remove the shape form the array of shapes that is drawn by the loop
*
*/
ImageTools.prototype.removeSelected = function()
{
  var selected = s.selection;
  var typeOf = selected.fill instanceof Object;
  if (typeOf)
  {
    // We need to recreate the whole canvas to remove an image, it's not as simple as the shapes
    // Also made sure to save the s.shapes array as a var so I can put them back on the cleared canvas
    console.log('we have got a match in typeOf removeSelected()');
    s.removeShape(selected);
    //s.clear();
    var canvas = document.getElementById('canvas1');
    var shapes = s.shapes;
    console.log(shapes);
    /*s = new CanvasState(canvas);
    
    //s.shapes = shapes;
    s.valid = false;*/
  }
  else
  {
    s.removeShape(selected);
  }
}
/**
* ImageTools.prototype.shrinkImage(event)
* @param event   --  what event initially fired the listener call to get here
* 
*
*
*/
ImageTools.prototype.shrinkImage = function(event)
{
  console.log('in the shrinkImage() function');
  console.log("Event: " + event);

  // This function mounts image onto HMTL5 Canvas changing its dimensions to fit inside it
        var reader = new FileReader();
        reader.onload = function(event)
        {

         var image_hider = document.getElementById('ie-image-hider');
          image_hider.onload = function()
          {
            console.log(image_hider.width);
            var aspectRatio = function(w,h){
              if (w > h)
              {
                var aR = h/w;
              }
              else
              {
                var aR = w/h;
                console.log("AR:"+aR);
              }
              return aR;
            }
            var theAspectRatio = aspectRatio(image_hider.width, image_hider.height);
            console.log(theAspectRatio);
            var canvas = document.getElementById('canvas1');
            var newWidth = Math.round(canvas.width * theAspectRatio);
            var newHeight = Math.round(canvas.height * theAspectRatio);
            console.log("NEW WIDTH:" + newWidth);
            console.log('NEW HEIGHT:' + newHeight);
            var dataArray = {"image": i};
            var newImgShape = new Shape(0,0,newWidth,newHeight,dataArray,canvas, 'scale');
            s.addShape(newImgShape);
            console.log('changing image hider source');
            image_hider.setAttribute('src','');
          };
          i = event.target.result;
          image_hider.setAttribute('src', i);

        }




  reader.readAsDataURL(event.target.files[0]);
}

/**
* ImageTools.prototype.resizeCanvasImage(event)
* @param event   --  what event initially fired the listener call to get here
* 
*
*
*/

ImageTools.prototype.resizeCanvasImage = function(event)
{
    console.log('in the resizeCanvasImage() function');
    console.log("Event: " + event);
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.documentElement.clientHeight;
    windowWidth = windowWidth - (windowWidth * .1);
    windowHeight = windowHeight - (windowHeight * .1);

    console.log("Window Width: "+ windowWidth);
    console.log("Window Height: "+ windowHeight);
      // This function mounts image onto HMTL5 Canvas, making canvas big enough to fit image in fullscreen, or resize image to fit fullscreen canvas
        var reader = new FileReader();
        reader.onload = function(event)
        {
          var canvas = document.getElementById('canvas1');
          var image_hider = document.getElementById('ie-image-hider');
          image_hider.onload = function()
          {
            console.log(image_hider.width);
            if (image_hider.width > windowWidth || image_hider.height > windowHeight)
            {
              shapes = s.shapes;
              console.log('picture is too big as it is');
              canvas.height = windowHeight;
              canvas.width = windowWidth;
              s = new CanvasState(canvas);
              s.shapes = shapes;
              s.valid=false;
              var aspectRatio;
              if ( image_hider.width > image_hider.height)
              {
                aspectRatio = Math.round(image_hider.height / image_hider.width);
              }
              if ( image_hider.height > image_hider.width)
              {
                aspectRatio = Math.round(image_hider.width / image_hider.height);
              }
              var calcWidth = image_hider.width * aspectRatio;
              var calcHeight = image_hider.height * aspectRatio;
              var dataArray = {"image": i};
              var newImgShape = new Shape(0,0,calcWidth,calcHeight,dataArray,canvas, 'scale');
              s.addShape(newImgShape);
            }
            else
            {
              console.log('inside the else')
              shapes = s.shapes;
              canvas.height = image_hider.height;
              canvas.width = image_hider.width;
              s = new CanvasState(canvas);
              s.shapes = shapes;
              s.valid = false;
              // Mount imaGE TO tailored canvas
              var dataArray = {"image": i};
              var newImgShape = new Shape(0,0,canvas.width,canvas.height, dataArray, canvas, 'scale');
              s.addShape(newImgShape);
            }
            

          };
          i = event.target.result;
          image_hider.setAttribute('src', i);


          }
          reader.readAsDataURL(event.target.files[0]);
      
}
/**
* ImageTools,prototype.scaleImage
* @param image - the image to be scaled
* Scales image to canvas while maintaining aspect ratio is the goal
*
*/
ImageTools.prototype.scaleImage = function(e)
{
  console.log('in the scale image function');
  var event = e;
  var selection = document.getElementsByClassName('ie-scale-choose');
  var selection_value;
  for ( var i = 0; i < selection.length; i++)
  {
    if (selection[i].checked)
      {
        selection_value = selection[i].value;
      }
  }

  switch (selection_value)
  {
    case "shrink" : bState.shrinkImage(event);
                    break;
    case "resize" : bState.resizeCanvasImage(event);
                    break;
      default : console.log('in the default');
    break;
  }
  $('#ie-scale-image-container').hide();
  
}

var imagetools = new ImageTools(document.getElementById('canvas1'));
var upButtons = document.getElementsByClassName('ie-layer-up');
var length = upButtons.length;
for (var i=0; i < length; i++ )
{
  //imagetools.createListener(upButtons[i],'click',imagetools.layerPriorityUp);
}


var downButtons = document.getElementsByClassName('ie-layer-down');
for (var i= 0; i < downButtons.length; i++)
{
  //imagetools.createListener(downButtons[i], 'click', imagetools.layerPriorityDown);
}
var outsideLayerUp = function(element)
{
  var element = element;
  console.log('got to the outsidelayerup function!');
  console.log(element);
  imagetools.layerPriorityUp(element);
}
var outsideLayerDown = function(element)
{
  var element = element;
  console.log('got to the outsidelayerup function!');
  console.log(element);
  imagetools.layerPriorityDown(element);
}
var closeDiv = function(id)
{
  target = id;
  domElement = document.getElementById(target);;
  $(domElement).remove();
}


$('#ie-controls-container').draggable();
$('#ie-shapes-container').draggable();

