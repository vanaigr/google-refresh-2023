Redesigning Google's results page w/ [Stylebot](https://stylebot.dev/) & [Tampermonkey](https://www.tampermonkey.net/).

***Before:***
![image](https://github.com/vanaigr/google-refresh-2023/assets/65824523/1a741f8c-64e3-4a64-bf74-3c94a2407ae5)

***After:***
![image](https://github.com/vanaigr/google-refresh-2023/assets/65824523/e8bb19ec-2218-4ae2-b03b-a94f5ac74f34)

Not the nicest looking, but still better than Chrome Refresh 2023.

This requires adding extra query parameter `gbv=1` (you can add a custom search engine: "https://www.google.com/search?gbv=1&q=%s").

Result names are premended with labels. Typing 's\<label\>' opens the result in the current tab; 'f\<label\>' opens the result in a new tab.
The first answer (with '·' before it) uses space as its label. It is special and can also be opened without typing 's' first, the action is equivalent.

Typing 'c' applies suggested correction:

![image](https://github.com/vanaigr/google-refresh-2023/assets/65824523/8ea03d41-208a-4768-92f6-1280efebed87)

Typing '/' or '.' focuses input on the search box. '\<Enter\>' opens new results page in the current tab.

Note: these vimium keys need to be excluded: "s,j,k,d,l,f,n,i,e,w,o,m,u,v,a,q,z,/,."
