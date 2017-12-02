'use strict';


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
}
/**
* Resizes the Canvas element.
* @param h - the new height.
* @param w - the new width.
*/
Canvas.prototype.resize = function(h, w)
{
	var current_height = $(this.jstring).height();
	var current_width = $(this.jstring).width();
	console.log(current_height);
}

/**
* Draws the canvas.
* @param
* @param
*
*/

Canvas.prototype.draw = function(image)
{
	var canvas = $(jstring);
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);
}

Canvas.prototype.convertCanvasToImage = function(canvas) 
{	
	var image = new Image();
	image.src = canvas.toDataURL("image/jpg");
	return image;
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




// All actions after this are for when page is finished loading
$(function(){
	console.log('image_editor_v2.js loaded!!');
	var newCanvas = new Canvas('ie-canvas',0,0);
	var varloc = newCanvas.getLocation();
	console.log(varloc);
	newCanvas.resize(500,1000);

})






