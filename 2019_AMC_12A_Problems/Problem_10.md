# 2019 AMC 12A Problem 10

> This problem is the same as [2019 AMC 10A #16](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #10](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
The figure below shows 13 circles of radius 1 within a larger circle. All the intersections occur at points of tangency. What is the area of the region, shaded in the figure, inside the larger circle but outside all the circles of radius 1 ?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(20);filldraw(circle((0,0),2*sqrt(3)+1),rgb(0.5,0.5,0.5));filldraw(circle((-2,0),1),white);filldraw(circle((0,0),1),white);filldraw(circle((2,0),1),white);filldraw(circle((1,sqrt(3)),1),white);filldraw(circle((3,sqrt(3)),1),white);filldraw(circle((-1,sqrt(3)),1),white);filldraw(circle((-3,sqrt(3)),1),white);filldraw(circle((1,-1*sqrt(3)),1),white);filldraw(circle((3,-1*sqrt(3)),1),white);filldraw(circle((-1,-1*sqrt(3)),1),white);filldraw(circle((-3,-1*sqrt(3)),1),white);filldraw(circle((0,2*sqrt(3)),1),white);filldraw(circle((0,-2*sqrt(3)),1),white);
```


$\textbf{(A) } 4 \pi \sqrt{3} \qquad\textbf{(B) } 7 \pi \qquad\textbf{(C) } \pi\left(3\sqrt{3} +2\right) \qquad\textbf{(D) } 10 \pi \left(\sqrt{3} - 1\right) \qquad\textbf{(E) } \pi\left(\sqrt{3} + 6\right)$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(20);filldraw(circle((0,0),2*sqrt(3)+1),rgb(0.5,0.5,0.5));filldraw(circle((-2,0),1),white);filldraw(circle((0,0),1),white);filldraw(circle((2,0),1),white);filldraw(circle((1,sqrt(3)),1),white);filldraw(circle((3,sqrt(3)),1),white);filldraw(circle((-1,sqrt(3)),1),white);filldraw(circle((-3,sqrt(3)),1),white);filldraw(circle((1,-1*sqrt(3)),1),white);filldraw(circle((3,-1*sqrt(3)),1),white);filldraw(circle((-1,-1*sqrt(3)),1),white);filldraw(circle((-3,-1*sqrt(3)),1),white);filldraw(circle((0,2*sqrt(3)),1),white);filldraw(circle((0,-2*sqrt(3)),1),white); pair O,A,B,C,H; O=(0,0); A=(-1,sqrt(3)); B=(1,sqrt(3)); C=(0,sqrt(3)*2); H=(0,sqrt(3)); draw(O--A); draw(A--C); draw(B--C); draw(O--B); draw(A--B); draw(O--C); dot(A); dot(B); dot(C); dot(O); label("A",A, W); label("O",O,S); label("B",B,E); label("C",C, N); label("H",H, NE);
```


In the diagram above, notice that triangle OAB and triangle ABC are congruent and equilateral with side length 2. We can see the radius of the larger circle is $2\overline{OH} + 1.$ Using $30^{\circ}-60^{\circ}-90^{\circ}$ triangles, we know $\overline{OH} = \sqrt{3}.$ Therefore, the radius of the larger circle is $2\sqrt{3}+1.$

The area of the larger circle is thus $\left(2\sqrt{3}+1\right)^2 \pi = \left(13+4\sqrt{3}\right)\pi,$ and the sum of the areas of the smaller circles is $13\pi,$ so the area of the dark region is $\left(13+4\sqrt{3}\right)\pi-13\pi = \boxed{\textbf{(A) } 4 \pi \sqrt{3}}.$
## Solution 2
We can form an equilateral triangle with side length 6 from the centers of three of the unit circles tangent to the outer circle. The radius of the outer circle is the circumradius of the triangle plus 1. By using R = $\frac{abc}{4K}$ or R=$\frac{a}{2\sin{A}},$ we get the radius as $\frac{6}{\sqrt{3}}+1.$

The shaded area is thus $\pi((\frac{6}{\sqrt{3}}+1)^2-13) = \boxed{\textbf{(A) } 4 \pi \sqrt{3}}.$
## Solution 3
Like in Solution 2, we can form an equilateral triangle with side length 6 from the centers of three of the unit circles tangent to the outer circle. We can find the height of this triangle to be $3\sqrt{3}.$ Then, we can form another equilateral triangle from the centers of the second and third circles in the third row and the center of the bottom circle with side length 2. The height of this triangle is clearly $\sqrt{3}.$ Therefore the diameter of the large circle is $4\sqrt{3} + 2$ and the radius is $\frac{4\sqrt{3}+2}{2} = 2\sqrt{3} + 1.$ The area of the large circle is thus $\pi\left(2\sqrt{3} + 1\right)^{2} = \pi \cdot \left(13 + 4\sqrt{3}\right) = 13\pi + 4\pi\sqrt{3}.$ The total area of the 13 smaller circles is $13\pi,$ so the shaded area is $\left(13\pi + 4\pi\sqrt{3}\right) - 13\pi = \boxed{\textbf{(A) } 4 \pi \sqrt{3}}.$
## Solution 4
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(20);filldraw(circle((0,0),2*sqrt(3)+1),rgb(0.5,0.5,0.5));filldraw(circle((-2,0),1),white);filldraw(circle((0,0),1),white);filldraw(circle((2,0),1),white);filldraw(circle((1,sqrt(3)),1),white);filldraw(circle((3,sqrt(3)),1),white);filldraw(circle((-1,sqrt(3)),1),white);filldraw(circle((-3,sqrt(3)),1),white);filldraw(circle((1,-1*sqrt(3)),1),white);filldraw(circle((3,-1*sqrt(3)),1),white);filldraw(circle((-1,-1*sqrt(3)),1),white);filldraw(circle((-3,-1*sqrt(3)),1),white);filldraw(circle((0,2*sqrt(3)),1),white);filldraw(circle((0,-2*sqrt(3)),1),white); pair A,B,C; A=(0,sqrt(3)*2); B=(-2,0); C=(0,0); draw(A--B); draw(A--C); draw(B--C); dot(A); dot(B); dot(C); label("A",A, N); label("B",B, W); label("C",C, S);
```


In the diagram above, AB=4 and BC=2, so AC=$\sqrt{4^2-2^2}=2\sqrt{3}.$ The larger circle's radius is AC+1=$2\sqrt{3}+1,$ so the larger circle's area is $\pi\left(2\sqrt{3}+1\right)^2=\pi\left(13+4\sqrt{3}\right)=13\pi+4\pi\sqrt{3}.$ Now, subtracting the combined area of the smaller circles gives $13\pi+4\pi\sqrt{3}-13\pi=\boxed{\textbf{(A) } 4 \pi \sqrt{3}}.$
## Video Solution1
https://youtu.be/BBoWwpToBZ8

Education, the Study of Everything
## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=q9L66I9f9nI
## Video Solution
https://youtu.be/WOz6CpF-6mI

*~savannahsolver*
## Video Solution by OmegaLearn
https://youtu.be/NsQbhYfGh1Q?t=1793

*~pi_is_3.14*
## See Also
