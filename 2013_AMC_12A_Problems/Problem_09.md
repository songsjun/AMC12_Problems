# 2013 AMC 12A Problem 9

## Problem
In $\triangle ABC, AB=AC=28$ and BC=20.  Points D,E, and F are on sides $\overline{AB}, \overline{BC},$ and $\overline{AC},$ respectively, such that $\overline{DE}$ and $\overline{EF}$ are parallel to $\overline{AC}$ and $\overline{AB},$ respectively.  What is the perimeter of parallelogram ADEF?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(180); pen dps = linewidth(0.7) + fontsize(10); defaultpen(dps); real $r=5/7$; pair A=(10,sqrt(28^2-100)),B=origin,C=(20,0),D=(A.x*r,A.y*r); pair bottom=(C.x+(D.x-A.x),C.y+(D.y-A.y)); pair E=extension(D,bottom,B,C); pair top=(E.x+D.x,E.y+D.y); pair F=extension(E,top,A,C); draw(A--B--C--cycle^^D--E--F); dot(A^^B^^C^^D^^E^^F); label("$A$",A,NW); label("$B$",B,SW); label("$C$",C,SE); label("$D$",D,W); label("$E$",E,S); label("$F$",F,dir(0));
```


$\textbf{(A) }48\qquad \textbf{(B) }52\qquad \textbf{(C) }56\qquad \textbf{(D) }60\qquad \textbf{(E) }72\qquad$
## Solution
Note that because $\overline{DE}$ and $\overline{EF}$ are parallel to the sides of $\triangle ABC,$ the internal triangles $\triangle BDE$ and $\triangle EFC$ are similar to $\triangle ABC,$ and are therefore also isosceles triangles.

It follows that BD = DE. Thus, AD + DE = AD + DB = AB = 28.

Since opposite sides of parallelograms are equal, the perimeter is 2 * (AD + DE) = $\boxed{\textbf{(C) }{56}}.$
## Solution (Cheese)
We can set point F to be on point C, and point D to be on point A.

This makes a degenerate parallelogram with sides of length 28 and 0, so it has a perimeter of 28 + 28 = $\boxed{\textbf{(C) }{56}}.$
## Video Solution
https://youtu.be/CCjcMVtkVaQ

*~sugar_rush*
## See also
