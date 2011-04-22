# Define the application namespace
window.Muni = Muni = SC.Object.create

  Route: SC.Object.extend
    tag: null
    title: null

  Direction: SC.Object.extend
    title: null
    name: null
    useForUI: false
    stops: []

  Stop: SC.Object.extend
    tag: null
    title: null

  API: SC.Object.create
    loadRoutes: ->
      # Fetch the XML feed of currently available routes for Muni
      jQuery.ajax "/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni"
        success: (response) ->
          routes = Muni.API._convertRoutesXMLToObjects(response)
          Muni.routesController.set('content', routes)

    loadDirectionsForRoute: (route, target, action) ->
      tag = route.get('tag')
      jQuery.ajax "/_strobe/proxy/webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=#{tag}",
        success: (response) ->
          directions = Muni.API._convertDirectionsXMLToObjects(response)
          Muni.directionsController.set('content', directions)
          Muni.viewController.transitionToDirections()

    _convertRoutesXMLToObjects: (xml) ->
      # Get a jQuery object for the parsed XML
      body = $(xml).find 'body > route'
      # Create an array to hold the routes
      routes = []

      body.each ->
        route = $(this)
        tag = route.attr('tag')

        routes.pushObject Muni.Route.create
          tag:   tag
          title: route.attr('title')

      routes

    _convertDirectionsXMLToObjects: (xml) ->

      body = $(xml).find 'body > route > direction'
      directions = [];

      body.each ->
        direction = $(this)
        tag = direction.attr('tag')

        directions.push Muni.Direction.create
          tag:      tag
          title:    direction.get('title')
          name:     direction.get('name')
          useForUI: !!direction.get('useForUI')

      directions

  # Define an array controller that manages the available Muni routes
  routesController: SC.ArrayController.create
    contentDidChange: (->
      window.scrollView.refresh()
    ).observes 'content', 'content.[]'

  directionsController: SC.ArrayController.create()

  viewController: SC.Object.create
    transitionToDirections: ->
      view = SC.TemplateView.create({
      });

      view.css('left', -viewWidth)

  navigationView: SC.NavigationView.create()

  RoutesView: SC.TemplateCollectionView.extend
    itemViewClass: SC.TemplateView.extend
      templateName: 'route-item'
      tagName: 'li'
      mouseDown: ->
        this.$().addClass('active')

      mouseUp: ->
        route = this.get('content')
        Muni.API.loadDirectionsForRoute(route)

        this.$().removeClass('active')



# Registers a function to run when SproutCore has finished loading.
SC.ready ->
  Muni.API.loadRoutes()
  view = SC.TemplateView.create
    templateName: 'loading'

  view.append()
  window.scrollView = new iScroll('wrapper');

