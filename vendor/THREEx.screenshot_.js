/** @namespace */
var THREEx	= THREEx 		|| {};

// TODO http://29a.ch/2011/9/11/uploading-from-html5-canvas-to-imgur-data-uri
// able to upload your screenshot without running servers

// forced closure
(function(){

	/**
	 * Take a screenshot of a renderer
	 * - require WebGLRenderer to have "preserveDrawingBuffer: true" to be set
	 * - TODO is it possible to check if this variable is set ? if so check it
	 *   and make advice in the console.log
	 *   - maybe with direct access to the gl context...
	 * 
	 * @param {Object} renderer to use
	 * @param {String} mimetype of the output image. default to "image/png"
	 * @param {String} dataUrl of the image
	*/
	var toDataURL	= function(renderer, mimetype)
	{
		mimetype	= mimetype	|| "image/png";
		var dataUrl	= renderer.domElement.toDataURL(mimetype);
		return dataUrl;
	}

	/**
	 * resize an image to another resolution while preserving aspect
	 *
	 * @param {String} srcUrl the url of the image to resize
	 * @param {Number} dstWidth the destination width of the image
	 * @param {Number} dstHeight the destination height of the image
	 * @param {Number} callback the callback to notify once completed with callback(newImageUrl)
	*/
	var _aspectResize	= function(srcUrl, dstW, dstH, callback){
		// to compute the width/height while keeping aspect
		var cpuScaleAspect	= function(maxW, maxH, curW, curH){
			var ratio	= curH / curW;
			if( curW >= maxW && ratio <= 1 ){ 
				curW	= maxW;
				curH	= maxW * ratio;
			}else if(curH >= maxH){
				curH	= maxH;
				curW	= maxH / ratio;
			}
			return { width: curW, height: curH };
		}
		// callback once the image is loaded
		var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
		var onLoad	= __bind(function(){
			// init the canvas
			var canvas	= document.createElement('canvas');
			canvas.width	= dstW;	canvas.height	= dstH;
			var ctx		= canvas.getContext('2d');

			// TODO is this needed
			ctx.fillStyle	= "black";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// scale the image while preserving the aspect
			var scaled	= cpuScaleAspect(canvas.width, canvas.height, image.width, image.height);

			// actually draw the image on canvas
			var offsetX	= (canvas.width  - scaled.width )/2;
			var offsetY	= (canvas.height - scaled.height)/2;
			ctx.drawImage(image, offsetX, offsetY, scaled.width, scaled.height);

			// dump the canvas to an URL		
			var mimetype	= "image/png";
			var newDataUrl	= canvas.toDataURL(mimetype);
			// notify the url to the caller
			callback && callback(newDataUrl)
		}, this);

		// Create new Image object
		var image 	= new Image();
		image.onload	= onLoad;
		image.src	= srcUrl;
	}
	
    /** Resize without preserving aspect ratio */
	var _resize = function (srcUrl, dstW, dstH, callback) {
	    // callback once the image is loaded
	    var __bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; };
	    var onLoad = __bind(function () {
	        // init the canvas
	        var canvas = document.createElement('canvas');
	        canvas.width = dstW; canvas.height = dstH;
	        var ctx = canvas.getContext('2d');

	        // TODO is this needed
	        ctx.fillStyle = "black";
	        ctx.fillRect(0, 0, canvas.width, canvas.height);

	        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

	        // dump the canvas to an URL		
	        var mimetype = "image/png";
	        var newDataUrl = canvas.toDataURL(mimetype);
	        // notify the url to the caller
	        callback && callback(newDataUrl)
	    }, this);

	    // Create new Image object
	    var image = new Image();
	    image.onload = onLoad;
	    image.src = srcUrl;
	}



	var takeScreen = function (renderer, opts) {
	    opts = opts || {};
	    var dataUrl = this.toDataURL(renderer);
	    var callback = opts.callback || function (url) {
	        window.open(url, "name-" + Math.random());
	    };
	    if (opts.width === undefined && opts.height === undefined) {
	        callback(dataUrl)
	    } else {
	        // resize it and notify the callback
	        // * resize == async so if callback is a window open, it triggers the pop blocker

	        if (opts.absoluteResize)
	            _resize(dataUrl, opts.width, opts.height, callback);
            else
	            _aspectResize(dataUrl, opts.width, opts.height, callback);
	    }
	};

	// export it	
	THREEx.Screenshot	= {
		toDataURL	: toDataURL,
		takeScreen		: takeScreen
	};
})();
