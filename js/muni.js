(function() {
  var Muni;
  window.Muni = Muni = SC.Object.create({
    routesController: SC.ArrayController.create({
      contentDidChange: (function() {
        return console.log('content changed');
      }).observes('content')
    }),
    routesView: SC.TemplateCollectionView.extend({
      contentBinding: 'Muni.routesController'
    })
  });
  SC.ready(function() {
    var response, view;
    response = jQuery.ajax("http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni", {
      success: function() {
        var body, routes;
        body = $(response.responseXML).find('body > route');
        routes = [];
        body.each(function() {
          var route;
          route = $(this);
          return routes.push({
            tag: route.attr('tag'),
            title: route.attr('title')
          });
        });
        return Muni.routesController.set('content', routes);
      }
    });
    view = SC.TemplateView.create({
      templateName: 'loading'
    });
    return view.append();
  });
}).call(this);
