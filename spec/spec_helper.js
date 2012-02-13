var Ajax = {
  allUrls:function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  callSuccess:function (url, data) {
    expect($.ajax).toHaveBeenCalled();

    var ajaxOptions;
    $.each($.ajax.argsForCall, function (index, args) {
      if (args[0].url == url) {
        ajaxOptions = args[0];
        return false;
      }
    });

    expect(ajaxOptions).toBeDefined();
    ajaxOptions.success(data);
  }
};
