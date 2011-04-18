# Define the application namespace
window.Muni = Muni = SC.Object.create

  Route: SC.Object.extend
    tag: null,
    title: null

  API: SC.Object.create
    loadRoutes: ->
      # Fetch the XML feed of currently available routes for Muni
      response = jQuery.ajax "/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni"
        success: (response) ->
          routes = Muni.API._convertRoutesXMLToObjects(response)
          Muni.routesController.set 'content', routes

    loadStopsForRoute: (route) ->
      tag = route.get('tag')
      jQuery.ajax "/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=#{tag}"


    _convertRoutesXMLToObjects: (xml) ->
      # Get a jQuery object for the parsed XML
      body = $(xml).find 'body > route'
      # Create an array to hold the routes
      routes = []

      body.each ->
        route = $(this)
        routes.push Muni.Route.create
          tag:   route.attr('tag')
          title: route.attr('title')

      routes



  # Define an array controller that manages the available Muni routes
  routesController: SC.ArrayController.create
    contentDidChange: (->
      window.scrollView.refresh()
    ).observes 'content', 'content.[]'

  RoutesView: SC.TemplateCollectionView.extend
    itemViewClass: SC.TemplateView.extend
      templateName: 'route-item'
      tagName: 'li'




# Registers a function to run when SproutCore has finished loading.
SC.ready ->
  Muni.API.loadRoutes()
  view = SC.TemplateView.create
    templateName: 'loading'

  view.append()
  window.scrollView = new iScroll('wrapper');

