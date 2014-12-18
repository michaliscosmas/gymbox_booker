/**
 * Created by Ravn Systems
 * User: michalis_RAVN
 * Date: 18/12/2014
 */

var page = new WebPage(), testindex = 0, loadInProgress = false;
var args = require('system').args;

//fetch_url = args[1];

url = "http://www.momentive.com/products/SelectorLanding.aspx?tid=1792"

console.log("Fetching:" + url);
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

page.onLoadStarted = function () {
    loadInProgress = true;
    console.log("load started");
};

page.onLoadFinished = function () {
    loadInProgress = false;
    console.log("load finished");
};

page.onUrlChanged = function (url) {
    console.log('Following URL: ' + url);
}

page.open(url, function(status) {
    // list all the a.href links in the hello kitty etsy page
    var links = page.evaluate(function() {
        return [].map.call(document.querySelectorAll('a.selectorLandingItemLink'), function(link) {
            return [ link.innerHTML, link.getAttribute('href')];
            //return link.getAttribute('href');
        });
    });
    console.log(links.join('\n'));

    phantom.exit();
});

