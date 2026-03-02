# 2025 AMC 12A Problem 24

## Problem
A circle of radius r is surrounded by 12 circles of radius 1, externally tangent to the central circle and sequentially tangent to each other, as shown. Then r can be written as $\sqrt$ a + $\sqrt$ b + c, where a, b, c are integers. What is a+b+c?


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(fontsize(12)+linewidth(1)); size(200); real $r=2.925, x=360/12$; pair O=origin; draw(CR(O,r),black+1.5); for (int $i = 0$; i<12; ++i) { draw(CR($(r+1)$*dir(i*x),1)); } dot(O); dot($(r+1)$*right); draw(O--(r,0)^^($r+1,0)--(r+2$,0), linewidth(0.5)); label("$r$",(r/2,0),up); label("$1$",(r+3/2,0)$$,up);
```


$\textbf{(A) } 3 \qquad \textbf{(B) } 5 \qquad \textbf{(C) } 7 \qquad \textbf{(D) } 9 \qquad \textbf{(E) } 11$
## Solution 1 (Sin 15)
Let the center of the large circle be O and the centers of the 12 circles be $A_1, A_2, A_3, \dots, A_{12}.$ Triangle $OA_1A_2$ has side lengths $r+1, r+1$, 2, with the angle opposite 2 being $360/12 = 30$. Note that the line connecting $A_1$ and $A_2$ go through their common point of tangency, by definition, which causes $A_1A_2$ to have a length of 2.

Drawing the angle bisector of the 30 degree angle, we split $OA_1A_2$ into two congruent right triangles, each with hypotenuse $r+1$ and side opposite the 15 degree angle 1.

From here, note that $\sin{15} = \frac{\sqrt{6}-\sqrt{2}}{4},$ which be derived using the trigonometric identity $\sin{(A-B)} = \sin{A} \cos{B} - \sin{B} \cos{A},$ with A=45 and B=30.

In our right triangle, $\sin{15} = \frac{1}{r+1} = \frac{\sqrt{6}-\sqrt{2}}{4}.$ Let $x=r+1$. Solving for x, we get $x =\frac{4}{\sqrt{6}-\sqrt{2}}.$ Rationalizing, we get that $x =\sqrt{6}+\sqrt{2}.$

Remember $x =r+1=\sqrt{6}+\sqrt{2},$ so $r =\sqrt{6}+\sqrt{2} - 1.$ Therefore, our answer is $6+2-1 =\boxed{7}.$

*~lprado*
## Solution 2 (Law of Cosines Bash)
Let the center of the large circle be O and the centers of any two circles be A and B. Triangle OAB has side lengths $r+1, r+1$, 2, with the angle opposite 2 being $360/12 = 30$.

Using Law of Cosines, 2^2=AO^2+BO^2-2AOBO$\cos30.$ Plugging in the radius yields $2^2=(r+1)^2+(r+1)^2-2(r+1)^2\cdot\frac{\sqrt{3}}{2}.$ After solving for r and simplifying, we get $r=\sqrt6+\sqrt2-1.$ Therefore our answer is 7.

*~Kevin Wang*
### Worked Out Solution
4=($2-\sqrt{3})(r+1)^2.$ Divide both sides to get $\frac{4}{2-\sqrt{3}}=(r+1)^2.$ Rationalize and expand to get $8+4\sqrt{3}=r^2+2$r+1. Then r^2+$2r$+(-7-$4\sqrt{3})=0.$ Use the quadratic formula to get $r=\frac{-2+\sqrt{4+28+16\sqrt{3}}}{2},$ or $r=-1+\sqrt{8+4\sqrt{3}} ($Note: We only take the plus instead of plus-minus because r must be positive). Clearly c=-1, and then we need to find some a and b such that $\sqrt{a} + \sqrt{b} = \sqrt{8+4\sqrt{3}}.$ If we square both sides, $a+b+2\sqrt{ab} = 8+4\sqrt{3},$ so a+$b=8$. Plug in our previously found values to find a+b+$c=8$+(-1). Therefore our answer is 7.

*~Samuel and Jungbin*

$\textbf{Remark}$

We could've also noticed that $\sqrt{2-\sqrt{3}} = \sqrt{\frac{1}{2}\cdot(4-2\sqrt{3})} = \frac{1}{\sqrt{2}}*\sqrt{3-2\sqrt{3}+1} = \frac{1}{\sqrt{2}}*(\sqrt{3}-1),$ and therefore directly gotten $r+1=\sqrt{\frac{4}{2-\sqrt{3}}} = \frac{2}{\frac{1}{\sqrt{2}}*(\sqrt{3}-1)} = \frac{2\sqrt{2}}{\sqrt{3}-1}$ and solved from there.
## Solution 3 (Easy Geo Method)
We connect the centers of the smaller circles at $0^\circ$ and $90^\circ$ as follows:

> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(250); real R = -1 + sqrt(2) + sqrt(6); real $r = 1$; pair O = (0,0); label("$O$", 0, W); pair C0 = (R + r) * dir(0); label("$A$", C0, E); pair C15 = (R + r) * dir(15); label("2", C15, NE); pair C30 = (R + r) * dir(30); label("$B$", C30, E); pair C45 = (R + r) * dir(45); label("2", C45, NE); pair C60 = (R + r) * dir(60); label("$C$", C60, NE); pair C75 = (R + r) * dir(75); label("2", C75, NE); pair C90 = (R + r) * dir(90); label("$D$", C90, N); pair project(pair P, pair A, pair B) { pair AB = B - A; real t = dot(P - A, AB) / dot(AB, AB); return A + t * AB; } pair foot30 = project(C30, C0, C90); pair foot60 = project(C60, C0, C90); draw(Circle(O, R), black + linewidth(1bp)); for(int $i = 0$; i < 12; ++i) { real theta = i * 360 / 12; pair center = (R + r) * dir(theta); draw(Circle(center, r), blue + linewidth(1bp)); } draw(O -- C0, black + linewidth(1bp)); draw(O -- C90, black + linewidth(1bp)); draw(C0 -- C30, red + linewidth(1bp)); draw(C30 -- C60, red + linewidth(1bp)); draw(C60 -- C90, red + linewidth(1bp)); draw(C0 -- C90, red + linewidth(1bp)); draw(C30 -- foot30, blue + linewidth(1bp)); draw(C60 -- foot60, blue + linewidth(1bp));
```


Note that connecting the centers of the 12 smaller circles forms a regular 12-gon. A regular 12-gon has angles

$$\frac{10\cdot 180}{12} = 150^\circ,$$

so $\angle OAB = \angle ODC = 75^\circ.$ Furthermore, since OA=OD and $\angle AOD = 90^\circ,$ we have $\angle OAD = 45^\circ,$ so $\angle DAB = 30^\circ.$ Next, we drop the perpendiculars from B and C to AD. This creates a 1 $\times 2$ rectangle and two 30-60-90 triangles. Thus,

$$AD = (r+1)\sqrt{2} = 2+2\sqrt{3},$$

and manipulating yields

$$r = -1 + \sqrt{2}+\sqrt{6},$$

so the desired answer is -1+2+6 = $\boxed{\text{(C) } 7.}$

P.S. I posted the asymptote code here. Anyone that wishes to use it can steal~ :)

*~ABC09090927*
## Video Solution 1 by OmegaLearn.org
https://youtu.be/nR67IIw_kgg
## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution 3 by VHS Math Mentorship
https://youtu.be/jtgG1OY-rDs?si=Z50z59yaKjHCUhEw
