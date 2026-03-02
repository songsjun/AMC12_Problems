# 2018 AMC 12B Problem 4

## Problem
A circle has a chord of length 10, and the distance from the center of the circle to the chord is 5. What is the area of the circle?

$\textbf{(A) }25\pi \qquad \textbf{(B) }50\pi \qquad \textbf{(C) }75\pi \qquad \textbf{(D) }100\pi \qquad \textbf{(E) }125\pi \qquad$
## Solution
Let O be the center of the circle, $\overline{AB}$ be the chord, and M be the midpoint of $\overline{AB},$ as shown below.

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); pair O, A, B, M; O = (0,0); A = (-5,5); B = (5,5); M = midpoint(A--B); draw(Circle(O,5sqrt(2))); dot("$O$", O, 1.5*S, linewidth(4.5)); dot("$A$", A, 1.5*NW, linewidth(4.5)); dot("$B$", B, 1.5*NE, linewidth(4.5)); dot("$M$", M, 1.5*N, linewidth(4.5)); draw(A--B^^M--O^^A--O^^M--O^^B--O); label("$5$", midpoint(A--M), 1.5*N); label("$5$", midpoint(B--M), 1.5*N); label("$5$", midpoint(O--M), 1.5*E); label("$r$", midpoint(O--A), 1.5*SW); label("$r$", midpoint(O--B), 1.5*SE);
```

Note that $\overline{OM}$\perp$\overline{AB}.$ Since OM=AM=BM=5, we conclude that $\triangle OMA$ and $\triangle OMB$ are congruent isosceles right triangles. It follows that $r=5\sqrt2,$ so the area of \odot O is $\pir^2=\boxed{\textbf{(B) }50\pi}.$

*~MRENTHUSIASM*
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/bJvXMkwjrtE

*~Education, the Study of Everything*
## See Also
