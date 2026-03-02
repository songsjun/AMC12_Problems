# 2016 AMC 12A Problem 9

## Problem 9
The five small shaded squares inside this unit square are congruent and have disjoint interiors. The midpoint of each side of the middle square coincides with one of the vertices of the other four small squares as shown. The common side length is $\tfrac{a-\sqrt{2}}{b},$ where a and b are positive integers. What is a+b ?


> [Asymptote diagram - not rendered in Markdown]

```asy
real x=.369; draw((0,0)--(0,1)--(1,1)--(1,0)--cycle); filldraw((0,0)--(0,x)--(x,x)--(x,0)--cycle, gray); filldraw((0,1)--(0,1-x)--(x,1-x)--(x,1)--cycle, gray); filldraw((1,1)--(1,1-x)--(1-x,1-x)--(1-x,1)--cycle, gray); filldraw((1,0)--(1,x)--(1-x,x)--(1-x,0)--cycle, gray); filldraw((.5,.5-x*sqrt(2)/2)--(.5+x*sqrt(2)/2,.5)--(.5,.5+x*sqrt(2)/2)--(.5-x*sqrt(2)/2,.5)--cycle, gray);
```


$\textbf{(A)}\ 7\qquad\textbf{(B)}\ 8\qquad\textbf{(C)}\ 9\qquad\textbf{(D)}\ 10\qquad\textbf{(E)}\ 11$
## Solution
Let s be the side length of the small squares.

The diagonal of the big square can be written in two ways: $\sqrt{2}$ and s $\sqrt{2} +$ s + s $\sqrt{2}.$

Solving for s, we get s = $\frac{4 - \sqrt{2}}{7},$ so our answer is 4 + 7 $\Rightarrow \boxed{\textbf{(E) } 11}$
## Solution 2
The diagonal of the small square can be written in two ways: s $\sqrt(2)$ and 2*(1-$2s$). Equating and simplifying gives $s =\frac{4 - \sqrt{2}}{7}.$ Hence our answer is 4 + 7 $\Rightarrow \boxed{\textbf{(E) } 11}.$
## Video Solution by OmegaLearn
https://youtu.be/4_x1sgcQCp4?t=4036

*~pi_is_3.14*
## See Also
