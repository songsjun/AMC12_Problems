# 2021 AMC 12B Problem 15

> This problem is the same as [2021 AMC 10B #20](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10B_Problems#Problem_20) and [2021 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12B_Problems#Problem_15).
## Problem
The figure is constructed from 11 line segments, each of which has length 2. The area of pentagon ABCDE can be written as $\sqrt{m} + \sqrt{n},$ where m and n are positive integers. What is m + n ?

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by samrocksnature */ pair A=(-2.4638,4.10658); pair B=(-4,2.6567453480756127); pair C=(-3.47132,0.6335248637894945); pair D=(-1.464483379039766,0.6335248637894945); pair E=(-0.956630463955801,2.6567453480756127); pair F=(-2,2); pair G=(-3,2); draw(A--B--C--D--E--A); draw(A--F--A--G); draw(B--F--C); draw(E--G--D); label("A",A,N); label("B",B,W); label("C",C,S); label("D",D,S); label("E",E,dir(0)); dot(A^^B^^C^^D^^E^^F^^G);
```


$\textbf{(A)} ~20 \qquad\textbf{(B)} ~21 \qquad\textbf{(C)} ~22 \qquad\textbf{(D)} ~23 \qquad\textbf{(E)} ~24$
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by samrocksnature, adapted by Tucker, then adjusted by samrocksnature again, then adjusted by erics118 xD*/ pair A=(-2.4638,4.10658); pair B=(-4,2.6567453480756127); pair C=(-3.47132,0.6335248637894945); pair D=(-1.464483379039766,0.6335248637894945); pair E=(-0.956630463955801,2.6567453480756127); pair F=(-1.85,2); pair G=(-3.1,2); draw(A--G--A--F, lightgray); draw(B--F--C, lightgray); draw(E--G--D, lightgray); dot(F^^G, lightgray); draw(A--B--C--D--E--A); draw(A--C--A--D); label("A",A,N); label("B",B,W); label("C",C,S); label("D",D,S); label("E",E,dir(0)); dot(A^^B^^C^^D^^E);
```


Draw diagonals AC and AD to split the pentagon into three parts. We can compute the area for each triangle and sum them up at the end. For triangles ABC and ADE, they each have area $2\cdot\frac{1}{2}\cdot\frac{4\sqrt{3}}{4}=\sqrt{3}.$ For triangle ACD, we can see that AC=AD=$2\sqrt{3}$ and CD=2. Using Pythagorean Theorem, the altitude for this triangle is $\sqrt{11},$ so the area is $\sqrt{11}.$ Adding each part up, we get $2\sqrt{3}+\sqrt{11}=\sqrt{12}+\sqrt{11} \implies \boxed{\textbf{(D)} ~23}.$

Note: Another easier way to find the areas would be to use the formula A=$\frac12ab\sin C -$ erringbubble
## Video Solution (🚀Under 3 min!🚀)
https://youtu.be/1CAbbfArA6w

_~Education, the Study of Everything_
## Video Solution(always chill)
https://www.youtube.com/watch?v=CSR-rJ-3hys&ab_channel=Chillin
## Video Solution by OmegaLearn (Extending Lines, Angle Chasing, Trig Area)
https://youtu.be/QtSbAKUb1VE

*~pi_is_3.14*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=p4iCAZRUESs
## Video Solution by Mathematical Dexterity (Basic Area Formulas)
https://www.youtube.com/watch?v=7kDTlVixsD0
## Video Solution by TheBeautyofMath
https://youtu.be/FV9AnyERgJQ?t=1226

*~IceMatrix*
## Video Solution by Interstigation (Ignore Useless Segments)
https://youtu.be/9eChInz03UQ

*~Interstigation*
## Video Solution by The Power of Logic
https://www.youtube.com/watch?v=f8L5K2yIXUc

*~The Power of Logic*
## Remark
This configuration of 11 congruent line segments is known as the Moser Spindle https://en.wikipedia.org/wiki/Moser_spindle , and can be used to demonstrate that 3 colors are not sufficient to color all of the points in the plane such that points that are 1 unit apart have different colors. Finding the minimum such number of colors is a famous unsolved problem: the Nelson-Hadwiger problem. See: https://en.wikipedia.org/wiki/Hadwiger%E2%80%93Nelson_problem

*~hailstone*
## See Also
