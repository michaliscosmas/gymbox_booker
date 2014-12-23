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

groupLink =   [ "Segment", "http://www.momentive.com/products/SelectorLanding.aspx?tid=1211"];
//groupLink = ["Brand", "http://www.momentive.com/products/SelectorLanding.aspx?tid=1792"];
//groupLink = ["Brand","http://www.momentive.com/products/SelectorLanding.aspx?tid=1792"];
//groupLink = ["Industry","http://www.momentive.com/products/SelectorLanding.aspx?tid=1172"];
//groupLink = ["Application","http://www.momentive.com/products/SelectorLanding.aspx?tid=1033"];
//groupLink = ["Process","http://www.momentive.com/products/SelectorLanding.aspx?tid=1728"];

casper.start(url, function () {
    this.echo(this.getTitle());
});


// Create output file and header
var group = groupLink[0];
var fname = group + ".csv";
var save = fs.pathJoin(fs.workingDirectory, fname);
fs.write(save, group + "," + group + "URL, Product, ProductURL");

var brands = [];
casper.thenOpen(groupLink[1], brands, function () { // open that link
    console.log(this.getTitle() + '\n'); // display the title of page
    brands = brands.concat(this.evaluate(function () {
        var brands = document.querySelectorAll('a.selectorLandingItemLink');
        brands = Array.prototype.map.call(brands, function (link) {
            return [  link.innerHTML, link.getAttribute('href')];
        });
        return brands;
    }));
});

casper.then(function () {
    casper.each(brands, function (self, brand) {
        casper.then(function () {
                this.echo(' \t \t ' + brand);
            }
        );
        // Hack to show all the products on one page (ps=1000)
        link = "http://www.momentive.com" + brand[1] + "&ps=1000";
        self.thenOpen(link, brand, function (a) {

            // Find links present on this page
            var products = this.evaluate(function() {
                var links = [];
                Array.prototype.forEach.call(__utils__.findAll('.searchResultBlock'), function(e) {
                    name = e.querySelector('p.title-info > a.searchResultLink').innerHTML;
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
                    products[i] = brand + ',' + products[i];
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
    this.echo(brands.length + ' brands found:');
    this.echo('\n - ' + brands).exit();

});


casper.run(function () {
    // echo results in some pretty fashion
    this.echo(groupLinks.length + ' groups done:');

    this.exit();
});