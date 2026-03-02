# 2008 AMC 12A Problem 18

## Problem
Triangle ABC, with sides of length 5, 6, and 7, has one [vertex](https://artofproblemsolving.com/wiki/index.php/vertex) on the positive x-axis, one on the positive y-axis, and one on the positive z-axis. Let O be the [origin](https://artofproblemsolving.com/wiki/index.php/origin). What is the volume of [tetrahedron](https://artofproblemsolving.com/wiki/index.php/tetrahedron) OABC?


$$\mathrm{(A)}\ \sqrt{85}\qquad\mathrm{(B)}\ \sqrt{90}\qquad\mathrm{(C)}\ \sqrt{95}\qquad\mathrm{(D)}\ 10\qquad\mathrm{(E)}\ \sqrt{105}$$

## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(fontsize(8)); draw((0,10)--(0,0)--(8,0));draw((-3,-4)--(0,0));draw((0,10)--(-3,-4)--(8,0)--cycle); label("A",(8,0),(1,0));label("B",(0,10),(0,1));label("C",(-3,-4),(-1,-1));label("O",(0,0),(1,1)); label("$a$",(4,0),(0,1));label("$b$",(0,5),(1,0));label("$c$",(-1.5,-2),(1,0)); label("$5$",(4,5),(1,1));label("$6$",(-1.5,3),(-1,0));label("$7$",(2.5,-2),(1,-1));
```


Without loss of generality, let A be on the x axis, B be on the y axis, and C be on the z axis, and let AB, BC, CA have respective lengths of 5, 6, and 7.  Let a,b,c denote the lengths of segments OA,OB,OC, respectively.  Then by the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem),

$$
\begin{align*} a^2+b^2 &=5^2 , \\ b^2+c^2&=6^2, \\ c^2+a^2 &=7^2 , \end{align*}
$$

so $a^2 = (5^2+7^2-6^2)/2 = 19$; similarly, b^2 = 6 and c^2 = 30. Since OA, OB, and OC are mutually perpendicular, the tetrahedron's volume is  abc/6 because we can consider the tetrahedron to be a right triangular pyramid.
 $abc/6 =\sqrt{a^2b^2c^2}$/$6 =\frac{\sqrt{19 \cdot 6 \cdot 30}}{6} = \sqrt{95},$
which is answer choice $\boxed{\text{C}}.$
## Video Solution by OmegaLearn
https://youtu.be/MOcX5BFbcwU?t=1320

*~pi_is_3.14*
## See also
