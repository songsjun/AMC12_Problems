# 2009 AMC 12A Problem 19

## Problem
Andrea inscribed a circle inside a regular pentagon, circumscribed a circle around the pentagon, and calculated the area of the region between the two circles.  Bethany did the same with a regular heptagon (7 sides).  The areas of the two regions were A and B, respectively.  Each polygon had a side length of 2.  Which of the following is true?

$\textbf{(A)}\ A = \frac {25}{49}B\qquad \textbf{(B)}\ A = \frac {5}{7}B\qquad \textbf{(C)}\ A = B\qquad \textbf{(D)}\ A  = \frac {7}{5}B\qquad \textbf{(E)}\ A = \frac {49}{25}B$
## Solution
In any regular polygon with side length 2, consider the isosceles triangle formed by the center of the polygon S and two consecutive vertices X and Y. We are given that XY=2. Obviously SX=SY=r, where r is the radius of the circumcircle. Let T be the midpoint of XY. Then XT=TY=1, and TS=$\rho,$ where $\rho$ is the radius of the incircle.

Applying the [Pythagorean theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_theorem) on the triangle STX, we get that $\rho^2 + 1 =r^2.$

Then the area between the circumcircle and the incircle can be computed as $\pir^2 -\pi \rho^2 = \pir^2 -\pi (r^2 - 1) = \pi.$

Hence A=$\pi, B=\pi,$ and therefore $\boxed{\textbf{(C) }A=B}.$
## Solution 2 (Applying Basic Trig)
Similar to the first solution, consider the isosceles triangle formed by each polygon.  If you drop an altitude to the side of each polygon, you get in both polygons a right triangle with base of 1.  For both the pentagon and heptagon, the hypotenuse of these right triangles is the radii of the larger circles and the apothems (the altitude we dropped to the side of each polygon) are the radii of the smaller circles.

Label the apothem of the pentagon $A_{1}$ and the apothem of the heptagon $A_{2}$.  Label the hypotenuse in the pentagon $H_{1}$ and the hypotenuse in the heptagon $H_{2}$.

Now, finding the angles in the triangles and applying trig functions to find these radii, we get the following:

$$A_{1} = \cot 36^\circ$$

$$A_{2} = \cot \frac {180}{7}^\circ$$

$$H_{1} = \csc 36^\circ$$

$$H_{2} = \csc \frac {180}{7}^\circ$$

Now, the areas in between the circles are:

$\text{Pentagon circles} = \pi((\csc 36^\circ)^2 - (\cot 36^\circ)^2)$

$\text{Heptagon circles} = \pi((\csc \frac{180}{7}^\circ)^2 - (\cot \frac{180}{7}^\circ)^2)$

Note the trig identity ($\cot\theta)^2 +1 = (\csc\theta)^2,$ from which we can easily get that ($\csc\theta)^2 - (\cot\theta)^2 = 1$

Thus, the area between the circles in both the heptagon and the pentagon are equivalent to $\pi,$ and therefore the answer is $\boxed{\textbf{(C) }A=B}.$
## Solution 3
Note that the answer choices all include powers of 5 and 7. This indicates that the answer must depend on the number of sides the two shapes have.

For simplicity, we solve the same problem with triangle and square instead of pentagon and heptagon. For the triangle setup, A = $\left(\frac{2}{\sqrt{3}}\right)^2 \cdot \pi - \left(\frac{1}{\sqrt{3}}\right)^2 \cdot \pi = \pi.$ For the square setup, B = $\left(\sqrt{2}\right)^2 \cdot \pi - \left(1\right)^2 \cdot \pi = \pi.$

Since A = B for the triangle-square case, it should be the same for the pentagon-heptagon case. Therefore, we choose $\boxed{\textbf{(C) } A=B }.$

*~sirswagger21*
## See Also
