# 2007 AMC 12B Problem 14

> This problem is the same as [2007 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2007_AMC_12B_Problems) and [2007 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2007_AMC_10B_Problems).
## Problem
Point P is inside equilateral $\triangle ABC.$ Points Q, R, and S are the feet of the perpendiculars from P to $\overline{AB}, \overline{BC},$ and $\overline{CA},$ respectively. Given that PQ=1, PR=2, and PS=3, what is AB?


$$\mathrm{(A)}\ 4 \qquad \mathrm{(B)}\ 3\sqrt{3} \qquad \mathrm{(C)}\ 6 \qquad \mathrm{(D)}\ 4\sqrt{3} \qquad \mathrm{(E)}\ 9$$

## Solution 1
Drawing $\overline{PA}, \overline{PB},$ and $\overline{PC}, \triangle ABC$ is split into three smaller triangles. The altitudes of these triangles are given in the problem as PQ, PR, and PS.

Summing the areas of each of these triangles and equating it to the area of the entire triangle, we get:

$$\frac{s}{2} + \frac{2s}{2} + \frac{3s}{2} = \frac{s^2\sqrt{3}}{4}$$
where s is the length of a side of the equilateral triangle

$$s = \boxed{\mathrm{(D) \ } 4\sqrt{3}}$$

*Note - This is called [Viviani's Theorem](https://artofproblemsolving.com/wiki/index.php/Viviani's_Theorem).
## Solution 2
The 60 degree angles suggest constructing 30-60-90 triangles. As such, let the foot of the altitude from Q to $\overline{BC}$ be D. Also, since $\angle{PQD}=60,$ let the foot of the altitude from P to $\overline{QD}$ be E. Since $\triangle{QEP}$ is 30-60-90, and PQ=1, QE=$\frac{1}{2}.$ Also, since PR=2, DE=2. Thus, QD=$\frac{5}{2}.$ Once again, since $\triangle{QBD}$ is 30-60-90, QB=$\frac{5\sqrt{3}}{3}.$ Similar reasoning to $\overline{AQ}$ and summing the segments yields $\boxed{(D) 4\sqrt{3}}$
## Solution 3 (Viviani's Theorem)
According to Viviani's Theorem, in an equilateral triangle, the sum of the perpendicular distances from a point inside the triangle will equal the altitude of the triangle. Thus, the height of the triangle is 6.

Then we start to form a 30-60-90 triangle. By that, we divide $6/\sqrt{3} = 2\sqrt{3}$ then multiply 2, and we get an answer of $\boxed{(D) 4\sqrt{3}}$

*~ghfhgvghj10*
## See Also
