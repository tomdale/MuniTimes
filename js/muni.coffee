# Define the application namespace
window.Muni = Muni = SC.Object.create

  # Define an array controller that manages the available Muni routes
  routesController: SC.ArrayController.create()

  routesView: SC.TemplateCollectionView.extend
    contentBinding: 'Muni.routesController'

# Registers a function to run when SproutCore has finished loading.
SC.ready ->
  # Fetch the XML feed of currently available routes for Muni
  response = jQuery.ajax "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni"
    success: ->
      # Get a jQuery object for the parsed XML
      body = $(response.responseXML).find 'body > route'
      # Create an array to hold the routes
      routes = []

      body.each ->
        route = $(this)
        routes.push
          tag:   route.attr('tag')
          title: route.attr('title')

      Muni.routesController.set 'content', routes

  view = SC.TemplateView.create
    templateName: 'loading'

  view.append()
