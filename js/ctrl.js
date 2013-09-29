hue.controller('LightCtrl', function($scope, Light, User, Lights) {

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

	$scope.brightChange = function(id, bri) {
		Light.change({
			lightId: id,
			bri: +bri
		}, function(data) {
			console.log(data)
		});
	}

	$scope.colorChange = function(id, hue) {
		console.log(hue)
		// Light.change({
		// 	lightId: id,
		// 	bri: +bri
		// }, function(data) {
		// 	console.log(data)
		// });
	}
});