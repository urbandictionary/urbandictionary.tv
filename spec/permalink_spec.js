describe("Permalink", function () {
  var mockLocation;
  var permalinkUnderTest;

  beforeEach(function () {
    mockLocation = {};
    permalinkUnderTest = new Permalink(mockLocation);
  });

  it("sets the location hash", function () {
    expect(permalinkUnderTest.set("bootylicious")).toEqual("bootylicious");
    expect(mockLocation.hash).toEqual("bootylicious");
    expect($.ajax).not.toHaveBeenCalled();
  });

  it("ignores the hashchange event after set was called", function () {
    expect(permalinkUnderTest.set("bootylicious")).toEqual("bootylicious");
    permalinkUnderTest.hashchange();
    expect($.ajax).not.toHaveBeenCalled();
  });

  it("escapes spaces, ampersands and plus signs in the location hash (bug?)", function () {
    permalinkUnderTest.set("space & +");
    expect(permalinkUnderTest.get()).toEqual("space &  ");
    expect(mockLocation.hash).toEqual("space+%26++");
  });

  it("strips the leading pound sign", function () {
    mockLocation.hash = "#whatever";
    expect(permalinkUnderTest.get()).toEqual("whatever");
  });

  it("loads videos for a word when the hash changes", function () {
    mockLocation.hash = "#whatever";
    permalinkUnderTest.hashchange();

    expect($.ajax).toHaveBeenCalled();
    expect($.ajax.callCount).toEqual(1);
    expect($.ajax.mostRecentCall.args[0].url).toEqual("http://www.urbandictionary.com/iphone/search/videos?word=whatever");
  });
});