# 2003 AMC 12A Problem 11

## Problem 11
A square and an equilateral triangle have the same perimeter. Let A be the area of the circle circumscribed about the square and B the area of the circle circumscribed around the triangle. Find A/B.


$$\mathrm{(A) \ } \frac{9}{16}\qquad \mathrm{(B) \ } \frac{3}{4}\qquad \mathrm{(C) \ } \frac{27}{32}\qquad \mathrm{(D) \ } \frac{3\sqrt{6}}{8}\qquad \mathrm{(E) \ } 1$$

## Solution
Suppose that the common perimeter is P. Then the side lengths of the square and the triangle are $\frac{P}{4}$ and $\frac{P}{3},$ respectively.

The circle circumscribed about the square has a diameter equal to the diagonal of the square, which is therefore $\frac{P}{4} \cdot \sqrt{2} = \frac{P\sqrt{2}}{4},$ and so its radius is $\frac{\left(\frac{P\sqrt{2}}{4}\right)}{2} = \frac{P\sqrt{2}}{8}.$ Hence the area of the circle is A = $\pi\left(\frac{P\sqrt{2}}{8}\right)^2 = \pi \cdot \frac{2P^2}{64} = \frac{\pi P^2}{32}.$

Now consider the circle circumscribed around the equilateral triangle. By symmetry, its center must be the same as that of the triangle, so its radius is simply the distance from the center of the triangle to a vertex. Recalling that the centroid of any triangle divides its medians in the ratio 2:1, and that the medians of an equilateral triangle are the same as its altitudes, we deduce that the radius is $\frac{2}{3}$ of the total length of an altitude. Since the side length of this triangle is $\frac{P}{3},$ the length of an altitude is $\frac{P}{3}\sin\left(60^{\circ}\right) = \frac{P}{3} \cdot \frac{\sqrt{3}}{2} = \frac{P\sqrt{3}}{6},$ so finally the radius is $\frac{2}{3} \cdot \frac{P\sqrt{3}}{6} = \frac{P\sqrt{3}}{9},$
and thus the area of this circle is B = $\pi\left(\frac{P\sqrt{3}}{9}\right)^2 = \pi \cdot \frac{3P^2}{81} = \frac{\pi P^2}{27}.$

This gives $\frac{A}{B}=\frac{\left(\frac{\pi P^2}{32}\right)}{\left(\frac{\pi P^2}{27}\right)} = \frac{\pi P^2}{32} \cdot \frac{27}{\pi P^2}= \boxed{\mathrm{(C) \ } \frac{27}{32}}.$
## See Also
