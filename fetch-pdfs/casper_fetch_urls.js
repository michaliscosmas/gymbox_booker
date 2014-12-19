/**
 * Created by Ravn Systems
 * User: michalis_RAVN
 * Date: 18/12/2014
 */
var casper = require('casper').create();

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
            this.echo(this.getCurrentUrl());
            var products = self.querySelectorAll('a.msds');
            for (var index = 0; index < products.length; index++) {
                this.echo(products[i]);
            }
            products = Array.prototype.map.call(products,function(link){
                //return link.getAttribute('href');
                this.echo('searchResultLink'+link.querySelector('a.searchResultLink'));
                return  link.querySelector('a.searchResultLink').getAttribute('href');
            });
            this.echo(products);
        });
    });
});

casper.run(function(){
    // echo results in some pretty fashion
    this.echo(brands.length + ' brands found:');
    this.echo(' - ' + brands.join('\n - ')).exit();
    this.exit();
});