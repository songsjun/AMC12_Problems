# 2006 AMC 12A Problem 19

## Problem
[Circle](https://artofproblemsolving.com/wiki/index.php/Circle)s with [ center](https://artofproblemsolving.com/wiki/index.php/center_(geometry)_)s (2,4) and (14,9) have [ radii](https://artofproblemsolving.com/wiki/index.php/radius_) 4 and 9, respectively. The equation of a common external [tangent](https://artofproblemsolving.com/wiki/index.php/tangent_line) to the circles can be written in the form y=mx+b with m>0. What is b?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(150); defaultpen(linewidth(0.7)+fontsize(8)); draw(circle((2,4),4));draw(circle((14,9),9)); draw((0,-2)--(0,20));draw((-6,0)--(25,0)); draw((2,4)--(2,4)+4*expi(pi*4.5/11)); draw((14,9)--(14,9)+9*expi(pi*6/7)); label("4",(2,4)+2*expi(pi*4.5/11),(-1,0)); label("9",(14,9)+4.5*expi(pi*6/7),(1,1)); label("(2,4)",(2,4),(0.5,-1.5));label("(14,9)",(14,9),(1,-1)); draw((-4,120*-4/119+912/119)--(11,120*11/119+912/119)); dot((2,4)^^(14,9));
```


$$\mathrm{(A) \ } \frac{908}{119}\qquad \mathrm{(B) \ } \frac{909}{119}\qquad \mathrm{(C) \ } \frac{130}{17}\qquad \mathrm{(D) \ } \frac{911}{119}\qquad \mathrm{(E) \ } \frac{912}{119}$$

## Solution
Let $L_1$ be the line that goes through (2,4) and (14,9), and let $L_2$ be the line y=mx+b. If we let $\theta$ be the measure of the acute angle formed by $L_1$ and the x-axis, then $\tan\theta=\frac{5}{12}. L_1$ clearly bisects the angle formed by $L_2$ and the x-axis, so $m=\tan{2\theta}=\frac{2\tan\theta}{1-\tan^2{\theta}}=\frac{120}{119}.$ We also know that $L_1$ and $L_2$ intersect at a point on the x-axis. The equation of $L_1$ is $y=\frac{5}{12}x+\frac{19}{6},$ so the coordinate of this point is $\left(-\frac{38}{5},0\right).$ Hence the equation of $L_2$ is $y=\frac{120}{119}x+\frac{912}{119},$ so $b=\frac{912}{119},$ and our answer choice is $\boxed{\mathrm{E}}.$
## See also
