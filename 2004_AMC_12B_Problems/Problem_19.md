# 2004 AMC 12B Problem 19

## Problem
A truncated cone has horizontal bases with radii 18 and 2. A sphere is tangent to the top, bottom, and lateral surface of the truncated cone. What is the radius of the sphere?


$$\mathrm{(A)}\ 6 \qquad\mathrm{(B)}\ 4\sqrt{5} \qquad\mathrm{(C)}\ 9 \qquad\mathrm{(D)}\ 10 \qquad\mathrm{(E)}\ 6\sqrt{3}$$

## Solution
Consider a [trapezoid](https://artofproblemsolving.com/wiki/index.php/trapezoid) (label it ABCD as follows) cross-section of the truncate cone along a diameter of the bases:

> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; size(220); defaultpen(0.7); pair A = (0,0), B = (36,0), C = (20,12), D = (16,12), E=(A+B)/2, F=(20+1.6,12-1.2), G = (C+D)/2; draw(A--B--C--D--cycle); draw(circumcircle(E,F,G)); dot(E); dot(F); dot(G); label("$A$",A,S); label("$B$",B,S); label("$C$",C,NE); label("$D$",D,NW); label("$E$",E,S); label("$F$",F,NE); label("$G$",G,N);
```

Above, E,F, and G are points of [tangency](https://artofproblemsolving.com/wiki/index.php/tangent_(geometry)). By the Two Tangent Theorem, BF = BE = 18 and CF = CG = 2, so BC = 20. We draw H such that it is the foot of the altitude $\overline{HD}$ to $\overline{AB}$:

> [Asymptote diagram - not rendered in Markdown]

```asy
import olympiad; size(220); defaultpen(0.7); pair A = (0,0), B = (36,0), C = (20,12), D = (16,12), E=(A+B)/2, F=(20+1.6,12-1.2), G = (C+D)/2, H=(16,0); pair P=(D+G)/2, Q=(D+H)/2, R=(B+E)/2, T=(A+H)/2, O=(E+G)/2; draw(A--B--C--D--cycle); draw(G--E--H--D); draw(circumcircle(E,F,G)); dot(E);dot(F);dot(G);dot(H);dot(O); label("$A$",A,S); label("$B$",B,S); label("$C$",C,NE); label("$D$",D,NW); label("$E$",E,S); label("$F$",F,NE); label("$G$",G,N); label("$H$",H,S); label("$O$",O,NE); label("$2$",P,N); label("$12$",Q,W); label("$18$",R,S); label("$16$",T,S); label("$20$",(A+D)/2,NW); label("$r$",(O+E)/2,SE);
```


By the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem),
$$r = \frac{DH}2 = \frac{\sqrt{20^2 - 16^2}}2 = 12$$
Therefore, the answer is $\boxed.$
## See also
