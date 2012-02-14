var WWW = 'http://www.urbandictionary.com';

$.pluck = function(list, attribute) {
  return $.map(list, function(item) {
    return item[attribute];
  });
};

var AjaxSpy = {
  allUrls: function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  argsForUrl: function(url) {
    return $.grep($.ajax.argsForCall, function (args) {
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
    api_nextVideo: jasmine.createSpy(),
    api_loadQueue: jasmine.createSpy(),
    api_setQueueAt: jasmine.createSpy()
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
  spyOn(permalink, 'set');
  spyOn(permalink, 'get');
}