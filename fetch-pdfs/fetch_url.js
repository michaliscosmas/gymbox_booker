// uses wget so not compatible with WINDOWS

var page = new WebPage(), testindex = 0, loadInProgress = false;

var childPage;
var quit = 0;
var args = require('system').args;


var spawn = require("child_process").spawn
var execFile = require("child_process").execFile

var child = spawn("ls", ["-lF", "/rooot"])

child.stdout.on("data", function (data) {
    console.log("spawnSTDOUT:", JSON.stringify(data))
})

child.stderr.on("data", function (data) {
    console.log("spawnSTDERR:", JSON.stringify(data))
})

child.on("exit", function (code) {
    console.log("spawnEXIT:", code)
})

//child.kill("SIGKILL")


fetch_url = args[1];

var myRegexp = /Product=(.*)/;
var product = myRegexp.exec(fetch_url);
console.log("Fetching:" + fetch_url);
console.log("Product" + product[1]);


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

page.onPageCreated = function (newPage) {
    console.log('A new child page was created! Its requested URL is not yet available, though.');
    childPage = newPage;
    testindex1 = 0;
    loadInProgress = false;

    childPage.onConsoleMessage = function (msg) {
        console.log(msg);
    };

    childPage.onLoadStarted = function () {
        loadInProgress = true;
        console.log("load1 started");
    };

    childPage.onLoadFinished = function () {
        loadInProgress = false;
        console.log("load1 finished");
    };

    childPage.onFilePicker = function (oldFile) {
        console.log('onFilePicker(' + oldFile + ') called');
        return 'master.pdf';
    }
    childPage.onDownloadFinished = function (status) {
        console.log('onDownloadFinished(' + status + ')');
        phantom.exit();
    }

    childPage.onFileDownload = function (url) {
        console.log('Downloading....');
        return 'master.pdf';
    }

    //These steps are for the popup that contains the pdf
    var steps1 = [
        function () {

            childPage.injectJs("jquery.min.js");
        },
        function () {
            console.log("URL:" + childPage.url);
            // Add quotes to download url to work with windows
            download_url =  childPage.url.replace("wait.jsp?", "report.jsp?") ;
            console.log("MATCH-" + product[1] + "-" + download_url);
            // Create valid filename for windows
            var filename = product[1].replace(/[^a-z0-9]/gi, '_') + ".pdf";
            return execFile("wget", ["-O", filename, download_url], null, function (err, stdout, stderr) {
                console.log("execFileSTDOUT:", JSON.stringify(stdout))
                console.log("execFileSTDERR:", JSON.stringify(stderr))
                console.log("err:", JSON.stringify(err))
                phantom.exit();
            });

            //childPage.open(download_url);
        }
    ]

    interval1 = setInterval(function () {
        var quit1 = 0;
        if (!loadInProgress && typeof steps1[testindex1] == "function") {
            console.log("step_child " + (testindex1 + 1));
            quit1 = steps1[testindex1]();
            testindex1++;
        }
        if (quit1 == 1) {
            phantom.exit();
        }
        if (typeof steps1[testindex1] != "function") {
            console.log("test2 complete!");
            //phantom.exit();
        }
    }, 50);

};

var steps = [
    function () {

        page.open(fetch_url);
    },
    function () {
        //Inject JQuery to make life easier
        page.injectJs("jquery.min.js");
    },
    function () {
        //Select option
        page.evaluate(function () {

            var i = 0;
            $('.inputWB2 option').each(function () {
                if (i == 1) {
                    console.log("Setting value: " + $(this).attr('value'));
                    $('.inputWB2').val($(this).attr('value'));
                    $(this).attr("selected", "selected");
                }
                i = i + 1;
            });

        });

    },
    function () {
        //Submit form
        page.evaluate(function () {
            var image_button = $("input[src$='images/ViewMSDS.gif']");
            image_button.click();
        });
    },
    function () {
        //Inject JQuery to make life easier
        page.injectJs("jquery.min.js");
    },
    function () {
        //Select the English option
        page.evaluate(function () {
            var found = 0
            $('#langDropDown option').each(function () {
                if ($(this).text() == "English") {
                    console.log("Setting value: " + $(this).attr('value'));
                    $('#langDropDown').val($(this).attr('value'));
                    $(this).attr("selected", "selected");
                    found = 1;
                }
            });
            if (found == 0) {
                return 1;
            }
            $("#langDropDown").change();
        });
        return quit;
    },
    function () {
        //Select the USA option
        quit = page.evaluate(function () {
            var found = 0
            $('#areaDropDown option').each(function () {
                if ($(this).text() == "USA" || $(this).text() == "United Kingdom") {
                    console.log("Setting value: " + $(this).attr('value'));
                    $('#areaDropDown').val($(this).attr('value'));
                    $(this).attr("selected", "selected");
                    found = 1;
                }
            });
            if (found == 0) {
                return 1;
            }
            $("#areaDropDown").change();
        });
        return quit;
    },
    function () {
        //Click on download Url
        page.evaluate(function () {
            var download_link = $("#urlSpan0 a");
            console.log(download_link.attr("href"));
            eval(download_link.attr("href"));
        });
    },
    function () {
        //console.log(page.content);
    }
];


interval = setInterval(function () {
    var quit = 0;
    if (!loadInProgress && typeof steps[testindex] == "function") {
        console.log("step " + (testindex + 1));
        quit = steps[testindex]();
        testindex++;
        if (quit == 1) {
            phantom.exit();
        }
    }
    if (typeof steps[testindex] != "function") {
        //console.log("test0 complete!");
    }
}, 50);


