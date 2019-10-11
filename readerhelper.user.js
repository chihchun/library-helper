// ==UserScript==
// @name         Library Helper
// @namespace    https://greasyfork.org/en/users/263753-chihchun
// @version      0.1
// @description  A userscript that display links between different libraries and book stores.
// @author       Rex Tsai <rex.cc.tsai@gmail.com>
// @match        https://www.books.com.tw/products/*
// @match        http://book.tpml.edu.tw/webpac/bookDetail.do*
// @match        https://books.google.com.tw/books*
// @match        https://www.kobo.com/tw/zh/ebook*
// @match        https://www.taaze.tw/goods/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.13.1/js-yaml.min.js
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    var yaml = `
books.com.tw:
    matches: 
        - "https://www.books.com.tw/products/*"
    metadata:
        title: "//h1"
        origtitle: "//h2/a[contains(@href,'https://search.books.com.tw/search/query/cat/all/key')]"
        isbn: "//li[contains(text(),'ISBN')]"
        price: "//ul[@class='price']/li/em"
        sellingprice: "//b[@itemprop='price']"
        authors: "//a[contains(@href,'adv_author')]"
        publishdate: "//li[contains(text(),'出版日期')]"
tpml.edu.tw:
    matches: 
        - "http://book.tpml.edu.tw/webpac/bookDetail.do*"
    metadata:
        title: "//h3"
        authors: "//a[contains(@href,'search_field=PN')]"
books.google.com.tw:
    matches:
        - "https://books.google.com.tw/books*"
    metadata:
        title: '//h1[@class="booktitle"]/span[@class="fn"]'
        authors: "//a[contains(@href,'q=inauthor')]"
kobo.com:
    matches:
        - "https://www.kobo.com/tw/zh/ebook*"
    metadata:
        title: '//span[@class="title product-field"]'
        authors: '//a[@class="contributor-name"]'
taaze.tw:
    matches:
        - "https://www.taaze.tw/goods/*"
    metadata:
        title: "//meta[@name='title']/@content"
        isbn: "//meta[@property='books:isbn']/@content"
        authors: "//div[@class='authorBrand']//a[contains(@href,'rwd_searchResult.html?keyType%5B%5D=2')]"
`;

var keywords = ['title', 'authors', 'origtitle', 'isbn'];
var urls = {
    "博客來": "https://search.books.com.tw/search/query/key/",
    "Kobo": "https://www.kobo.com/tw/zh/search?query=",
    "GooglePlay": "https://play.google.com/store/search?c=books&q=",
    "AmazonCN": "https://www.amazon.cn/s?rh=n%3A116169071&k=",
    "Goodreads": "https://www.goodreads.com/search?q=",
    "TPML": "http://book.tpml.edu.tw/webpac/bookSearchList.do?search_field=FullText&search_input=",
    "Google": "https://www.google.com/search?tbm=bks&q=",
    "讀冊": "https://www.taaze.tw/rwd_searchResult.html?keyword%5B%5D="
};

    parse_metadata();

    function parse_metadata() {
        var rules = jsyaml.load(yaml);
        var data = {};

        // parse the metadata
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
            var dialog = inject();
            for (var service in urls) {
                var url = urls[service];
                var html = `<div>${service}: `;
                keywords.forEach(function(key) {
                    if(data[key] != undefined) {
                        data[key].forEach(function(keyword) {
                            var href = url + encodeURI(keyword);
                            html += `<a href="${href}" target="_blank">${keyword}</a> `;
                        })
                    }
                })
                html += "</div>";
                dialog.insertAdjacentHTML('beforeend', html)
            }
        }
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
    background-color: rgba(255, 255, 255, 0.4);

    position: fixed;
    top: 150px;
    right: 0px;

    width: 30vw;
    height: 50vh;
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
        var node = null;
        var texts = [];

        while(node = result.iterateNext()) {
            var text;

            if (node instanceof Attr) {
                text = node.value
            } else {
                text = node.innerText;
            }
            if(text == undefined) {
                console.error(xpath + " not found on " + document.URL);
                continue;
            }
            // fixing up content
            text = text.replace("ISBN：", "").
                    replace("出版日期：", "");
            texts.push(text);
        }
        return texts;
    }
})();

