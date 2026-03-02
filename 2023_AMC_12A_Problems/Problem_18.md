# 2023 AMC 12A Problem 18

> This problem is the same as [2023 AMC 10A #22](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10A_Problems/Problem_22) and [2023 AMC 12A #18](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12A_Problems/Problem_18).
## Problem
Circle $C_1$ and $C_2$ each have radius 1, and the distance between their centers is $\frac{1}{2}.$ Circle $C_3$ is the largest circle internally tangent to both $C_1$ and $C_2$. Circle $C_4$ is internally tangent to both $C_1$ and $C_2$ and externally tangent to $C_3$. What is the radius of $C_4$?


> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; size(10cm); draw(circle((0,0),0.75)); draw(circle((-0.25,0),1)); draw(circle((0.25,0),1)); draw(circle((0,6/7),3/28)); pair A = (0,0), B = (-0.25,0), C = (0.25,0), D = (0,6/7), E = (-0.95710678118, 0.70710678118), F = (0.95710678118, -0.70710678118); dot(B^^C); draw(B--E, dashed); draw(C--F, dashed); draw(B--C); label("$C_4$", D); label("$C_1$", (-1.375, 0)); label("$C_2$", (1.375,0)); label("$\frac{1}{2}$", (0, -.125)); label("$C_3$", (-0.4, -0.4)); label("$1$", (-.85, 0.70)); label("$1$", (.85, -.7)); import olympiad; markscalefactor=0.005;
```


$\textbf{(A) } \frac{1}{14} \qquad \textbf{(B) } \frac{1}{12} \qquad \textbf{(C) } \frac{1}{10} \qquad \textbf{(D) } \frac{3}{28} \qquad \textbf{(E) } \frac{1}{9}$
## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; size(10cm); draw(circle((0,0),0.75), gray(0.7)); draw(circle((-0.25,0),1), gray(0.7)); draw(circle((0.25,0),1), gray(0.7)); draw(circle((0,6/7),3/28), gray(0.7)); pair A = (0,0), B = (-0.25,0), C = (0.25,0), D = (0,6/7), EE = (-0.95710678118, 0.70710678118), F = (0.95710678118, -0.70710678118), G = (0,0), T=(0.75,0); dot(D); dot(G); draw(B--EE, dashed+gray(0.7)); draw(C--F, dashed+gray(0.7)); dot(C, gray(0.9)); draw(B--C, gray(0.7)); draw(B--A); draw(A--D); draw(B--D); draw(B--T); label("$\frac{1}{4}$", (-0.125, -0.125)); label("$r + \frac{3}{4}$", (0.2, 3/7)); label("$1 - r$", (-0.29, 3/7)); label("$O$",A,S); label("$A$",B,S); dot("$B$",C,S); dot("$T$",T,E); label("$1$", (-.85, 0.70)); label("$1$", (.85, -.7)); markscalefactor=0.05;
```


Let O be the center of the midpoint of the line segment connecting both the centers, say A and B.

Let the point of tangency with the inscribed circle and the right larger circles be T.

Then OT = BO + BT = BO + AT - $\frac{1}{2} = \frac{1}{4} + 1 - \frac{1}{2} = \frac{3}{4}.$

Since $C_4$ is internally tangent to $C_1$, center of $C_4, C_1$ and their tangent point must be on the same line.

Now, if we connect centers of $C_4, C_3$ and $C_1/C_2$, we get a right angled triangle.

Let the radius of $C_4$ equal r. With the pythagorean theorem on our triangle, we have

$$\left(r+\frac{3}{4}\right)^2+\left(\frac{1}{4}\right)^2=(1-r)^2$$

Solving this equation gives us

$$r = \boxed{\textbf{(D) } \frac{3}{28}}$$

*~lptoggled*

*~ShawnX (Diagram)*

*~ap246 (Minor Changes)*
## Solution 2: Estimation
Draw 2 lines from the middle segment's endpoints to an intersection of $C_1$ and $C_2$. Draw the perpendicular bisector of the middle segment until it reaches one of the intersections. We see this becomes a right triangle with a hypotenuse of 1 and one leg length of $\dfrac14.$ Using the Pythagorean theorem, the other leg length is $\dfrac{\sqrt{15}}{4}.$ Also drawing $C_1$'s radius along the segment of $\dfrac12$ allows us to find the that radius of the middle circle is $\dfrac34.$

Finally notice that $r_{C_3} + 2 r_{C_4}$ is really close to $\dfrac{\sqrt{15}}{4}.$
2 $r_{C_4}=\dfrac{\sqrt{15} - 3}{4},$ so $r_{C_4}=\dfrac{\sqrt{15} - 3}{8}.$ This is really close to $\dfrac18$ and the closest answer to that is $\boxed{\text{D) }\dfrac{3}{28}}$

*~Wiselion*
*~minor edits by AnjaliC123*
## Video Solution by Little Fermat
https://youtu.be/h2Pf2hvF1wE?si=_zp2L0edaMjl63-P&t=4908
*~little-fermat*
## Video Solution by Math-X (First fully understand the problem!!!)
https://youtu.be/GP-DYudh5qU?si=LdnMT_hCLmgL889h&t=7950

*~Math-X*
## Video Solution by OmegaLearn
https://youtu.be/jcHeJXs9Sdw
## Video Solution by MegaMath
https://www.youtube.com/watch?v=lHyl_JtbSuQ&t=8s

*~megahertz13*
## Video Solution by CosineMethod [🔥Fast and Easy🔥]
https://www.youtube.com/watch?v=rnuL3sVU5aU
## Video Solution by epicbird08
https://youtu.be/mhGblJvYeRs

*~EpicBird08*
## Video Solution
https://youtu.be/BWM8NRQBhIw

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by TheBeautyofMath
https://youtu.be/tD_irI8Yoro

*~IceMatrix*
## Video Solution by Problem Solving Channel
https://youtu.be/7Wg-_79LepU

*~ProblemSolvingChannel*
## See Also
