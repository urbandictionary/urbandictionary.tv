describe("Permalink", function () {
  var mockLocation;

  beforeEach(function () {
    spyOn($, 'ajax');

    mockLocation = {};
    spyOn(Permalink, "_windowLocation").andReturn(mockLocation);

    window.permalink_skip_hashchange = false;
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

  it("cleans and escapes the location hash", function () {
    expect(Permalink.set("some string")).toEqual("some string");
    expect(mockLocation.hash).toEqual("some+string");
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