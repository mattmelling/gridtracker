/*
 * L.TileLayer.Grayscale is a regular tilelayer with grayscale makeover.
 * Actually, it's an invert and brightness method you're welcome  ( N0TTL )
 */

 
 var g_kernels = {
        none: [
          0, 0, 0,
          0, 1, 0,
          0, 0, 0
        ],
        sharpen: [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ],
        sharpenLess: [
          0, -1, 0,
          -1, 10, -1,
          0, -1, 0
        ],
        blur: [
          1, 1, 1,
          1, 1, 1,
          1, 1, 1
        ],
        shadow: [
          1, 2, 1,
          0, 1, 0,
          -1, -2, -1
        ],
        emboss: [
          -2, 1, 0,
          -1, 1, 1,
          0, 1, 2
        ],
        edge: [
          0, 1, 0,
          1, -4, 1,
          0, 1, 0
        ]
      };
	  
    function normalize(kernel) {
        var len = kernel.length;
        var normal = new Array(len);
        var i, sum = 0;
        for (i = 0; i < len; ++i) {
          sum += kernel[i];
        }
        if (sum <= 0) {
          normal.normalized = false;
          sum = 1;
        } else {
          normal.normalized = true;
        }
        for (i = 0; i < len; ++i) {
          normal[i] = kernel[i] / sum;
        }
        return normal;
      }
	  
function convolve(context, kernel) {
        var canvas = context.canvas;
        var width = canvas.width;
        var height = canvas.height;

        var size = Math.sqrt(kernel.length);
        var half = Math.floor(size / 2);

        var inputData = context.getImageData(0, 0, width, height).data;

        var output = context.createImageData(width, height);
        var outputData = output.data;

        for (var pixelY = 0; pixelY < height; ++pixelY) {
          var pixelsAbove = pixelY * width;
          for (var pixelX = 0; pixelX < width; ++pixelX) {
            var r = 0, g = 0, b = 0, a = 0;
            for (var kernelY = 0; kernelY < size; ++kernelY) {
              for (var kernelX = 0; kernelX < size; ++kernelX) {
                var weight = kernel[kernelY * size + kernelX];
                var neighborY = Math.min(
                    height - 1, Math.max(0, pixelY + kernelY - half));
                var neighborX = Math.min(
                    width - 1, Math.max(0, pixelX + kernelX - half));
                var inputIndex = (neighborY * width + neighborX) * 4;
                r += inputData[inputIndex] * weight;
                g += inputData[inputIndex + 1] * weight;
                b += inputData[inputIndex + 2] * weight;
                a += inputData[inputIndex + 3] * weight;
              }
            }
            var outputIndex = (pixelsAbove + pixelX) * 4;
            outputData[outputIndex] = r;
            outputData[outputIndex + 1] = g;
            outputData[outputIndex + 2] = b;
            outputData[outputIndex + 3] = kernel.normalized ? a : 255;
          }
        }
        context.putImageData(output, 0, 0);
      }
	  
function gray_hexToRgb(color) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		color = color.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
		return result ? {
			r: parseInt(result[1], 16)/255,
			g: parseInt(result[2], 16)/255,
			b: parseInt(result[3], 16)/255
		} : {
			r: 0,
			g: 0,
			b: 0
		};
	}
// function applies greyscale to every pixel in canvas
function greyscale(context, options) {
	var canvas = context.canvas;
	var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
	
	console.log(imgd);
	imgd.lastState = "1";
	var data = imgd.data;
	

	if ( g_mapSettings.invert == 1 )
	{
		for (var i = 0; i < data.length; i += 4) {
					data[i]     = (255 - data[i]) ;     // red
					data[i + 1] = (255 - data[i + 1]);  // green
					data[i + 2] = (255 - data[i + 2]);  // blue
		} 
	}		
	if ( g_mapSettings.grayscale == 1 && g_mapHue == 0 )
	{
		for (var i = 0; i < data.length; i += 4) {
			 var avg = ((data[i] + data[i + 1] + data[i + 2]) / 3) ; 
			  data[i]     = avg; // red
			  data[i + 1] = avg; // green
			  data[i + 2] = avg; // blue
		} 
	}
	if ( g_mapHue != 0 )
	{
		var rgbColor = gray_hexToRgb(g_mapHue);
		
		for (var i = 0; i < data.length; i += 4) {
			 var avg = ((data[i] + data[i + 1] + data[i + 2]) / 3); 
			  data[i]     = avg * rgbColor.r; // red
			  data[i + 1] = avg * rgbColor.g; // green
			  data[i + 2] = avg * rgbColor.b; // blue
		} 
	}
	
	context.putImageData(imgd, 0, 0);
	
	if ( g_mapSettings.convolve != "none" )
	{
		var selectedKernel = normalize(g_kernels[g_mapSettings.convolve]);
		convolve(context,selectedKernel);
	}
}
