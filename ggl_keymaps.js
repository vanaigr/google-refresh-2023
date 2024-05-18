// ==UserScript==
// @name         ggl_keymaps
// @namespace    http://tampermonkey.net/
// @version      2024-05-17
// @description  add keymaps for opening results, searching and correction
// @author       You
// @match        https://www.google.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var keys = [
        's', 'j', 'k', 'd', 'l', 'f', 'n', 'i', 'e', 'w', 'o',
        'm', 'u', 'v', 'a', 'q', 'z'
    ]
    var orig  = (`qwertyuiop[]asdfghjkl;'zxcvbnm,.`).split('')
    var remap = (`йцукенгшщзхъфывапролджэячсмитьбю`).split('')

    var labels = {}
    var labels_c = 0
    var first

    //Note: first is irrelevant here
    var answers = document.querySelectorAll('#main > div:not([class]):not(:has(> div > .K8tyEc))')
    for(var i = 1; i < answers.length; i++) try {
        if(labels_c >= keys.length) break;

        var a = answers[i].querySelector('a');
        if(a) {
            var href = a.href
            var google_tracking = 'https://www.google.com/url?q='
            if(href.startsWith(google_tracking)) {
                var end_pos = href.indexOf('&', google_tracking.length)
                href = href.substring(google_tracking.length, end_pos)
            }

            // imagine that 'b' is 'name', funnily, everything breaks if you actually name it this way :)
            // for(k in window) { var v = window[k]; if (typeof(v) === "string" && v === "null") console.log(k); }
            // this prints "name" lol. And it is not reasignable.
            // This only happens in one tab... WTF
            var b = a.querySelector('div.BNeawe.vvjwJb.AP7Wnd.UwRFLe')
            if(b == null) continue;
            var label = document.createElement('span')
            var key = first == null ? '·' : keys[labels_c].toUpperCase()
            label.textContent = key
            label.classList.add('open-url-label')

            b.prepend(label)
            if(!first) {
                first = href
            }
            else {
                labels_c++
                labels[key] = href
            }
        }
    } catch(_) { console.error(_) }

    var correction_text
    try {
        var corr_root = document.querySelector('#main > div.Gx5Zad.xpd.EtOod.pkphOe')
        var corr_a = corr_root.querySelector('a')
        var corr_href = corr_a.href
        var start_pat = '&q='
        var text_start = corr_href.indexOf(start_pat) + start_pat.length
        var text_end = corr_href.indexOf('&', text_start)
        correction_text = corr_href.substring(text_start, text_end)
    } catch(_) {}

    var in_labels = false
    var replace = false
    document.addEventListener("keypress", function(event) {
        if (document.activeElement != document.body) return;

        console.log("Key pressed: " + event.key, in_labels);

        var key = event.key
        var remap_i = remap.indexOf(key)
        if(remap_i >= 0) key = orig[remap_i]

        var result
        if(key === ' ') {
            in_labels = false
            result = first
        }
        else if(in_labels) {
            result = labels[key]
            in_labels = false
        }

        if(!result) {
            if(key === 's') {
                in_labels = true
                replace = false
            }
            else if(key === 'f') {
                in_labels = true
                replace = true
            }
            else if(key == 'c' && correction_text) {
                result = 'https://www.google.com/search?gbv=1&q=' + correction_text
                replace = true
                in_labels = false
            } else if(key == '/' || key == '.') { //йцукен / is .
                window.__FocusSearch();
                event.preventDefault()
                return
            }
        }

        document.body.setAttribute('data-in-labels', in_labels);

        if(result) {
            in_labels = false
            console.log(result)
            window.open(result, replace ? '_self' : '_blank')
        }
    });
})();
