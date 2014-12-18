while read line; do ./bin/phantomjs ./fetch_url.js "${line}" >> out.log; done < p-money-urls.txt.clean
