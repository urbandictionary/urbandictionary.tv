describe("Permalink", function () {
  var mockLocation;

  beforeEach(function () {
    mockLocation = {};
    spyOn(Permalink, "_windowLocation").andReturn(mockLocation);

    Permalink.ignoreHashchange = false;
  });

  it("sets the location hash", function () {
    expect(Permalink.set("bootylicious")).toEqual("bootylicious");
    expect(mockLocation.hash).toEqual("bootylicious");
    expect($.ajax).not.toHaveBeenCalled();
  });

  it("ignores the hashchange event after set was called", function () {
    expect(Permalink.set("bootylicious")).toEqual("bootylicious");
    Permalink.hashchange();
    expect($.ajax).not.toHaveBeenCalled();
  });

  it("escapes spaces, ampersands and plus signs in the location hash (bug?)", function () {
    Permalink.set("space & +");
    expect(Permalink.get()).toEqual("space &  ");
    expect(mockLocation.hash).toEqual("space+%26++");
  });

  it("strips the leading pound sign", function () {
    mockLocation.hash = "#whatever";
    expect(Permalink.get()).toEqual("whatever");
  });

  it("loads videos for a word when the hash changes", function () {
    mockLocation.hash = "#whatever";
    Permalink.hashchange();

    expect($.ajax).toHaveBeenCalled();
    expect($.ajax.mostRecentCall.args[0].url).toEqual("http://www.urbandictionary.com/iphone/search/videos?word=whatever");
  });
});