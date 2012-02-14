var WWW = 'http://www.urbandictionary.com';

$.select = function(list, callback) {
  var found = [];
  $.each(list, function (index, args) {
    if (callback(args)) {
      found.push(args);
    }
  });

  return found;
}

var AjaxSpy = {
  allUrls: function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  argsForUrl: function(url) {
    return $.select($.ajax.argsForCall, function (args) {
      return args[0].url == url;
    });
  },

  callSuccess: function (url, data) {
    expect($.ajax).toHaveBeenCalled();

    var list = this.argsForUrl(url);
    expect(list.length).toEqual(1);
    list[0][0].success(data);
  }
};

function resetAppGlobals() {
  reset_globals();
  window.is_mobile = false;
}

function resetSpies() {
  window.track_pageview = jasmine.createSpy();
  window.track_event = jasmine.createSpy();

  window.megaplaya = {
    api_getCurrentVideo: jasmine.createSpy(),
    api_addListener: jasmine.createSpy(),
    api_playQueue: jasmine.createSpy(),
    api_nextVideo: jasmine.createSpy()
  };
}

function copyFixtures() {
  $("#fixtures").html($("#original_fixtures").text());
}

beforeEach(function () {
  spyOn($, 'ajax');
  spyOn(window, 'alert');
});

function spyOnPermalink() {
  spyOn(Permalink, 'set');
  spyOn(Permalink, 'get');
}