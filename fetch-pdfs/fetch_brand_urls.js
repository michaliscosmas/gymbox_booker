/**
 * Created by Ravn Systems
 * User: michalis_RAVN
 * Date: 18/12/2014
 */

var page = new WebPage(), testindex = 0, loadInProgress = false;
var args = require('system').args;
var brandLinks = []

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

// Get the links to each brand
page.open(url, function(status) {
    page.evaluate(function() {
        brandLinks =  [].map.call(document.querySelectorAll('a.selectorLandingItemLink'), function(link) {
            return [ link.innerHTML, link.getAttribute('href')];
        });
        console.log("Brand Links found:" + brandLinks.length);
        console.log(brandLinks.join('\n'));


        // Go through the brands and get the product links and msds links
        brandLinks.forEach(function(entry) {
            brand = entry[0];
            link = "http://www.momentive.com" + entry[1]
            console.log(brand)
            console.log(link)


            page.open(link, function(status) {
                var gradeLinks = page.evaluate(function() {
                    return [].map.call(document.querySelectorAll('a.searchResultLink'), function(link) {
                        return  link.getAttribute('href');
                    });
                });
                console.log("Grade Links found:" + gradeLinks.length);
                console.log(gradeLinks.join('\n'));
            });
        });
    });
});



