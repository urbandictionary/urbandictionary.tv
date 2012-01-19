describe("urbandictionary.tv", function() {
	it("megaplaya_onvideoload", function() {
		window.urls = [];
		window.track_pageview = function() {};
		window.megaplaya = {
			api_getCurrentVideo: function() {
				return {definition: "asdf", word: "the word"};
			}
		};
		
		megaplaya_onvideoload();
		
		expect($("#word_txt a").text()).toEqual("the word");
		expect($("#word_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=the+word");
	});
});