var Permalink = function(location) {
  this.location = location;
};

Permalink.prototype = {
  set: function (url) {
    this.ignoreHashchange = true;
    this.location.hash = this.encode(url);
    return this.get();
  },

  ignoreHashchange: false,

  get: function () {
    var hash = this.location.hash.replace(/^\#/, '')
    return decodeURIComponent(hash).replace(/\+/g, ' ');
  },

  encode: function (word) {
    word = word.toLowerCase();
    return encodeURIComponent(word).replace(/\%20/g, '+').replace(/\%2B/g, '+');
  },

  hashchange: function () {
    if (!this.ignoreHashchange) {
      loadVideos(this.get());
    }
    this.ignoreHashchange = false;
  }
};