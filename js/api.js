(function(exports) {
  var Muni, get = SC.get;

  var Route = SC.Object.extend({
    tag: null,
    title: null,
    toString: function() {
      return get(this, 'tag')+' - '+get(this, 'title');
    }
  }),

  Direction = SC.Object.extend({
    title: null,
    name: null,
    useForUI: false,
    stops: []
  }),

  Stop = SC.Object.extend({
    tag: null,
    title: null
  }),

  Prediction = SC.Object.extend({
    minutes: null
  });

  function invoke(target, action, result, params) {
    if (!action) { action = target; target = null; }
    if ('string' === typeof action) { action = target[action]; }

    params = params ? params.slice() : [];
    params.unshift(result);

    action.apply(target, params);
  }

  function convertRoutesXMLToObjects(xml) {
    var body, routes;
    body = $(xml).find('body > route');
    routes = [];
    body.each(function() {
      var route, tag;
      route = $(this);
      tag = route.attr('tag');
      return routes.pushObject(Route.create({
        tag: tag,
        title: route.attr('title')
      }));
    });
    return routes;
  }

  function stopsForDirection(direction, directionObject, xml) {
    var stops = direction.find('stop'),
        stopObjects = [];

    xml = $(xml);

    stops.each(function() {
      var stopTag = $(this).attr('tag');
      var stop = xml.find('route > stop[tag=%@]'.fmt(stopTag));

      stopObjects.push(Stop.create({
        tag: stop.attr('tag'),
        title: stop.attr('title'),
        direction: directionObject
      }));
    });

    return stopObjects;
  }

  function convertDirectionsXMLToObjects(xml, route) {
    var body, directions;
    body = $(xml).find('body > route > direction');
    directions = [];
    body.each(function() {
      var direction, object, stops;
      direction = $(this);

      object = Direction.create({
        tag: direction.attr('tag'),
        title: direction.attr('title'),
        name: direction.attr('name'),
        useForUI: !!direction.attr('useForUI'),
        route: route
      });

      object.stops = stopsForDirection(direction, object, xml);

      directions.push(object);
    });
    return directions;
  }

  function convertPredictionsXMLToObjects(xml) {
    var body, predictions = [];

    body = $(xml).find('prediction');

    body.each(function() {
      var prediction = $(this);
      predictions.push(Prediction.create({
        minutes: prediction.attr('minutes')
      }));
    });

    return predictions;
  }

  Muni = SC.Object.create({
    loadRoutes: function(target, action) {
      return jQuery.ajax("/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni", {
        success: function(response) {
          var routes;
          routes = convertRoutesXMLToObjects(response);
          invoke(target, action, routes);
        }
      });
    },

    loadDirections: function(route, target, action) {
      return jQuery.ajax("/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=" + route, {
        success: function(response) {
          var directions;
          directions = convertDirectionsXMLToObjects(response, route);

          invoke(target, action, directions);
        }
      });
    },

    loadPredictions: function(route, direction, stop, target, action) {
      var url = '/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=%@&d=%@&s=%@';
      jQuery.ajax(url.fmt(route, direction, stop), {
        success: function(response) {
          var predictions;
          predictions = convertPredictionsXMLToObjects(response);

          invoke(target, action, predictions);
        }
      });
    }
  });

  exports.MuniAPI = Muni;
})(this);