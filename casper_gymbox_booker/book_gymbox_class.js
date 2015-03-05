/**
 * Created by Ravn Systems
 * User: michalis_RAVN
 * Date: 19/02/2015
 */

var casper = require('casper').create({
    verbose: false,
    logLevel: "info"
});

var url = "https://gymbox.legendonlineservices.co.uk/enterprise/account/Login";
var bookingurl = "https://gymbox.legendonlineservices.co.uk/enterprise/BookingsCentre/MemberTimetable";
var basketurl = "https://gymbox.legendonlineservices.co.uk/enterprise/Basket/";

casper.on( 'page.error', function (msg, trace) {
    this.echo( 'Error: ' + msg, 'ERROR' );
});

casper.start(url, function () {
    this.echo(this.getTitle());

    this.fill('form#form1', {
        'login.Email':    'michali.cosmas@gmail.com',
        'login.Password':    '******'
    }, true);
});

function getClass(){
    var searchtime = "18:00"; var searchname ="Rocket Yoga";
    //var searchtime = "12:15"; var searchname ="Bike & Beats";
    //var searchtime = "18:15"; var searchname = "Frame Fitness";
    //var searchtime = "12:30"; var searchname = "Bike & Beats";
    //var searchtime = "10:15"; var searchname = "Bike & Beats";

    var rows = document.querySelectorAll('table[id="MemberTimetable"] tbody  tr');
    for (var i = 0; i < rows.length; i++)
    {
        var tr = rows[i];
        if ( !tr.children ){ continue; }
        if ( tr.children.length != 7 ) {  continue; }

        var time =  tr.children[0].innerText;
        var name =  tr.children[1].innerText;
        var instructor =  tr.children[2].innerText;
        var status =  tr.lastChild.innerText;
        var id = tr.lastChild.firstChild.id;

        if (time == searchtime &&  searchname == name  ){
            return {
                id: id,
                time: time,
                name: name,
                instructor: instructor,
                status: status
            }
        }
    }
    return null;
}

casper.thenOpen(bookingurl, function() {
    this.echo("Booking page.");
    var gymClass = this.evaluate(getClass);

    if (gymClass["id"] !=  null){
        this.echo("Adding class: " + gymClass["id"] + " " + gymClass["time"]  + " " + gymClass["name"]  + " " + gymClass["instructor"]);
        this.click("#" + gymClass["id"]);
        this.echo("Added to Basket");
        casper.thenOpen(basketurl, function() {
            this.echo("Basket page.");
            this.click("#btnPayNow");
        });
    }else{
        this.echo("Class: " + gymClass["time"]  + " " + gymClass["name"]  + " " + gymClass["instructor"]+ " " + gymClass["status"]);
    }
});

casper.run(function () {
    this.exit(99);
});