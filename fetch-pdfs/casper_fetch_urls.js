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

links = [[ "Segment","http://www.momentive.com/products/SelectorLanding.aspx?tid=1211"]];
//links = [ ["Brand","http://www.momentive.com/products/SelectorLanding.aspx?tid=1792"]]


for (var i = 0; i < links.length; i++) // for every link...
{
    casper.start(url, links, function() {
        this.echo(this.getTitle());
    });

    // Create output file and header
    var group = links[i][0] ;
    var fname = group + ".csv";
    var save = fs.pathJoin(fs.workingDirectory, fname);
    fs.write(save, group + "," + group + "URL, Product, ProductURL");

    var brands = [];
    casper.thenOpen(links[i][1], brands, function() { // open that link
        console.log(this.getTitle() + '\n'); // display the title of page
        brands = brands.concat(this.evaluate(function(){
            var brands = document.querySelectorAll('a.selectorLandingItemLink');
            brands = Array.prototype.map.call(brands,function(link){
                return [ link.innerHTML, link.getAttribute('href')];
            });
            return brands;
        }));
    });

    casper.then( function(){
        casper.each(brands,function(self,brand){
            casper.then(function() {
                    this.echo(' \t \t ' + brand);
                }
            );
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
                if (products != null) {
                    this.echo('\t' + products.join('\n\t'));

                    // Add the Brand to each product
                    for( var i = 0; i < products.length; i++ ) {
                        products[i] =  brand + ',' + products[i];
                    }
                    fs.write(save, '\n' + products.join('\n'), 'a');
                }
            });
        });
    });

    casper.run(function(){
        // echo results in some pretty fashion
        this.echo(brands.length + ' brands found:');
        this.echo('\n - ' + brands).exit();

        this.exit();
    });
}

