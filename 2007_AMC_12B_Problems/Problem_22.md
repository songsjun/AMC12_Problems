# 2007 AMC 12B Problem 22

## Problem
Two particles move along the edges of equilateral $\triangle ABC$ in the direction A$\Rightarrow B\Rightarrow C\Rightarrow A,$ starting simultaneously and moving at the same speed. One starts at A, and the other starts at the midpoint of $\overline{BC}.$ The midpoint of the line segment joining the two particles traces out a path that encloses a region R. What is the ratio of the area of R to the area of $\triangle ABC$?


$$\mathrm {(A)} \frac{1}{16}\qquad \mathrm {(B)} \frac{1}{12}\qquad \mathrm {(C)} \frac{1}{9}\qquad \mathrm {(D)} \frac{1}{6}\qquad \mathrm {(E)} \frac{1}{4}$$

## Solution 1
First, notice that each of the midpoints of AB,BC, and CA are on the locus.
Suppose after some time the particles have each been displaced by a short distance x, to new positions A' and M' respectively. Consider $\triangle ABM$ and drop a perpendicular from M' to hit AB at Y. Then, BA'=1-x and BM'=1/2+x. From here, we can use properties of a 30-60-90 triangle to determine the lengths YA' and YM' as monomials in x. Thus, the locus of the midpoint will be linear between each of the three special points mentioned above. It follows that the locus consists of the only triangle with those three points as vertices. (A cheaper way to find the shape of the region is to look at the answer choices: if it were any sort of conic section then the ratio would not generally be rational.)
Comparing inradii between this "midpoint" triangle and the original triangle, the area contained by R must be $\textbf{(A)} \frac{1}{16}$ of the total area.
## Solution 2
[WLOG](https://artofproblemsolving.com/wiki/index.php/WLOG), let point A be located on the origin. Let side $\overline{AB}$ be on the x-axis, and let point B be (0, 1).
When one of the ants is on a vertex, the other will be on the midpoint of the opposite side. Marking these points gives us a rough view of what seem to be the vertices of a smaller equilateral triangle, that is concentric with the larger one. After observing(or imagining) the ants moving, we find that the area enclosed is indeed an equilateral triangle.

Let the midpoint of $\overline{BC}$ be D. Then we can find the coordinates of D using the equations of two lines: the extension of $\overline{AD}$ and the extension of $\overline{BC}.$ The slope of any line is simply the tangent of the angle between the line and the x-axis. The angle between $\overline{AD}$ and the x-axis is $30^{\circ}$, and tan(30) = $\frac{\sqrt{3}}{3}.$

Therefore the equation of the line containing $\overline{AD}$ is $y=\frac{\sqrt{3}}{3}$x.

The slope of the line containing $\overline{BC}$ is $-\sqrt{3},$ and it goes through the point (1, 0). After solving for the y-intercept, we get y = $-\sqrt{3}x+\sqrt{3}.$ Setting these equal to each other yields

$$D\left(\frac{3}{4}, \frac{\sqrt{3}}{4}\right).$$

The midpoint of D and the A is the bottom-left vertex of the smaller equilateral triangle. Using the [distance formula](https://artofproblemsolving.com/wiki/index.php/distance_formula), we get the point

$$\left(\frac{3}{8}, \frac{\sqrt{3}}{8}\right).$$

Since the smaller triangle is simply a dilation of the larger one, they both have an axis of symmetry over $x=\frac{1}{2}.$ This yields the bottom-right vertex of the smaller triangle as

$$\left(\frac{5}{8}, \frac{\sqrt{3}}{8}\right).$$

Therefore the side length of the smaller triangle is $\frac{1}{4}.$ The problem asks us for the ratio of the areas, and since area is two-dimensional, we simply square the ratio to get $\frac{1}{16} \Rightarrow \boxed{\text{A}}.$
## See Also
