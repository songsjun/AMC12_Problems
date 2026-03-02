# 2008 AMC 12B Problem 15

## Problem
On each side of a unit square, an equilateral triangle of side length 1 is constructed. On each new side of each equilateral triangle, another equilateral triangle of side length 1 is constructed. The interiors of the square and the 12 triangles have no points in common. Let  R be the region formed by the union of the square and all the triangles, and  S be the smallest convex polygon that contains  R. What is the area of the region that is inside  S but outside  R?

$\textbf{(A)} \; \frac{1}{4} \qquad \textbf{(B)} \; \frac{\sqrt{2}}{4} \qquad \textbf{(C)} \; 1 \qquad \textbf{(D)} \; \sqrt{3} \qquad \textbf{(E)} \; 2 \sqrt{3}$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
real $a = 1/2$, b = sqrt(3)/2; draw((0,0)--(1,0)--(1,1)--(0,1)--cycle); draw((0,0)--(a,-b)--(1,0)--(1+b,a)--(1,1)--(a,1+b)--(0,1)--(-b,a)--(0,0)); draw((0,0)--(-1+a,-b)--(1+a,-b)--(1,0)--(1+b,-1+a)--(1+b,1+a)--(1,1)--(1+a,1+b)--(-1+a,1+b)--(0,1)--(-b,1+a)--(-b,-1+a)--(0,0)); filldraw((1+a,-b)--(1,0)--(1+b,-1+a)--cycle,gray(0.9)); filldraw((1+b,1+a)--(1,1)--(1+a,1+b)--cycle,gray(0.9)); filldraw((-1+a,1+b)--(0,1)--(-b,1+a)--cycle,gray(0.9)); filldraw((-b,-1+a)--(0,0)--(-1+a,-b)--cycle,gray(0.9));
```


The equilateral triangles form trapezoids with side lengths  1, 1, 1, 2 (half a unit hexagon) on each face of the unit square.  The four triangles "in between" these trapezoids are isosceles triangles with two side lengths  1 and an angle of  $30^{\circ}$ in between them, so the total area of these triangles (which is the area of  S - R) is,  4 $\left( \frac$ {1}{2} $\sin 30^{\circ} \right) = 1$ which makes the answer  $\boxed{C}.$
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
real $a = 1/2$, b = sqrt(3)/2; draw((0,0)--(1,0)--(1,1)--(0,1)--cycle); draw((a+b+a,a+b+a)--(a+b+a,-b)--(-b,-b)--(-b,a+a+b)--cycle,dashed); draw((0,0)--(a,-b)--(1,0)--(1+b,a)--(1,1)--(a,1+b)--(0,1)--(-b,a)--(0,0)); draw((0,0)--(-1+a,-b)--(1+a,-b)--(1,0)--(1+b,-1+a)--(1+b,1+a)--(1,1)--(1+a,1+b)--(-1+a,1+b)--(0,1)--(-b,1+a)--(-b,-1+a)--(0,0)); filldraw((1+a,-b)--(1,0)--(1+b,-1+a)--cycle,gray(0.9)); filldraw((1+b,1+a)--(1,1)--(1+a,1+b)--cycle,gray(0.9)); filldraw((-1+a,1+b)--(0,1)--(-b,1+a)--cycle,gray(0.9)); filldraw((-b,-1+a)--(0,0)--(-1+a,-b)--cycle,gray(0.9));
```


The area of the largest square is ($1+\sqrt{3})^2=4+2\sqrt{3}.$ The area of region R is $1+12\frac{1}{2}\frac{\sqrt{3}}{2}=1+3\sqrt{3}.$ The total area of four small 45-45-90 triangles at corner is $4*\frac{1}{2}(\frac{\sqrt{3}+1-2}{2})^2=2-\sqrt{3}. S=4+2\sqrt{3}-(2-\sqrt{3})=2+3\sqrt{3}, S-R=1.$

*~Bran Qin*
