/**
 * Created by Ravn Systems
 * User: michalis_RAVN
 * Date: 18/12/2014
 */
var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});
var fs = require('fs');
var url = "http://www.google.com";

if (casper.cli.args.length === 0 ) {
    casper.echo('No args passed. \n Usage: casperJS casper_fetch_urls.js "Segment" "http://www.momentive.com/products/SelectorLanding.aspx?tid=1211"').exit();
}


groupLink = [casper.cli.get(0),casper.cli.get(1)]

casper.start(url, function () {
    this.echo(this.getTitle());
});


// Create output file and header
var group = groupLink[0];
var fname = group + ".csv";
var save = fs.pathJoin(fs.workingDirectory, fname);
fs.write(save, '"name","itemUrl","product","productUrl"');

var groups = [];
casper.thenOpen(groupLink[1], groups, function () { // open that link
    console.log(this.getTitle() + '\n'); // display the title of page
    groups = groups.concat(this.evaluate(function () {
        var groups = document.querySelectorAll('a.selectorLandingItemLink');
        groups = Array.prototype.map.call(groups, function (link) {
            // Regex to remove the count after the group name e.g. (10)
            var re = /(.*)\(.*\)/g
            // Return the group Name and the Link (which is relative so adding domain)
            return [ '"' +   link.firstChild.nodeValue.replace(re,'$1').trim() + '"',  "http://www.momentive.com" + link.getAttribute('href') ];
        });
        return groups;
    }));
});

casper.then(function () {
    casper.each(groups, function (self, brand) {
        casper.then(function () {
                this.echo(' \t \t ' + brand);
            }
        );
        // Hack to show all the products on one page (ps=1000)
        link =  brand[1] + "&ps=1000";
        self.thenOpen(link, brand, function (a) {

            // Find links present on this page
            var products = this.evaluate(function() {
                var links = [];
                Array.prototype.forEach.call(__utils__.findAll('.searchResultBlock'), function(e) {
                    name = e.querySelector('p.title-info > a.searchResultLink').firstChild.nodeValue.trim();
                    url = e.querySelector('a.msds').getAttribute('href');
                    links.push([ name ? name : "NA" , url? url : "NA"   ]);
                });
                return links;
            });

            this.echo(brand)
            if (products != null) {
                this.echo('\t' + products.join('\n\t'));

                // Add the Brand to each product
                for (var i = 0; i < products.length; i++) {
                    products[i] =  brand + ',' + products[i];
                }
                fs.write(save, '\n' + products.join('\n'), 'a');
            }else {
                this.echo("********************NO PRODUCTS************************");
            }
        });
    });
});

casper.then(function () {
    // echo results in some pretty fashion
    this.echo(groups.length + ' groups found:');
});


casper.run(function () {

    this.exit();
});