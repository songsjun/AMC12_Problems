# 2013 AMC 12A Problem 11

## Problem
Triangle ABC is equilateral with AB=1. Points E and G are on $\overline{AC}$ and points D and F are on $\overline{AB}$ such that both $\overline{DE}$ and $\overline{FG}$ are parallel to $\overline{BC}.$ Furthermore, triangle ADE and trapezoids DFGE and FBCG all have the same perimeter. What is DE+FG?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(180); pen dps = linewidth(0.7) + fontsize(10); defaultpen(dps); real $s=1/2,m=5/6,l=1$; pair A=origin,B=(l,0),C=rotate(60)*l,D=(s,0),E=rotate(60)*s,F=m,G=rotate(60)*m; draw(A--B--C--cycle^^D--E^^F--G); dot(A^^B^^C^^D^^E^^F^^G); label("$A$",A,SW); label("$B$",B,SE); label("$C$",C,N); label("$D$",D,S); label("$E$",E,NW); label("$F$",F,S); label("$G$",G,NW);
```


$\textbf{(A) }1\qquad \textbf{(B) }\dfrac{3}{2}\qquad \textbf{(C) }\dfrac{21}{13}\qquad \textbf{(D) }\dfrac{13}{8}\qquad \textbf{(E) }\dfrac{5}{3}\qquad$
## Solution
Let AD = x, and AG = y. We want to find DE + FG, which is nothing but x+y.

Based on the fact that ADE, DEFG, and BCFG have the same perimeters, we can say the following:

$$3x = x + 2(y-x) + y = y + 2(1-y) + 1$$

Simplifying, we can find that

$$3x = 3y-x = 3-y$$

Since $3-y =3x, y = 3-3x$.

After substitution, we find that 9-$10x=3x$, and $x =\frac{9}{13}.$

Again substituting, we find y = $\frac{12}{13}.$

Therefore, x+y = $\frac{21}{13},$ which is C
## Video Solution
https://www.youtube.com/watch?v=XQpQaomC2tA

*~sugar_rush*
## See also
