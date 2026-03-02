# 2005 AMC 12B Problem 24

## Problem
All three vertices of an equilateral triangle are on the parabola $y = x^2,$ and one of its sides has a slope of 2. The x-coordinates of the three vertices have a sum of m/n, where m and n are relatively prime positive integers. What is the value of m + n?


$$\mathrm{(A)}\ }\qquad\mathrm{(B)}\ }\qquad\mathrm{(C)}\ }\qquad\mathrm{(D)}\ }\qquad\mathrm{(E)}\ }$$

## Solution 1 (Complex numbers)
Let the three points be at A = $(x_1, x_1^2), B = (x_2, x_2^2)$, and C = $(x_3, x_3^2)$, such that the slope between the first two is 2, and A is the point with the least y-coordinate.

Then, we have $\textrm{Slope of }AC = \frac{x_1^2 - x_3^2}{x_1 - x_3} =x_$1 + $x_3$. Similarly, the slope of BC is $x_2+x_3$, and the slope of AB is $x_1+x_2 = 2$. The desired sum is $x_1+x_2 + x_3$, which is equal to the sum of the slopes divided by 2.

To find the slope of AC, we note that it comes at a $60^{\circ}$ angle with AB. Thus, we can find the slope of AC by multiplying the two complex numbers 1 + $2i$ and 1 + $\sqrt{3}$i. What this does is generate the complex number that is at a $60^{\circ}$ angle with the complex number 1 + $2i$. Then, we can find the slope of the line between this new complex number and the origin:

$$
(1+2i)(1+\sqrt{3}i)
= 1 - 2\sqrt{3} + 2i + \sqrt{3}i
$$

$\textrm{Slope } = \frac{2 + \sqrt{3}}{1 - 2\sqrt{3}}$

$$
= \frac{2 + \sqrt{3}}{1 - 2\sqrt{3}} \cdot \frac{1 + 2\sqrt{3}}{1 + 2\sqrt{3}}
= \frac{8 + 5\sqrt{3}}{-11}
= \frac{-8 - 5\sqrt{3}}{11}.
$$

The slope BC can also be solved similarly, noting that it makes a $120^{\circ}$ angle with AB:

$$
(1+2i)(-1+\sqrt{3}i)
= -1 - 2\sqrt{3} - 2i + \sqrt{3}i
$$

$\textrm{Slope } = \frac{\sqrt{3} - 2}{-2\sqrt{3} - 1}$
$$= \frac{2 - \sqrt{3}}{1 + 2\sqrt{3}} \cdot \frac{1 - 2\sqrt{3}}{1 - 2\sqrt{3}}$$

At this point, we start to notice a pattern: This expression is equal to $\frac{2 + \sqrt{3}}{1 - 2\sqrt{3}} \cdot \frac{1 + 2\sqrt{3}}{1 + 2\sqrt{3}},$ except the numerators of the first fractions are conjugates! Notice that this means that when we multiply out, the rational term will stay the same, but the coefficient of $\sqrt{3}$ will have its sign switched. This means that the two complex numbers are conjugates, so their irrational terms cancel out.

Our sum is simply 2 - $2\cdot\frac{8}{11} = \frac{6}{11},$ and thus we can divide by 2 to obtain $\frac{3}{11},$ which gives the answer $\boxed{\mathrm{(A)}\ 14}.$

*~mathboy100*
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; real f(real x) {return $x^2$;} unitsize(1 cm); pair A, B, C; real a, b, c; a = (-5*sqrt(3) + 11)/11; b = (5*sqrt(3) + 11)/11; c = -19/11; A = (a,f(a)); B = (b,f(b)); C = (c,f(c)); draw(graph(f,-2,2)); draw((-2,0)--(2,0),Arrows); draw((0,-0.5)--(0,4),Arrows); draw(A--B--C--cycle); label("$x$", (2,0), NE); label("$y$", (0,4), NE); dot("$A(a,a^2)$", A, S); dot("$B(b,b^2)$", B, E); dot("$C(c,c^2)$", C, W);
```

Using the slope formula and differences of squares, we find:

a+b = the slope of AB,

b+c = the slope of BC,

a+c = the slope of AC.

So the value that we need to find is the sum of the slopes of the three sides of the triangle divided by 2. Without loss of generality, let AB be the side that has the smallest angle with the positive x-axis. Let J be an arbitrary point with the coordinates (1, 0). Translate the triangle so A is at the origin. Then $\tan(BOJ) = 2.$ Since the slope of a line is equal to the tangent of the angle formed by the line and the positive x- axis, the answer is $\dfrac{\tan(BOJ) + \tan(BOJ+60) + \tan(BOJ-60)}{2}.$

Using $\tan(BOJ) = 2,$ and the tangent addition formula, this simplifies to $\dfrac{3}{11},$ so the answer is 3 + 11 = $\boxed{\mathrm{(A)}\ 14}$
## See also
