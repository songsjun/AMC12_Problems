# 2009 AMC 12B Problem 9

## Problem
Triangle ABC has vertices A = (3,0), B = (0,3), and C, where C is on the line x + $y = 7$.  What is the area of $\triangle ABC$?


$$\mathrm{(A)}\ 6\qquad \mathrm{(B)}\ 8\qquad \mathrm{(C)}\ 10\qquad \mathrm{(D)}\ 12\qquad \mathrm{(E)}\ 14$$

## Solution
### Solution 1
Because the line x + $y = 7$ is parallel to $\overline$ {AB}, the area of $\triangle ABC$ is independent of the location of C on that line.  Therefore it may be assumed that C is (7,0).  In that case the triangle has base AC = 4 and altitude 3, so its area is $\frac 12 \cdot 4 \cdot 3 = \boxed$ {6}.
### Solution 2
The base of the triangle is AB = $\sqrt{3^2 + 3^2} = 3\sqrt 2.$  Its altitude is the distance between the point A and the parallel line x + $y = 7$, which is $\frac 4{\sqrt 2} = 2\sqrt 2.$ Therefore its area is $\frac 12 \cdot 3\sqrt 2 \cdot 2\sqrt 2 = \boxed{6}.$  The answer is $\mathrm{(A)}.$


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.75cm); defaultpen(0.8); pair A=(3,0), B=(0,3); draw ( (-1,0) -- (9,0), dashed ); draw ( (0,-1) -- (0,9), dashed ); dot(A); dot(B); draw(A--B); draw ( (-1,8) -- (8,-1) ); label( "$A$", A, S ); label( "$B$", B, W ); label( "$3$", A--(0,0), S ); label( "$3$", B--(0,0), W ); label( "$x+y=7$", (8,-1), SE ); pair C = intersectionpoint(A--(10,7),(7,0)--(0,7)); draw( A--C, dashed ); draw(rightanglemark(A,C,(7,0))); draw(rightanglemark(C,A,B)); label( "$4$", A--(7,0), S ); label( "$\sqrt 2$", 0.67*B+0.33*A, NE ); label( "$\frac 4{\sqrt 2}$", A--C, NW ); label( "$\frac 4{\sqrt 2}$", C--(7,0), NE );
```
### Solution 3
By Shoelace, our area is:
$$\frac {1}{2} \cdot |(3\cdot 3 + 0 \cdot y+ 0 \cdot x)-(0*0+3(x+y))|.$$
We know x+$y=7$ so we get:
$$\frac {1}{2} \cdot |9-21|=\boxed 6$$
### Solution 4
WLOG, let the coordinates of C be (3,4) , or any coordinate, for that matter. Applying the shoelace formula, we get the area as $\boxed 6.$

*~coolmath2017*
## See also
