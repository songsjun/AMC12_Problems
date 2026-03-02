# 2006 AMC 12A Problem 22

## Problem
A [circle](https://artofproblemsolving.com/wiki/index.php/circle) of [radius](https://artofproblemsolving.com/wiki/index.php/radius) r is [concentric](https://artofproblemsolving.com/wiki/index.php/concentric) with and outside a [ regular](https://artofproblemsolving.com/wiki/index.php/regular_polygon_) [hexagon](https://artofproblemsolving.com/wiki/index.php/hexagon) of side length 2. The [probability](https://artofproblemsolving.com/wiki/index.php/probability) that three entire sides of hexagon are visible from a randomly chosen point on the circle is 1/2. What is r?


$$\mathrm{(A) \ } 2\sqrt{2}+2\sqrt{3}\qquad \mathrm{(B) \ } 3\sqrt{3}+\sqrt{2}\qquad \mathrm{(C) \ } 2\sqrt{6}+\sqrt{3}\qquad \rm{(D) \ } 3\sqrt{2}+\sqrt{6}\qquad \mathrm{(E) \ } 6\sqrt{2}-\sqrt{3}$$

## Solution
Project any two non-adjacent and non-opposite sides of the [hexagon](https://artofproblemsolving.com/wiki/index.php/hexagon) to the [circle](https://artofproblemsolving.com/wiki/index.php/circle); the [arc](https://artofproblemsolving.com/wiki/index.php/arc) between the two points formed is the location where all three sides of the hexagon can be fully viewed. Since there are six such pairs of sides, there are six arcs. The probability of choosing a point is 1 / 2, or if the total arc degree measures add up to $\frac{1}{2} \cdot 360^{\circ} = 180^{\circ}.$ Each arc must equal $\frac{180^{\circ}}{6} = 30^\mathrm{\circ}.$

[Image:2006_$12A_AMC-22$.png](https://artofproblemsolving.com/wiki/index.php/Image:2006_12A_AMC-22.png)

Call the center O, and the two endpoints of the arc A and B, so $\angle AOB = 30^{\circ}.$ Let P be the intersections of the projections of the sides of the hexagon corresponding to $\overline{AB}.$ Notice that $\triangle APO$ is an [isosceles triangle](https://artofproblemsolving.com/wiki/index.php/isosceles_triangle): $\angle AOP = 15^{\circ}$ and $\angle OAP = OAB - 60^{\circ} = \frac{180^{\circ}-30^{\circ}}{2} - 60^{\circ} = 15^{\circ}.$ Since OA is a radius and OP can be found in terms of a side of the hexagon, we are almost done.

If we draw the altitude of APO from P, then we get a [right triangle](https://artofproblemsolving.com/wiki/index.php/right_triangle). Using simple trigonometry, $\cos 15^{\circ} = \frac{\frac{r}{2}}{2\sqrt{3}} = \frac{r}{4\sqrt{3}}.$

Since $\cos 15^{\circ} = \cos (45^{\circ} - 30^{\circ}) = \frac{\sqrt{6} + \sqrt{2}}{4},$ we get r = $\left(\frac{\sqrt{6} + \sqrt{2}}{4}\right) \cdot 4\sqrt{3} = 3\sqrt{2} + \sqrt{6} \Rightarrow \boxed{D}.$
## See Also
