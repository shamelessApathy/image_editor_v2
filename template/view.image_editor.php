<h1> You are in the image editor template</h1>


<canvas id="canvas1" width="400" height="300">
    This text is displayed if your browser does not support HTML5 Canvas.
   </canvas>




<div id='ie-controls-container'>
	<div class='ie-control' id='ie-resize'>
		<button id='ie-start-resize'>Resize</button>
		<div id='ie-resize-spec-form'>
			<label>Height:</label>
			<input name='height' id='ie-resize-height' placeholder='height' type='number'/><br>
			<label>Width:</label>
			<input name='width' placeholder='height' id='ie-resize-width' type='number'/><br>
			<button type='button' id='ie-button-resize'>Resize Canvas</button>
		</div>
	</div>
	<div class='ie-control'>
		<button id='ie-draw-selector'>Draw Selector</button>
		<label>Thickness</label><br>
		<input style='width:50px;' id='ie-selector-thickness' type='number'/>
	</div>
	<div class='ie-control'>
		<button id='ie-remove-shape'>Remove Selected</button>
	</div>
	<div class='ie-control'>
		<button id='ie-new-layer'>New Layer</button>
		<input type='text' id='ie-layer-color'/>
	</div>
</div> 



<div id='ie-shapes-container'>
	<h4>This is the shape container</h4>
</div>