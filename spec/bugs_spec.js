describe("bugs", function () {
  describe("in the app", function () {
    it("double encodes the word in permalink.set on line 224");
    it("doesn't pass the video URL to the VHX API, so the growl doesn't show");
    it("doesn't HTML escape the video title in the growl");
    it("splits the current word by spaces on line 446");
    // TODO if we're running low on videos, load more
  });

  describe("in the tests", function () {
    it("doesn't reset the HTML fixtures on every spec");
    it("doesn't test when is_mobile is false");
    it("doesn't reset all the globals in the app");
  });
});
