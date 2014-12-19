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
casper.start(url, function() {
    this.echo(this.getTitle());
});

casper.then(function getLinks(){
    brands = this.evaluate(function(){
        var brands = document.querySelectorAll('a.selectorLandingItemLink');
        brands = Array.prototype.map.call(brands,function(link){
            //return link.getAttribute('href');
            return [ link.innerHTML, link.getAttribute('href')];
        });
        return brands;
    });
});

casper.then(function(){
    this.each(brands,function(self,brand){
        this.echo(brand);
        link = "http://www.momentive.com" + brand[1]
        self.thenOpen(link,function(a){
            var products = this.evaluate(function(){
                var products = document.querySelectorAll('a.msds','a.searchResultLink');

                products = Array.prototype.map.call(products,function(link){
                    return link.getAttribute('href');
                });
                return products;
            });
            this.echo(products.join('\n'));
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