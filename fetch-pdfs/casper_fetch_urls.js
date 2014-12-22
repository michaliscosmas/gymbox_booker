/**
 * Created by Ravn Systems
 * User: michalis_RAVN
 * Date: 18/12/2014
 */
var casper = require('casper').create();
var fs = require('fs');
var fname = 'urls.txt';
var save = fs.pathJoin(fs.workingDirectory, fname);

var url = "http://www.momentive.com/products/SelectorLanding.aspx?tid=1792"
var segmenturl =  "http://www.momentive.com/products/SelectorLanding.aspx?tid=1211"
url = segmenturl;
casper.start(url, function() {
    this.echo(this.getTitle());
});







casper.then(function getLinks(){
    // Brands is an array, 0 is brand name, 1 is relative URL: e.g.
    // Silbreak*&nbsp;(28),/Products/selectorresults.aspx?taxids=1813&sort=Ascending
    brands = this.evaluate(function(){
        var brands = document.querySelectorAll('a.selectorLandingItemLink');
        brands = Array.prototype.map.call(brands,function(link){
            return [ link.innerHTML, link.getAttribute('href')];
        });
        return brands;
    });
});

casper.then(function(){
    this.each(brands,function(self,brand){
        this.echo( brand);
        // Hack to show all the products on one page (ps=1000)
        link = "http://www.momentive.com" + brand[1] + "&ps=1000"

        self.thenOpen(link,brand,function(a){
            var products = this.evaluate(function(){
                var results = document.querySelectorAll('.searchResultBlock');
                results = Array.prototype.map.call(results,function(link){
                    url = link.querySelector('a.msds').getAttribute('href');
                    name = link.querySelector('p.title-info > a.searchResultLink').innerHTML;

                    return [name,url] ;
                });
                return results;
            });
            //this.echo(products);
            //fs.write(save, '\n' + products, 'a');
            this.echo(brand)
            this.echo(products.join('\n'));

            // Add the Brand to each product
            for( var i = 0; i < products.length; i++ ) {
                products[i] =  brand + ',' + products[i];
            }
            fs.write(save, 'Brand, BrandURL, Product, ProductURL')
            fs.write(save, '\n' + products.join('\n'), 'a');

        });
    });
});

casper.run(function(){
    // echo results in some pretty fashion
    this.echo(brands.length + ' brands found:');
    this.echo(' - ' + brands.join('\n - ')).exit();

    this.echo(products.length + ' products found:');

    this.exit();
});