(function() {
  var Muni;
  window.Muni = Muni = SC.Object.create({
    Route: SC.Object.extend({
      tag: null,
      title: null
    }),
    API: SC.Object.create({
      loadRoutes: function() {
        var response;
        return response = jQuery.ajax("/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni", {
          success: function(response) {
            var routes;
            routes = Muni.API._convertRoutesXMLToObjects(response);
            return Muni.routesController.set('content', routes);
          }
        });
      },
      loadStopsForRoute: function(route) {
        var tag;
        tag = route.get('tag');
        return jQuery.ajax("/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=" + tag);
      },
      _convertRoutesXMLToObjects: function(xml) {
        var body, routes;
        body = $(xml).find('body > route');
        routes = [];
        body.each(function() {
          var route;
          route = $(this);
          return routes.push(Muni.Route.create({
            tag: route.attr('tag'),
            title: route.attr('title')
          }));
        });
        return routes;
      }
    }),
    routesController: SC.ArrayController.create({
      contentDidChange: (function() {
        return window.scrollView.refresh();
      }).observes('content', 'content.[]')
    }),
    RoutesView: SC.TemplateCollectionView.extend({
      itemViewClass: SC.TemplateView.extend({
        templateName: 'route-item',
        tagName: 'li'
      })
    })
  });
  SC.ready(function() {
    var view;
    Muni.API.loadRoutes();
    view = SC.TemplateView.create({
      templateName: 'loading'
    });
    view.append();
    return window.scrollView = new iScroll('wrapper');
  });
}).call(this);
