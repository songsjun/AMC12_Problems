# 2015 AMC 12B Problem 24

## Problem
Four circles, no two of which are congruent, have centers at A, B, C, and D, and points P and Q lie on all four circles. The radius of circle A is $\tfrac{5}{8}$ times the radius of circle B, and the radius of circle C is $\tfrac{5}{8}$ times the radius of circle D. Furthermore, AB = CD = 39 and PQ = 48. Let R be the midpoint of $\overline{PQ}.$ What is $\overline{AR}+\overline{BR}+\overline{CR}+\overline{DR}$ ?

$\textbf{(A)}\; 180 \qquad\textbf{(B)}\; 184 \qquad\textbf{(C)}\; 188 \qquad\textbf{(D)}\; 192\qquad\textbf{(E)}\; 196$
## Solution
First, note that PQ lies on the radical axis of any of the pairs of circles. Suppose that $O_1$ and $O_2$ are the centers of two circles $C_1$ and $C_2$ that intersect exactly at P and Q, with $O_1$ and $O_2$ lying on the same side of PQ, and $O_1O_2=39. Let x=O_1 R, y=O_2$ R, and suppose that the radius of circle $C_1$ is r and the radius of circle $C_2$ is $\tfrac{5}{8}$r.

Then the power of point R with respect to $C_1$ is

$$(r+x)(r-x) = r^2 - x^2 = 24^2$$

and the power of point R with respect to $C_2$ is


$$\left(\frac{5}{8}r + y\right) \left(\frac{5}{8}r - y\right) = \frac{25}{64}r^2 - y^2 = 24^2.$$


Also, note that x-$y=39$.

Subtract the above two equations to find that $\tfrac{39}{64}r^2 - x^2 + y^2 = 0$ or 39 $r^2 =64(x^2-y^2)$. As x-$y=39$, we find that $r^2=64(x+y)=64(2y+39)$. Plug this into an earlier equation to find that $25(2y+39)$-y^2=24^2. This is a quadratic equation with solutions $y=\tfrac{50 \pm 64}{2},$ and as y is a length, it is positive, hence $y=57$, and $x=y+39=96$. This is the only possibility if the two centers lie on the same side of their radical axis.

On the other hand, if they lie on opposite sides, then it is clear that there is only one possibility, and then it is clear that $O_1 R + O_2 R = O_1O_2 = 39$. Therefore, we obtain exactly four possible centers, and the sum of the desired lengths is $57+96+39 =\boxed{\textbf{(D)}\; 192}.$
## Solution 2
Note that if a circle passes through a pair of points, the center of the circle is on the perpendicular bisector of the line segment between the pair of points. This means that A, B, C, and D are all on the perpendicular bisector of PQ. Let us say the distance from A to the line PQ is some a. Therefore, the distance from B to the line PQ is $\sqrt{(\frac{8}{5}\sqrt{a^2 + 24^2})^2 - 24^2},$ which comes out to be $\sqrt{\frac{64}{25}a^2 + \frac{39}{25}\cdot 576}.$ Since AB = 39, we have one of $\sqrt{\frac{64}{25}a^2 + \frac{39}{25}\cdot 576} \pm$ a to be equal to 39. We can solve both equations to get that out of the four possible solutions, and only two are positive: 7 and 57. Note that since no two circles can be congruent, we need the radius of one of A or C to be 7 and the other to be 57. Plugging in to find the corresponding radii of B and D gives 32 and 96, and adding everything up gives $\boxed{\textbf{(D) }192}.$

*~hyxue*
## Solution 3
Let's start by drawing PQ. Because all circles contain P and Q, all the centers lie on the perpendicular bisector of PQ, and point R is on this bisector.

For all the circle radii to be different (there can't be two congruent circles), two centers are on the same side of PQ, and two are on the opposite side of PQ. For the latter two circles--call them A and B--AR+BR=39.

Let's consider the next case, where C and D lie on the same side. Construct right triangles from the picture, and use the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) (divide by 3 to negate big numbers). You will get that the distance from R to the closest circle center is 57. Therefore, the answer is $39+2\cdot57+39=\boxed{\textbf{(D) }192}.$
## Solution 4 (Pythagorean Theorem bash)
Since the radical axis PQ is perpendicular to the line connecting the center of the circles, we have that A, B, C, D, and R are collinear. WLOG, assume that A and B are on the same side of R and let AR=y and let BP=x so that AP=$\frac{5}{8}$x.

Then, using the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) on right triangles PBR and PAR,
$$(39+y)^2+24^2=x^2\qquad(1)$$
$y^2+24^2=\frac{25}{64}x^2\qquad(2)$ Subtracting the (2) from (1) gives $x^2=64(2y+39)\qquad(3)$
Substituting (3) into (2) gives $y^2-50y-399=0=(y-$57)(y+7)$$.  Taking the positive solution (y>0), y=AR=57 and BR=(57)+39=96.

Since none of the circles are congruent, C and D must be on the opposite side of R so CR+DR=CD=39. Hence, AR+BR+CR+DR=$57+96+39=\boxed{\textbf{(D) }192}.$
## Solution 5 (Fast)
Note that the four circles are coaxial, meaning A,B,C,D,R are all collinear. Let AR=x. By [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem), the radius of circle A squared would be
$$r_A^2 = x^2+24^2$$
and the radius of circle B squared would be
$$r_B^2 = (x+39)^2+24^2.$$
Since $r_A^2 =\dfrac{25}{64}r_B^2,$
$$x^2+24^2 = \dfrac{25}{64}((x+39)^2+24^2)$$
Solving this will give $x^2-50x-399 = 0$, or $x=57$, -7; AR = 57. The same equation will apply to CR; CR would be the other root: CR=7 (the negative 7 signals that C is the negative, or opposite, direction of D, about R). Thus, AR = 57, BR = $57+39 = $96, CR = 7, DR = $39-7 = 32$, implying
$$AR+BR+CR+DR = \boxed{\textbf{(D) }192}.$$

*~sml1809*
## See Also
