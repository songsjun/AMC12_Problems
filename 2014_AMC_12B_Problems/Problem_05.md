# 2014 AMC 12B Problem 5

## Problem
Doug constructs a square window using  8  equal-size panes of glass, as shown. The ratio of the height to width for each pane is  5 : 2 , and the borders around and between the panes are  2  inches wide. In inches, what is the side length of the square window?


> [Asymptote diagram - not rendered in Markdown]

```asy
fill((0,0)--(2,0)--(2,26)--(0,26)--cycle,gray); fill((6,0)--(8,0)--(8,26)--(6,26)--cycle,gray); fill((12,0)--(14,0)--(14,26)--(12,26)--cycle,gray); fill((18,0)--(20,0)--(20,26)--(18,26)--cycle,gray); fill((24,0)--(26,0)--(26,26)--(24,26)--cycle,gray); fill((0,0)--(26,0)--(26,2)--(0,2)--cycle,gray); fill((0,12)--(26,12)--(26,14)--(0,14)--cycle,gray); fill((0,24)--(26,24)--(26,26)--(0,26)--cycle,gray);
```


$\textbf{(A)}\ 26\qquad\textbf{(B)}\ 28\qquad\textbf{(C)}\ 30\qquad\textbf{(D)}\ 32\qquad\textbf{(E)}\ 34$
## Solution
Let the height of the panes equal $5x$, and let the width of the panes equal $2x$.  Now notice that the total width of the borders equals 10, and the total height of the borders is 6.  We have

$$
10 + 4(2x) = 6 + 2(5x)
x = 2
$$

Now, the total side length of the window equals
$$10+ 4(2x) = 10 + 16 = \boxed{\textbf{(A)}\ 26}$$
## Video Solution 1 (Quick and Easy)
https://youtu.be/IXxMDMLbd-E

*~Education, the Study of Everything*
## See Also
