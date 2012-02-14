var AjaxSpy = {
  allUrls: function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  callSuccess: function (url, data) {
    expect($.ajax).toHaveBeenCalled();

    function select(list, condition) {
      var found = [];
      $.each(list, function (index, args) {
        if (condition(args)) {
          found.push(args);
        }
      });

      return found;
    }

    var argsForUrl = select($.ajax.argsForCall, function (args) {
      return args[0].url == url;
    });

    expect(argsForUrl.length).toEqual(1);
    argsForUrl[0][0].success(data);
  }
};
