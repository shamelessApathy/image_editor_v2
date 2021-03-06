<img id='ie-image-hider' src=""/>
<div id='ie-resize-hider'></div>
<div class='container'>
<h1 style='text-align:center;'> You are in the image editor template</h1>
<p style='text-align:center;'>Remeber to hit the "Demo Shapes" button to start!!!</p>


<canvas id="canvas1" width="400" height="300">
    This text is displayed if your browser does not support HTML5 Canvas.
   </canvas>


<div id='ie-text-input'>
	<label>Text</label><br>
	<input type='text' id='ie-text-value' placeholder='text you want here'/><br>
	<label>Color</label><br>
	<input type='text' id='ie-text-color-value' placeholder='#333333'/><br>
	<label>Font Size</label><br>
	<input type='number' id='ie-text-font-size' placeholder='10'/><br>
	<label>Height</label><br>
	<input type='number' id='ie-text-height' placeholder='50'/><br>
	<label>Width</label><br>
	<input type='number' id='ie-text-width' placeholder='100'/><br>
	<button type='button' id='ie-add-text'>Add Text</button>
</div>
<div id='ie-scale-image-container'>
	<span class='ie-close'><button onclick="closeDiv('ie-scale-image-container')">X</button></span>
	<p>Upload scaled image</p>
		<input type='file' id='ie-scale-image'/><br>
		<label>Shrink Image</label>
		<input type='radio' class='ie-scale-choose' name='scale-action' value='shrink' id='ie-shrink'/><br>
		<label>Keep Natural</label>
		<input type='radio' name='scale-action' class='ie-scale-choose' value='resize' id='ie-scale-resize'/>
</div>
<div id='ie-file-input'>
		<span class='ie-close'><button>X</button></span>
		<h4>Choose your image to edit</h4>
		<input type='file' id='ie-image' name='ie-image'/>
		</div>
		<div id='ie-new-layer-holder'>
			<span class='ie-close'><button onclick="closeDiv('ie-new-layer-holder')">X</button></span>
			<p>New Layer Options</p>
		<input type='color' id='ie-layer-color' placeholder='color'/>
		<input type='number' id='ie-layer-width' placeholder='width'/>
		<input type='number' id='ie-layer-height' placeholder='height'/>
		<button type='button' id='ie-button-add-new-layer'>Add Layer</button>
		</div>
<div id='ie-controls-container' class='ui-draggable' >
	<div class='ie-control' id='ie-resize'>
		<button id='ie-start-resize'>Resize</button>
		<div id='ie-resize-spec-form'>
			<label>Height:</label>
			<input name='height' id='ie-resize-height' placeholder='height' type='number'/><br>
			<label>Width:</label>
			<input name='width' placeholder='width' id='ie-resize-width' type='number'/><br>
			<button type='button' id='ie-button-resize'>Resize Canvas</button>
		</div>
	</div>
	<div class='ie-control'>
		<button id='ie-remove-shape'>Remove Selected</button>
	</div>

	<div class='ie-control'>
		<button title='Upload' class='ie-icon' id='ie-upload'>Insert</button>
	</div>
	<div class='ie-control'>
		<button title='Add Text' class='ie-icon' id='ie-text'>Add Text</button>
	</div>
	<div class='ie-control'>
		<button title='Demo Shapes' onClick='init()'>Demo Shapes</button>
	</div>
	<div class='ie-control'>
		<button id='ie-button-scale-image'>Scale Image</button>
	</div>
	<div class='ie-control' style='border-bottom:none;'>
		<button id='ie-new-layer'>New Layer</button><br>
	</div>
</div> 



<div id='ie-shapes-container'>
	<h4>This is the shape container</h4>
	<p id='ie-tracker-selected'>SELECTED</p>
</div>
</div> 