SC.NavigationView = SC.TemplateView.extend({
  pushView: function(nextView, animated) {
    if (animated === undefined) { animated = true; }

    var childViews = this.get('childViews'),
        len = childViews.get('length'),
        lastView, lastViewWidth;

    // Get the last view in the stack
    lastView = childViews[len].$();
    lastViewWidth = lastView.width();
    lastView.$().css('left', -lastViewWidth);

    this.appendChild(nextView);
    nextView.$().css('left', lastViewWidth
  }
});
