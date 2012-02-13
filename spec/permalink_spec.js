describe("Permalink", function () {
  it("sets the location hash", function () {
    var mockLocation = {};
    spyOn(Permalink, "_windowLocation").andReturn(mockLocation);

    expect(Permalink.set("bootylicious")).toEqual("bootylicious");
    expect(mockLocation.hash).toEqual("bootylicious");
  });
});