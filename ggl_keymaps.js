// ==UserScript==
// @name         ggl_keymaps
// @namespace    http://tampermonkey.net/
// @version      2024-05-17
// @description  add keymaps for opening results, searching and correction
// @author       vanaigr
// @match        https://www.google.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// @run-at       document-start
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

    var buffered_input = [];
    var loaded = false;

    var in_labels = false
    var replace = false

    function handle_key(key) {
        if(!in_labels) {
            if(key === 's') {
                in_labels = true
                replace = true
                document.body.setAttribute('data-in-labels', in_labels)
                document.body.setAttribute('data-replace', replace)
                return true
            }
            else if(key === 'f') {
                in_labels = true
                replace = false
                document.body.setAttribute('data-in-labels', in_labels)
                document.body.setAttribute('data-replace', replace)
                return true
            }
        }

        var result

        if(key === ' ') {
            // if 'f ' is typed, then open in new, if ' ' or 's ', then replace
            if(!in_labels) replace = true;
            result = first
        }
        else if(in_labels) {
            result = labels[key]
        }


        in_labels = false
        document.body.setAttribute('data-in-labels', in_labels);

        if(result) {
            window.open(result, replace ? '_self' : '_blank')
            return true
        }

        if(key == 'c' && correction_text) {
            result = 'https://www.google.com/search?gbv=1&q=' + correction_text
            window.open(result, '_self')
            return true
        }
        else if(key == '/' || key == '.') { //йцукен / is .
            window.__FocusSearch();
            return true
        }
    }

    document.addEventListener("keypress", function(event) {
        if (document.activeElement != document.body) return;

        console.log("Key pressed: " + event.key, in_labels);

        var key = event.key
        var remap_i = remap.indexOf(key)
        if(remap_i >= 0) key = orig[remap_i]

        if(!loaded) {
            buffered_input.push(key)
        }
        else {
            if(handle_key(key))
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        /*add custom search bar*/ {
            function createElementFromHTML(htmlString) {
                const template = document.createElement('template');
                template.innerHTML = htmlString;
                return template.content.firstChild;
            }

            let search = document.querySelector('#hdr')
            let question = search.querySelector('form input.noHIxc').value

            search.remove()

            let new_search = createElementFromHTML(`<input class="search">`)
            new_search.value = question
            new_search.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        window.__Search()
                    }
            })

            let main = document.getElementById('main')
            let first_el = main.firstElementChild
            first_el.prepend(new_search)

            window.__FocusSearch = () => {
                new_search.focus()
            }
            window.__Search = () => {
                let q = encodeURIComponent(new_search.value)
                q = q.split('%20').join('+') // space -> +
                window.open('https://www.google.com/search?gbv=1&q=' + q, "_self")
            }
        }

        /* find all results and compute lables */ {
            //Note: first is irrelevant here
            let answers = document.querySelectorAll('#main > div:not([class]):not(:has(> div > .K8tyEc))')
            for(let i = 1; i < answers.length; i++) try {
                if(labels_c >= keys.length) break;

                let a = answers[i].querySelector('a');
                if(a) {
                    let href = a.href
                    let google_tracking = 'https://www.google.com/url?q='
                    if(href.startsWith(google_tracking)) {
                        let end_pos = href.indexOf('&', google_tracking.length)
                        href = href.substring(google_tracking.length, end_pos)
                    }
                    href = decodeURIComponent(href)

                    // imagine that 'b' is 'name', funnily, everything breaks if you actually name it this way :)
                    // for(k in window) { let v = window[k]; if (typeof(v) === "string" && v === "null") console.log(k); }
                    // this prints "name" lol. And it is not reasignable.
                    // This only happens in one tab... WTF
                   let b = a.querySelector('div.BNeawe.vvjwJb.AP7Wnd.UwRFLe')
                    if(b == null) continue;
                    let label = document.createElement('span')
                    let key = first == null ? '·' : keys[labels_c]
                    label.textContent = key.toUpperCase()
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

            let correction_text
            try {
                let corr_root = document.querySelector('#main > div.Gx5Zad.xpd.EtOod.pkphOe')
                let corr_a = corr_root.querySelector('a')
                let corr_href = corr_a.href
                let start_pat = '&q='
                let text_start = corr_href.indexOf(start_pat) + start_pat.length
                let text_end = corr_href.indexOf('&', text_start)
                correction_text = corr_href.substring(text_start, text_end)
            } catch(_) {}
        }

        loaded = true

        for(let key of buffered_input) {
            handle_key(key)
        }
    })
})();
