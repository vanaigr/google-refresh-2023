// ==UserScript==
// @name         ggl_search
// @namespace    http://tampermonkey.net/
// @version      2024-05-17
// @description  Replace search in google result page (default is obsured)
// @author       You
// @match        https://www.google.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createElementFromHTML(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString;
        return template.content.firstChild;
    }

    var search = document.querySelector('#hdr')
    var question = search.querySelector('form input.noHIxc').value

    search.remove()

    var new_search = createElementFromHTML(`<input class="search">`)
    new_search.value = question
    new_search.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                window.__Search()
            }
    })

    var main = document.getElementById('main')
    var first = main.firstElementChild
    first.prepend(new_search)

    window.__FocusSearch = () => {
        new_search.focus()
    }
    window.__Search = () => {
        var q = encodeURIComponent(new_search.value)
        q = q.split('%20').join('+') // space -> +
        window.open('https://www.google.com/search?gbv=1&q=' + q, "_self")
    }
})();
