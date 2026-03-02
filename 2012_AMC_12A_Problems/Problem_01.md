# 2012 AMC 12A Problem 1

> This problem is the same as [2012 AMC 12A #1](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #3](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
A bug crawls along a number line, starting at $-2$. It crawls to $-6$, then turns around and crawls to $5$. How many units does the bug crawl altogether?

$\textbf{(A)}\ 9\qquad\textbf{(B)}\ 11\qquad\textbf{(C)}\ 13\qquad\textbf{(D)}\ 14\qquad\textbf{(E)}\ 15$
## Solution
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-2,1)--(-6,1),red+dashed,EndArrow);
draw((-6,2)--(5,2),blue+dashed,EndArrow);
dot((-2,0));
dot((-6,0));
dot((5,0));
label("$-2$",(-2,0),dir(270));
label("$-6$",(-6,0),dir(270));
label("$5$",(5,0),dir(270));
label("$4$",(-4,0.9),dir(270));
label("$11$",(-1.5,2.5),dir(90));
```

</asy>

Crawling from $-$2 to -6$$ takes it a distance of $4$ units. Crawling from $-$6 to $5$ takes it a distance of $11$ units. Add $4$ and $11$ to get $\boxed{\textbf{(E)}\ 15}$
## Video Solution (CREATIVE THINKING)
https://youtu.be/VKaj_HDCUuQ

*~Education, the Study of Everything*
## See Also
