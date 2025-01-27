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

/* note: never use variable named "name", it is impossible to debug in firefox, it seems ("under"-shadowed by window.name ?) */

(function() {
    'use strict';

    var keys = [
        's', 'j', 'k', 'd', 'l', 'n', 'i', 'e', 'w', 'o',
        'm', 'u', 'v', 'a', 'q', 'z'
    ]
    var orig  = (`qwertyuiop[]asdfghjkl;'zxcvbnm,.`).split('')
    var remap = (`йцукенгшщзхъфывапролджэячсмитьбю`).split('')

    var labels = {}
    var labels_c = 0
    var first

    var buffered_input = [];
    var loaded = false;

    var correction_text
    var replace = true

    var opened_labels_timer

    function handle_key(key) {
        clearTimeout(opened_labels_timer)
        document.body.setAttribute('data-opened-labels', false);

        if(key === 'f') {
            replace = !replace
            document.body.setAttribute('data-replace', replace)
            return true
        }
        else if(key == 'c') {
            if(correction_text) {
                result = 'https://www.google.com/search?gbv=1&q=' + correction_text
                window.open(result, '_self')
            }
            return true
        }
        else if(key == '/' || key == '.') { //йцукен / is .
            window.__FocusSearch();
            return true
        }

        var result
        if(key === ' ') {
            result = first
        }
        else {
            result = labels[key]
        }

        if(result) {
            document.body.setAttribute('data-opened-labels', true);
            opened_labels_timer = setTimeout(() => {
                document.body.setAttribute('data-opened-labels', false);
            }, 1000)

            window.open(result, replace ? '_self' : '_blank')
            return true
        }

    }

    document.addEventListener("keypress", function(event) {
        let ae = document.activeElement
        if(ae && ae.tagName == 'INPUT') return;
        //if (document.activeElement != document.body) return;

        var key = event.key
        var remap_i = remap.indexOf(key)
        if(remap_i >= 0) key = orig[remap_i]

        if(!loaded) {
            buffered_input.push(key)
        }
        else {
            if(handle_key(key)) {
                event.preventDefault()
            }
        }
    });

    const load = () => {
        /* remove google tracking. not because it's tracking,
        but because url history is broken and it's +1 redirect */ {
            let google_tracking = 'https://www.google.com/url?q='
            for(let a of document.querySelectorAll('a')) {
                let href = a.href
                if(href.startsWith(google_tracking)) {
                    let end_pos = href.indexOf('&', google_tracking.length)
                    href = href.substring(google_tracking.length, end_pos)
                }
                a.href = decodeURIComponent(href)
            }
        }

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

                let links = answers[i].querySelectorAll('a');
                for(let j = 0; j < links.length; j++) try {
                    let a = links[j];
                    if(!a) continue;
                    let b = a.querySelector('div.BNeawe.vvjwJb.AP7Wnd.UwRFLe');
                    if(!b) continue;

                    let href = a.href

                    // create html label
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
                } catch(_) { console.error(_) }
            } catch(_) { console.error(_) }

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

        /* Compress google video description parameters (duration, date) */ {
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
        }

        loaded = true

        for(let key of buffered_input) {
            handle_key(key)
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", load);
    } else {
        load();
    }
})();
