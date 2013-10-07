hue.controller('LightCtrl', function($scope, Light, User, Lights) {


		var ctx; //audio context 
		var buf; //audio buffer 
		var fft; //fft audio node 
		var samples = 32; 
		var barWidth = Math.floor(128/samples * 10);
		var setup = false; //indicate if audio is set up yet 
		 
		 
		//init the sound system 
		function init() { 
		    console.log("in init"); 
		    try { 
		        ctx = new webkitAudioContext(); //is there a better API for this? 
		        setupCanvas(); 
		        loadFile(); 
		    } catch(e) { 
		        alert('you need webaudio support' + e); 
		    } 
		} 
		window.addEventListener('load',init,false); 
		 
		//load the mp3 file 
		function loadFile() { 
		    var req = new XMLHttpRequest(); 
		    req.open("GET","audio/boomboom.mp3",true); 
		    //we can't use jquery because we need the arraybuffer type 
		    req.responseType = "arraybuffer"; 
		    req.onload = function() { 
		        //decode the loaded data 
		        ctx.decodeAudioData(req.response, function(buffer) { 
		            buf = buffer; 
		            play(); 
		        }); 
		    }; 
		    req.send(); 
		} 

		function play() { 
		    //create a source node from the buffer 
		    var src = ctx.createBufferSource();  
		    src.buffer = buf; 
		     
		    //create fft 
		    fft = ctx.createAnalyser(); 
		    fft.fftSize = samples; 
		    fft.smoothingTimeConstant = 0;
		   
		    //connect them up into a chain 
		    src.connect(fft); 
		    fft.connect(ctx.destination); 
		     
		    //play immediately 
		    src.noteOn(0); 
		    setup = true; 
		} 

		var gfx; 
		function setupCanvas() { 
		    var canvas = document.getElementById('canvas'); 
		    gfx = canvas.getContext('2d'); 
		    // webkitRequestAnimationFrame(update); 
		    $scope.colorChange(3, {r: 0, g: 0, b: 0});
		} 

		$scope.update = function() { 
		    // webkitRequestAnimationFrame(update); 
		    if(!setup) return; 
		    gfx.clearRect(0,0,800,600); 
		    gfx.fillStyle = 'gray'; 
		    gfx.fillRect(0,0,800,600); 
		     
		    var data = new Uint8Array(16); 
		    fft.getByteFrequencyData(data);
		    // var data = new Float32Array(64);
		    // fft.getFloatFrequencyData(data);
		    var regularData = Array.apply([], data);
		    var thirdLength = 5;
		    var freqs = [
		    	regularData.slice(0, 4),
		    	regularData.slice(5, 10),
		    	regularData.slice(11, 15)
		    ];
		    angular.forEach(freqs, function(freq, i) {
		    	var sum = 0;
		    	freq.forEach(function(v) {
		    		sum += v;
		    	});
		    	freqs[i] = sum / freq.length;
		    });
		    // console.log(freqs);
		    $scope.freq(freqs);



		    gfx.fillStyle = 'red'; 
		    for(var i=0; i<freqs.length; i++) { 
		        gfx.fillRect(50+225*i, 300-data[i],225,100); 
		    } 
		    // for(var i=0; i<data.length; i++) { 
		    //     gfx.fillRect(50+barWidth*i, 300-data[i],barWidth,100); 
		    // } 
		     
		} 



	User.get({}, function(data) {
		$scope.lights = data.lights
	});

	$scope.switch = function(light, id) {
		var state = light.state.on ? true: false;
		Light.change({
			lightId: id,
			on: state
		}, function(data) {

		});
	}

	$scope.colorChange = function(id, rgb) {
		// var rgb = hexToRgb(hex);
		var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

		var hue = Math.round(hsv[0] * 65535);
		var sat = Math.round(hsv[1] * 255);
		var bri = Math.round(hsv[2] * 255);


		Light.change({
			lightId: id,
			hue: hue,
			sat: sat,
			bri: bri,
			transitionTime:1
		}, function(data) {
			$scope.update();
		});
	}

	$scope.colorChangeHsv = function(id, hsv) {
		Light.change({
			lightId: id,
			hue: hsv.h,
			sat: hsv.s,
			bri: hsv.b,
			transitionTime:1
		}, function(data) {
			$scope.update();
		});
	}

	$scope.freq = function(freqs) {
		console.log(freqs[1])
		$scope.colorChangeHsv(3, {
			h: 0, 
			s: 0, 
			b: freqs[0] });
	}


	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
		    r: parseInt(result[1], 16),
		    g: parseInt(result[2], 16),
		    b: parseInt(result[3], 16)
		} : null;
	}

	function rgbToHsv(r, g, b) {
	  r /= 255, g /= 255, b /= 255;
	 
	  var max = Math.max(r, g, b), min = Math.min(r, g, b);
	  var h, s, v = max;
	 
	  var d = max - min;
	  s = max == 0 ? 0 : d / max;
	 
	  if (max == min) {
	    h = 0; // achromatic
	  } else {
	    switch (max) {
	      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	      case g: h = (b - r) / d + 2; break;
	      case b: h = (r - g) / d + 4; break;
	    }
	 
	    h /= 6;
	  }
	 
	  return [ h, s, v ];
	}
});