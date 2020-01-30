// ==UserScript==
// @name         Library Helper
// @namespace    https://github.com/chihchun
// @version      1.4
// @description  A userscript that display links between different libraries and book stores.
// @author       Rex Tsai <rex.cc.tsai@gmail.com>
// @match        http://book.tpml.edu.tw/webpac/bookDetail.do*
// @match        https://book.douban.com/subject/*
// @match        https://books.google.com.tw/books*
// @match        https://books.google.com/books*
// @match        https://books.google.fr/books*
// @match        https://play.google.com/store/books/details/*
// @match        https://share.readmoo.com/book/*
// @match        https://readmoo.com/book/*
// @match        https://www.amazon.cn/dp/*
// @match        https://www.amazon.cn/gp/product/*
// @match        https://www.amazon.com/*/dp/*
// @match        https://www.amazon.com/gp/product/*
// @match        https://www.books.com.tw/products/*
// @match        https://www.goodreads.com/book/show/*
// @match        https://www.kobo.com/*/ebook*
// @match        https://www.taaze.tw/goods/*
// @match        https://www.taaze.tw/usedList.html?oid=*
// @match        https://www.babelio.com/livres/*
// @match        http://bibliotheque.ville-bobigny.fr/detail-d-une-notice/notice/*
// @match        https://webpac.tphcc.gov.tw/webpac/content.cfm*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.13.1/js-yaml.min.js
// @run-at       document-idle
// @license      MIT; https://github.com/chihchun/library-helper/blob/master/LICENSE
// @copyright    2019, chihchun (https://github.com/chihchun)
// @updateURL    https://openuserjs.org/meta/chihchun/Library_Helper.meta.js
// @downloadURL  https://openuserjs.org/install/chihchun/Library_Helper.min.user.js
// @supportURL   https://github.com/chihchun/library-helper/issues
// ==/UserScript==

(function() {
    'use strict';

    var metadata_yaml = `
amazon.com:
    matches:
        - https://www.amazon.com/gp/product/*
    type: 'XPATH'
    metadata:
        title: "//span[@id='ebooksProductTitle']"
        authors: "//span[contains(@data-a-popover, 'Author Dialog')]/a"
        asin: "//form[@id='sendSample']/input[@name='ASIN.0']/@value"
amazon.com/dp:
    matches:
    - https://www.amazon.com/*
    type: 'XPATH'
    metadata:
        title: "//span[@id='ebooksProductTitle']"
        authors: //span[contains(@class, 'author')]/a
        asin: "//form[@id='sendSample']/input[@name='ASIN.0']/@value"

amazon.cn:
    matches:
        - "https://www.amazon.cn/gp/product/*"
        - "https://www.amazon.cn/dp/*"
    type: 'XPATH'
    metadata:
        title: "//span[@id='ebooksProductTitle']"
        authors: "//span[contains(@class,'author')]/a"
        asin: "//form[@id='sendSample']/input[@name='ASIN.0']/@value"

babelio.com:
    matches:
        - "https://www.babelio.com/livres/*"
    type: 'XPATH'
    metadata:
        title: "//h1"
        authors: "//span[@itemprop='name']"

bibliotheque.ville-bobigny.fr:
    matches:
        - "http://bibliotheque.ville-bobigny.fr/detail-d-une-notice/notice/*"
    type: 'XPATH'
    metadata:
        title: "//title"
        authros: "//a[contains(@class, 'ntc-link-auteur')]"

books.com.tw:
    matches: 
        - "https://www.books.com.tw/products/*"
    type: 'XPATH'
    metadata:
        title: "//h1"
        origtitle: "//h2/a[contains(@href,'https://search.books.com.tw/search/query/cat/all/key')]"
        isbn: "//li[contains(text(),'ISBN')]"
        price: "//ul[@class='price']/li/em"
        sellingprice: "//b[@itemprop='price']"
        authors: "//a[contains(@href,'adv_author')]"
        publishdate: "//li[contains(text(),'出版日期')]"

books.google.com.tw:
    matches:
        - "https://books.google.com.tw/books/*"
        - "https://books.google.com/books/*"
        - "https://books.google.fr/books/*"
    type: 'XPATH'
    metadata:
        title: "//meta[@property='og:title']/@content"
        authors: "//a[contains(@href,'q=inauthor')]"

goodreads.com:
        matches:
            - "https://www.goodreads.com/book/show/*"
        type: 'XPATH'
        metadata:
            title: "//meta[@property='og:title']/@content"
            authors: "//a[@class='authorName']/span[@itemprop='name']"
            isbn: "//meta[@property='books:isbn']/@content"
            rating: "//span[@itemprop='ratingValue']"

kobo.com:
    matches:
        - "https://www.kobo.com/*"
    type: 'JSON-LD'
    metadata:
        title: '//span[@class="title product-field"]'
        authors: '//a[@class="contributor-name"]'
        origtitle: "//span[contains(@class, 'subtitle')]"

play.google.com:
    matches:
        - "https://play.google.com/store/books/details/*"
    type: 'JSON-LD'
    metadata:

readmoo.com:
    matches:
        - "https://share.readmoo.com/book/*"
        - "https://readmoo.com/book/*"
    type: 'XPATH'
    metadata:
        title: "//h2"
        isbn: "//span[@itemprop='ISBN']"
        authors: "//span[@itemprop='name']/a"

taaze.tw:
    matches:
        - "https://www.taaze.tw/goods/*"
    type: 'XPATH'
    metadata:
        title: "//div[contains(@class, 'mBody')]//h1"
        origtitle: "//div[contains(@class, 'mBody')]//h2"
        isbn: "//meta[@property='books:isbn']/@content"
        authors: "//div[@class='authorBrand']//a[contains(@href,'rwd_searchResult.html?keyType%5B%5D=2')]"
taaze.tw/used:
    matches:
    - "https://www.taaze.tw/usedList.html*"
    type: 'XPATH'
    metadata:
        origtitle: "//div[contains(@class, 'hide')]//div[@class='title-next']"
        authors: "//a[contains(@href,'rwd_searchResult.html?keyType%5B%5D=2')]"

tpml.edu.tw:
    matches:
        - "http://book.tpml.edu.tw/webpac/bookDetail.do*"
    type: 'XPATH'
    metadata:
        title: "//h3"
        authors: "//a[contains(@href,'search_field=PN')]"

webpac.tphcc.gov.tw:
    matches:
        - "https://webpac.tphcc.gov.tw/webpac/content.cfm*"
    type: 'XPATH'
    metadata:
        title: "//h2"
        authors: "//div[@class='detail simple']/p[1]"
        isbn: "//div[@class='detail simple']/p[4]"

`;

var search_yaml = `
博客來:
    url: "https://search.books.com.tw/search/query/key/"
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

Kobo:
    url: "https://www.kobo.com/tw/zh/search?query="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"
        - "fr"
        - "fr-ca"
        - "fr-fr"

GooglePlay:
    url: "https://play.google.com/store/search?c=books&q="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"
        - "fr"
        - "fr-ca"
        - "fr-fr"

AmazonCN:
    url: "https://www.amazon.cn/s?rh=n%3A116169071&k="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

豆瓣:
    url: "https://search.douban.com/book/subject_search?search_text="
    languages:
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

Goodreads:
    url: "https://www.goodreads.com/search?q="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"
        - "fr"
        - "fr-ca"
        - "fr-fr"

Google:
    url: "https://www.google.com/search?tbm=bks&q="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"
        - "fr"
        - "fr-ca"
        - "fr-fr"

北市圖書館:
    url: "http://book.tpml.edu.tw/webpac/bookSearchList.do?search_field=FullText&search_input="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

北市圖書館Hyread:
    url: "https://tpml.ebook.hyread.com.tw/searchList.jsp?search_field=FullText&search_input="
    languages:
        - "zh"
        - "zh-TW"
        - "zh-HK"

新北市圖書館:
    url: "https://webpac.tphcc.gov.tw/webpac/search.cfm?m=ss&t0=k&c0=and&k0="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

新北市Hyread:
        url: "https://tphcc.ebook.hyread.com.tw/searchList.jsp?search_field=FullText&search_input="
        languages:
            - "zh"
            - "zh-TW"
            - "zh-HK"

國立臺灣圖書館Hyread:
        url: "https://ntledu.ebook.hyread.com.tw/searchList.jsp?search_field=FullText&search_input="
        languages:
            - "zh"
            - "zh-TW"
            - "zh-HK"

讀冊:
    url: "https://www.taaze.tw/rwd_searchResult.html?keyword%5B%5D="
    languages:
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

Readmoo:
    url: "https://share.readmoo.com/search/keyword?q="
    languages:
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"

Amazon:
    url: "https://www.amazon.com/s?i=digital-text&k="
    languages:
        - "en"
        - "en-US"
        - "zh"
        - "zh-TW"
        - "zh-HK"
        - "zh-CN"
        - "fr"
        - "fr-ca"
        - "fr-fr"

Babelio:
    url: "https://www.babelio.com/resrecherche.php?Recherche="
    languages:
        - "fr"
        - "fr-ca"
        - "fr-fr"

Bobigny:
    url: "http://bibliotheque.ville-bobigny.fr/recherche-catalogue/recherche-simple/simple/Mots%20Notice/0/"
    languages:
        - "fr"
        - "fr-ca"
        - "fr-fr"
`;

var keywords = ['title', 'authors', 'origtitle', 'isbn', 'asin'];


    parse_metadata();

    function parse_metadata() {
        var rules = jsyaml.load(metadata_yaml);
        var data = {};

        // parse the ld+json
        var jsons = evaluate('//script[@type="application/ld+json"]');
        if(jsons.length > 0) {
            jsons.forEach(function(json) {
                var ld = JSON.parse(json);
                console.debug(ld);
                if(ld['@type'] == "Book") {
                    data['title'] = [ld['name']];

                    if(ld['isbn'] != undefined) {
                        data['isbn']= [ld['isbn']];
                    }

                    if(ld['workExample'] != undefined && ld['workExample']['isbn'] != undefined ) {
                       data['isbn']= [ld['workExample']['isbn']];
                    }

                    data['authors'] = [];
                    if(ld['author'] != undefined) {
                        if(Array.isArray(ld['author'])) {
                            ld['author'].forEach(function (author) {
                                data['authors'].push(author['name']);
                            })
                        } else {
                            data['authors'].push(ld['author']['name']);
                        }
                    }
                }
            })
        }

        // parse the metadata by xpath
        for (var domain in rules) {
            rules[domain]['matches'].forEach(function (match) {
                if(document.URL.match(match)) {
                    var metadata = rules[domain]['metadata'];
                    for (var key in metadata) {
                        data[key] = evaluate(metadata[key]);
                    }
                    return;
                }
            })
        }

        // Links to other websites
        if(Object.keys(data).length > 0) {
            console.debug(data);
            var dialog = inject();
            var urlsforsearch = jsyaml.load(search_yaml);

            for (var service in urlsforsearch) {
                if(!isPreferLang(urlsforsearch[service]['languages'])) {
                    continue;
                }

                var url = urlsforsearch[service]['url'];
                var html = `<div>${service}: `;
                keywords.forEach(function(key) {
                    if(data[key] != undefined) {
                        data[key].forEach(function(val) {
                            var href = url + encodeURI(val);
                            html += `<a href="${href}" target="_blank">${val}</a> `;
                        })
                    }
                })
                html += "</div>";
                dialog.insertAdjacentHTML('beforeend', html)
            }
        }
    }

    function isPreferLang(offers) {
        var languages = window.navigator.userLanguage || window.navigator.languages || [window.navigator.language];
        var ret = false;
        languages.forEach(function(lang) {
            if(offers.includes(lang)) {
                ret = true;
            }
        })
        return ret;
    }

    function inject () {
        var div = document.createElement('div');
        div.id = "libraryhelper";
        div.className = "libraryhelper";
        div.textContent = 'Library helper';
        // Make the DIV element draggable:
        dragElement(div);
        document.body.appendChild(div);

        var style = document.createElement('style');
        style.innerHTML = `
  div.libraryhelper {
    color: blueviolet;
    border: 1px solid #d3d3d3;
    background-color: rgba(255, 255, 255, 0.6);

    position: fixed;
    top: 150px;
    right: 0px;

    width: 30vw;
    max-height: 50vh;
    padding: 10px;

    overflow-x: scroll;
    cursor: move;
    z-index: 9999;
  }
`;
        document.head.appendChild(style);
        return div;
    }


    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function evaluate(xpath, doc = document.documentElement) {
        var evaluator = new XPathEvaluator(); 
        var result = evaluator.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
        var node = undefined;
        var texts = [];

        while(node = result.iterateNext()) {
            var text;

            if (node instanceof Attr) {
                text = node.value
            } else {
                text = node.innerText;
            }
            if(text == undefined || text == 'null') {
                console.error(xpath + " not found on " + document.URL);
                continue;
            }
            // fixing up content
            text = text.replace("ISBN：", "").
                    replace("作者 :", "").
                    replace("出版日期：", "");
            texts.push(text);
        }
        return texts;
    }
})();

