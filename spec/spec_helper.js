var AjaxSpy = {
  allUrls: function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  callSuccess: function (url, data) {
    expect($.ajax).toHaveBeenCalled();

    function detect(list, condition) {
      var found;
      $.each(list, function (index, args) {
        if (condition(args)) {
          found = args[0];
        }
      });

      return found;
    }

    var ajaxOptions = detect($.ajax.argsForCall, function (args) {
      return args[0].url == url;
    });

    expect(ajaxOptions).toBeDefined();
    ajaxOptions.success(data);
  }
};
