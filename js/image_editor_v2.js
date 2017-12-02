'use strict';



var canvas = document.getElementById('ie-canvas');



// All actions after this are for when page is finished loading
$(function(){


/**
* Canvas Class
* @constructor
* @param {String} id - The id.
* @param {Number} x - The x coordinate
* @param {Number} y - The y coordinate
*/

function Canvas(id, x, y)
{
	this.id = id;
	this.jstring = "#"+this.id;
	this.element = document.getElementById('ie-canvas');
	this.setLocation(x,y);
}

/**
* Set Canvas Location.
*
* @param {Number} - The x coordinate.
* @param {Number} - The y coordinate.
*/
Canvas.prototype.setLocation = function(x,y)
{
	this.x = x;
	this.y = y;
};


/**
* Get Canvs Location.
*
* @return {Object}
*/

Canvas.prototype.getLocation = function()
{
	return { x: this.x, y: this.y };
};

/**
* Move Canvas to new X Y coordinates.
* @param x - the X coordinate.
* @param y - the Y coordinate.
*/
Canvas.prototype.moveCanvas = function(x ,y)
{
	this.setLocation(x,y);
	$(this.jstring).css({'top':this.x,"left":this.y});
};
/**
* Resizes the Canvas element.
* @param h - the new height.
* @param w - the new width.
*/
Canvas.prototype.resize = function(h, w)
{
	var current_height = $(this.jstring).height();
	var current_width = $(this.jstring).width();
	this.element.height = h;
	this.element.width = w;
};

/**
* Draws the canvas.
* @param
* @param
*
*/

Canvas.prototype.draw = function(image)
{
	//this.canvas.width = image.width;
	//this.canvas.height = image.height;
	var ctx = document.getElementById('ie-canvas').getContext("2d");
	console.log(image);
	//ctx.drawImage(image, 0, 0);
};

/**
* Creates a square on the canvas
* @param w - the width
* @param h - the height
* @param color - the color (might take hex values?)
* @param offsetX - how much offset x you want
* @param offsetY - how much offset y you want
*
*/
Canvas.prototype.square =function(w,h, color, offsetX, offsetY)
{
	if (!offsetY)
	{
		// Set default to 0
		var offsetY = 0;
	}
	if (!offsetX)
	{
		// Set default to zero
		var offsetX = 0;
	}
	var c = this.element;
	var ctx = c.getContext("2d");

	ctx.beginPath();
	// ctx.rect(offsetX,offsetY,width,height)
	ctx.rect(offsetX, offsetY, w, h);
	ctx.fillStyle = color;
	ctx.fill();
}

/*
* Converts canvas element to image object
*
*
*/
Canvas.prototype.convertCanvasToImage = function(canvas) 
{	
	var image = new Image();
	image.src = canvas.toDataURL("image/jpg");
	return image;
};	

/**
* Turns image into usable object
*
*
*/	
Canvas.prototype.objectifyImage = function(i)
{
    var img_obj = new Image();
	img_obj.src = i;
	orig_image = img_obj;
	return img_obj;
};
Canvas.prototype.canvasState = function(canvas) 
{
  
  // ...

  // I removed some setup code to save space
  // See the full source at the end


  // **** Keep track of state! ****
  
  this.valid = false; // when set to true, the canvas will redraw everything
  this.shapes = [];  // the collection of things to be drawn
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object.
  // In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;

  // ...
  // (We are still in the CanvasState constructor)

  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this;
  this.mousedown = function(e) 
  {
  	console.log('in mousedown listener in Canvas.canvasState() fucntion');
    var mouse = this.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) 
    {
      if (shapes[i].contains(mx, my)) 
      {
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
    if (myState.selection) 
    {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }
  }.bind(this)
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', this.mousedown, true);
}

/**
* Get Canvas Description
*
* @return {String}
*/
Canvas.prototype.toString = function()
{
	return 'Canvas("'+ this.id + '")';
}


var ImageTools = function()
{
	this.init = function()
	{
		console.log('image_editor_v2.js loaded!!');

		this.newCanvas = new Canvas('ie-canvas',0,0);
		this.newCanvas.canvasState(canvas);
		this.button_resize_start = $('#ie-start-resize');
		this.button_resize_submit = $('#ie-button-resize');
		this.spec_resize_form = $('#ie-resize-spec-form');
	}
	this.listeners = function()
	{
		this.button_resize_start.on('click', function()
		{
			$(this.spec_resize_form).css({"display":"block"});
		}.bind(this))
		this.button_resize_submit.on('click', function()
		{
			var new_height = $('#ie-resize-height').val();
			var new_width = $('#ie-resize-width').val();

			console.log(new_height);
			console.log(new_width);
			this.newCanvas.resize(new_height, new_width);
			$(this.spec_resize_form).css({'display':'none'});
		}.bind(this))
	}
	
	this.init();
	this.listeners();
}	
var image_tools = new ImageTools();
	

});






