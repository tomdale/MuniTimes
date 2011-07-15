(function(exports) {
  var Muni;
  var MuniAPI = exports.MuniAPI;

  var routeListView, directionListView, stopListView, predictionListView;

  var ListItemView = SC.View.extend({
    touchStart: function() {
      this.first = false;
      this.$().addClass('active');
    },

    touchMove: function(evt) {
      this.$().removeClass('active');
      this._canceled = true;
    },

    touchEnd: function(evt) {
      if (!this._canceled) {
        if (this.click) { this.click(evt); }
      }
      this._canceled = false;
      this.$().removeClass('active');
    }
  });

  Muni = SC.Application.create({
    routesController: SC.ArrayProxy.create({
      content: null,

      routesLoaded: function(routes) {
        this.set('content', routes);
      },

      routeClicked: function(route) {
        var tag = route.get('tag');

        routeListView.remove();
        directionListView.append();

        MuniAPI.loadDirections(tag, Muni.directionsController, 'directionsLoaded');
      }
    }),

    directionsController: SC.ArrayProxy.create({
      directionsLoaded: function(directions) {
        this.set('content', directions);
      },

      directionClicked: function(direction) {

        directionListView.remove();
        stopListView.append();

        Muni.stopsController.stopsLoaded(direction.get('stops'));
      }
    }),

    stopsController: SC.ArrayProxy.create({
      stopsLoaded: function(stops) {
        this.set('content', stops);
      },

      stopClicked: function(stop) {
        var direction = stop.get('direction'),
            route     = direction.get('route');

        stop = stop.get('tag');

        MuniAPI.loadPredictions(route, direction.get('tag'), stop, Muni.predictionsController, 'predictionsLoaded');

        stopListView.remove();
        predictionListView.append();
      }
    }),

    predictionsController: SC.ArrayProxy.create({
      predictionsLoaded: function(predictions) {
        this.set('content', predictions);
      }
    }),

    RouteListView: SC.CollectionView.extend({
      contentBinding: 'Muni.routesController',
      tagName: 'ul',
      itemViewClass: ListItemView.extend({
        click: function() {
          Muni.routesController.routeClicked(this.get('content'));
        }
      })
    }),

    DirectionListView: SC.CollectionView.extend({
      contentBinding: 'Muni.directionsController',
      tagName: 'ul',
      itemViewClass: ListItemView.extend({
        click: function() {
          Muni.directionsController.directionClicked(this.get('content'));
        }
      })
    }),

    StopListView: SC.CollectionView.extend({
      contentBinding: 'Muni.stopsController',
      tagName: 'ul',
      itemViewClass: ListItemView.extend({
        click: function() {
          Muni.stopsController.stopClicked(this.get('content'));
        }
      })
    }),

    PredictionListView: SC.CollectionView.extend({
      contentBinding: 'Muni.predictionsController',
      tagName: 'ul',
      itemViewClass: ListItemView.extend({
        // click: function() {
        //   Muni.stopsController.stopClicked(this.get('content'));
        // }
      })
    })
  });

  jQuery(function() {
    routeListView = SC.View.create({
      templateName: 'route-list'
    });

    routeListView.append();

    directionListView = SC.View.create({
      templateName: 'direction-list'
    });

    stopListView = SC.View.create({
      templateName: 'stop-list'
    });

    predictionListView = SC.View.create({
      templateName: 'prediction-list'
    });

    MuniAPI.loadRoutes(Muni.routesController, 'routesLoaded');
  });

  exports.Muni = Muni;
})(this);
