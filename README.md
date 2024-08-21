Redesigning Google's results page w/ [Stylebot](https://stylebot.dev/) & [Tampermonkey](https://www.tampermonkey.net/) (and also [NoScript](https://noscript.net/)).

***Before:***
![image](https://github.com/vanaigr/google-refresh-2023/assets/65824523/1a741f8c-64e3-4a64-bf74-3c94a2407ae5)

***After:***
![image](https://github.com/vanaigr/google-refresh-2023/assets/65824523/e8bb19ec-2218-4ae2-b03b-a94f5ac74f34)

Not the nicest looking, but still better than Chrome Refresh 2023.

This requires adding extra query parameter `gbv=1` (you can add a custom search engine: "https://www.google.com/search?gbv=1&q=%s").

It also requires disabling google's search page scripts with NoScript 'Untrusted' for https://www.google.com/search. Note: adjust 'Default'.

Result names are prefixed with labels. Typing '\<label\>' opens the result. 'f' toggles whether the result will be opened in a new tab. Yellow (default) - replace current, green - open in a new tab.
The first answer (displayed as '·') uses space as its label.

Typing 'c' applies suggested correction:

![image](https://github.com/vanaigr/google-refresh-2023/assets/65824523/8ea03d41-208a-4768-92f6-1280efebed87)

Typing '/' or '.' focuses input on the search box. '\<Enter\>' opens new results page in the current tab.

Note: these vimium keys need to be excluded: "s,j,k,d,l,f,n,i,e,w,o,m,u,v,a,q,z,/,."
