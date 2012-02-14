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
