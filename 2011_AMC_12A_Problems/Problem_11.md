# 2011 AMC 12A Problem 11

## Problem
Circles A, B, and C each has radius 1. Circles A and B share one point of tangency. Circle C has a point of tangency with the midpoint of $\overline{AB}.$ What is the area inside circle C but outside circle A and circle B?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1.1cm); defaultpen(linewidth(.8pt)); dotfactor=4; pair A=(0,0), B=(2,0), C=(1,-1); pair M=(1,0); pair D=(2,-1); dot (A); dot (B); dot (C); dot (D); dot (M); draw(Circle(A,1)); draw(Circle(B,1)); draw(Circle(C,1)); draw(A--B); draw(M--D); draw(D--B); label("$A$",A,W); label("$B$",B,E); label("$C$",C,W); label("$M$",M,NE); label("$D$",D,SE);
```


$\textbf{(A)}\ 3 - \frac{\pi}{2} \qquad \textbf{(B)}\ \frac{\pi}{2} \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ \frac{3\pi}{4} \qquad \textbf{(E)}\ 1+\frac{\pi}{2}$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1.1cm); defaultpen(linewidth(.8pt)); dotfactor=4; pair A=(0,0), B=(2,0), C=(1,-1); pair M=(1,0); pair D=(2,-1); dot (A); dot (B); dot (C); dot (D); dot (M); draw(Circle(A,1)); draw(Circle(B,1)); draw(Circle(C,1)); draw(A--B); draw(M--D); draw(D--B); label("$A$",A,W); label("$B$",B,E); label("$C$",C,W); label("$M$",M,NE); label("$D$",D,SE);
```


The requested area is the area of C minus the area shared between circles A, B and C.

Let M be the midpoint of $\overline{AB}$ and D be the other intersection of circles C and B.

The area shared between C, A and B is 4 of the regions between arc $\widehat$ {MD} and line $\overline{MD},$ which is (considering the arc on circle B) a quarter of the circle B minus $\triangle MDB$:

$$\frac{\pi r^2}{4}-\frac{bh}{2}$$

$$b = h = r = 1$$

(We can assume this because $\angle DBM$ is 90 degrees, since CDBM is a square, due to the application of the tangent chord theorem at point M)

So the area of the small region is

$$\frac{\pi}{4}-\frac{1}{2}$$

The requested area is area of circle C minus 4 of this area:

$$\pi 1^2 - 4\left(\frac{\pi}{4}-\frac{1}{2}\right) = \pi - \pi + 2 = 2$$

$$\boxed{\textbf{C}}.$$
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1.1cm); defaultpen(linewidth(.8pt)); dotfactor=4; pair A=(0,0), B=(2,0), C=(1,-1); pair M=(1,0); pair D=(2,-1); dot (A); dot (B); dot (C); dot (D); dot (M); draw(Circle(A,1)); draw(Circle(B,1)); draw(Circle(C,1)); draw(A--B); draw(M--D); draw(D--B); label("$A$",A,W); label("$B$",B,E); label("$C$",C,W); label("$M$",M,NE); label("$D$",D,SE);
```


We can move the area above the part of the circle above the segment EF down, and similarly for the other side. Then, we have a square, whose diagonal is 2, so the area is then just $\left(\frac{2}{\sqrt{2}}\right)^2 = \boxed{\textbf{2 = C}}.$

*~Minor Edits, Challengees24*
## Video Solution
https://www.youtube.com/watch?v=u23iWcqbJlE
*~Shreyas S*
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=olRZuK11mAI
## Video Solution by CanadaMath
https://youtu.be/72h3E_CtW50?si=tyx26ImPeLpI7YK1&t=8
## See also
