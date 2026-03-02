# 2022 AMC 12A Problem 13

## Problem
Let $\mathcal{R}$ be the region in the complex plane consisting of all complex numbers z that can be written as the sum of complex numbers $z_1$ and $z_2$, where $z_1$ lies on the segment with endpoints 3 and $4i$, and $z_2$ has magnitude at most 1. What integer is closest to the area of $\mathcal{R}$?

$\textbf{(A) } 13 \qquad \textbf{(B) } 14 \qquad \textbf{(C) } 15 \qquad \textbf{(D) } 16 \qquad \textbf{(E) } 17$
## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
size(250); import TrigMacros; rr_cartesian_axes(-2,6,-2,6,complexplane=true, usegrid = true); Label f; f.p=fontsize(6); xaxis(-1,5,Ticks(f, 1.0)); yaxis(-1,5,Ticks(f, 1.0)); dot((3,0)); dot((0,4)); draw((0,4)--(3,0), blue); draw((0.8, 4.6)..(-.6,4.8)..(-.8, 3.4),red); draw((-.8, 3.4)--(2.2, -0.6), red); draw((2.2, -0.6)..(3.6,-0.8)..(3.8,0.6), red); draw((0.8, 4.6)--(3.8,0.6),red); draw((0.8, 4.6)--(-.8, 3.4),red+dashed); draw((2.2, -0.6)--(3.8,0.6),red+ dashed); draw((3,0)--(3,-1),Arrow); label("1",(3,0)--(3,-1),E); draw((0,4)--(-.6,4.8),Arrow); label("1",(0,4)--(-.6,4.8),SW); draw((1.5,2)--(2.3,2.6),Arrow); label("1",(1.5,2)--(2.3,2.6),SE);
```


If z is a complex number and z = a + bi, then the magnitude (length) of z is $\sqrt{a^2 + b^2}.$ Therefore, $z_1$ has a magnitude of 5. If $z_2$ has a magnitude of at most one, that means for each point on the segment given by $z_1$, the bounds of the region $\mathcal{R}$ could be at most 1 away. Alone the line, excluding the endpoints, a rectangle with a width of 2 and a length of 5, the magnitude, would be formed. At the endpoints, two semicircles will be formed with a radius of 1 for a total area of $\pi \approx 3.$
Therefore, the total area is $5(2)+\pi \approx 10 + 3 = \boxed{\textbf{(A) } 13}.$

*~juicefruit*
## Video Solution 1 (Quick and Simple)
https://youtu.be/z-Ay2nNejnY

*~Education, the Study of Everything*
## Video Solution 1 (Simple and Fun!!!)
https://youtu.be/7yAh4MtJ8a8?si=5AxafzIVqF71CtGL&t=2712

*~Math-X*
## See Also
