var hue = angular.module('hue', ['ngResource']);
var Config = {
	api: 'http://hue.dev/',
};

hue
  .config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

hue.factory('Light', function($resource) {
	return $resource(Config.api + 'api/bannerschafer/lights/:lightId/state', { lightId: '@lightId' },
		{
			get: { method: 'GET' },
			change: { method: 'PUT', isArray: true }
		}
	);
});

hue.factory('User', function($resource) {
	return $resource(Config.api + 'api/bannerschafer', { },
		{
			get: { method: 'GET' },
			put: { method: 'PUT' }
		}
	);
});

hue.factory('Lights', function($resource) {
	return $resource(Config.api + 'api/bannerschafer/lights', { lightId: '@lightId'},
		{
			get: { method: 'GET' }
		}
	);
});

