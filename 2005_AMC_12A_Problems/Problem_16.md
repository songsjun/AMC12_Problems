# 2005 AMC 12A Problem 16

## Problem
Three circles of radius s are drawn in the first quadrant of the xy-plane. The first circle is tangent to both axes, the second is tangent to the first circle and the x-axis, and the third is tangent to the first circle and the y-axis. A circle of radius r > s is tangent to both axes and to the second and third circles. What is r/s?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3mm); defaultpen(linewidth(.8pt)+fontsize(10pt)); dotfactor=3; pair O0=(9,9), O1=(1,1), O2=(3,1), O3=(1,3); pair P0=O0+9*dir(-45), P3=O3+dir(70); pair[] ps={O0,O1,O2,O3}; dot(ps); draw(Circle(O0,9)); draw(Circle(O1,1)); draw(Circle(O2,1)); draw(Circle(O3,1)); draw(O0--P0,linetype("3 3")); draw(O3--P3,linetype("2 2")); draw((0,0)--(18,0)); draw((0,0)--(0,18)); label("$r$",midpoint(O0--P0),NE); label("$s$",(-1.5,4)); draw((-1,4)--midpoint(O3--P3));
```


$$(\mathrm {A}) \ 5 \qquad (\mathrm {B}) \ 6 \qquad (\mathrm {C})\ 8 \qquad (\mathrm {D}) \ 9 \qquad (\mathrm {E})\ 10$$

## Solution
[Image:2005_$12A_AMC-16b$.png](https://artofproblemsolving.com/wiki/index.php/Image:2005_12A_AMC-16b.png)

Set $s =1$ so that we only have to find r. Draw the segment between the center of the third circle and the large circle; this has length $r+1$. We then draw the [radius](https://artofproblemsolving.com/wiki/index.php/radius) of the large circle that is perpendicular to the [x-axis](https://artofproblemsolving.com/wiki/index.php/x-axis), and draw the perpendicular from this radius to the center of the third circle. This gives us a [right triangle](https://artofproblemsolving.com/wiki/index.php/right_triangle) with legs $r-3,r-1$ and [hypotenuse](https://artofproblemsolving.com/wiki/index.php/hypotenuse) $r+1$. The [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) yields:

$$(r-3)^2 + (r-1)^2 = (r+1)^2$$

$$r^2 - 10r + 9 = 0$$

$$r = 1, 9$$

Quite obviously r > 1, so $r = 9$.
## See also
