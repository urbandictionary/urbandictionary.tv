describe("urbandictionary.tv", function() {
	it("megaplaya_onvideoload", function() {
		window.urls = [];
		window.track_pageview = function() {};
		window.megaplaya = {
			api_getCurrentVideo: function() {
				return {word: "asdf", definition: "asdf"};
			}
		};
		
		megaplaya_onvideoload();
	});
});