// ==UserScript==
// @name         ggl_result_attrs
// @namespace    http://tampermonkey.net/
// @version      2024-05-17
// @description  Compress google video description parameters (duration, date)
// @author       You
// @match        https://www.google.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // this apparently executes after page is loaded
    // so we don't need to register event listeners
    //document.addEventListener('DOMContentLoaded', () => {

        var sel = 'span.r0bn4c.rQMQod + br:has(+ span.r0bn4c.rQMQod)'
        var elements = document.querySelectorAll(sel);
        for(var i = 0; i < elements.length; i++) {
            var br = elements[i];
            try {
                var text = br.nextSibling
                var span = text.nextSibling
                // duplicate, it has date before description
                if (text.textContent === 'Posted: ') {
                    var parent = span.parentNode
                    text.remove()
                    span.remove()
                    br.remove()
                    continue;
                }
            } catch(_) {}
            var ne = document.createElement('span');
            ne.textContent = ' · '
            br.parentNode.replaceChild(ne, br);
        }
    //});
})();
