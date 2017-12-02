'use strict';







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



/**
* Get Canvas Description
*
* @return {String}
*/
Canvas.prototype.toString = function()
{
	return 'Canvas("'+ this.id + '")';
}

	var button_resize_start = $('#ie-start-resize');
	var button_resize_submit = $('#ie-button-resize');
	var spec_resize_form = $('#ie-resize-spec-form');
	console.log('image_editor_v2.js loaded!!');
	var newCanvas = new Canvas('ie-canvas',0,0);
	button_resize_start.on('click', function(){
		$(spec_resize_form).css({"display":"block"});
	});
	button_resize_submit.on('click', function(){
		var new_height = $('#ie-resize-height').val();
		var new_width = $('#ie-resize-width').val();

		console.log(new_height);
		console.log(new_width);
		newCanvas.resize(new_height, new_width);
		$(spec_resize_form).css({'display':'none'});

	})
	
	

})






