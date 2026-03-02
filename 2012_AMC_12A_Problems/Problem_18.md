# 2012 AMC 12A Problem 18

## Problem
Triangle ABC has AB=27, AC=26, and BC=25.  Let I be the intersection of the internal angle bisectors of $\triangle ABC.$  What is BI?

$\textbf{(A)}\ 15\qquad\textbf{(B)}\ 5+\sqrt{26}+3\sqrt{3}\qquad\textbf{(C)}\ 3\sqrt{26}\qquad\textbf{(D)}\ \frac{2}{3}\sqrt{546}\qquad\textbf{(E)}\ 9\sqrt{3}$
## Solution 1
Inscribe circle C of radius r inside triangle ABC so that it meets AB at Q, BC at R, and AC at S. Note that angle bisectors of triangle ABC are concurrent at the center O(also I) of circle C. Let x=QB, y=RC and z=AS. Note that BR=x, SC=y and AQ=z. Hence x+$z=27, x+y=25$, and z+$y=26$. Subtracting the last 2 equations we have x-z=-1 and adding this to the first equation we have $x=13$.

By Heron's formula for the area of a triangle we have that the area of triangle ABC is $\sqrt{39(14)(13)(12)}.$ On the other hand the area is given by (1/2)$2$5r+(1/2)$2$6r+(1/2)$27r$.  Then $39r=\sqrt{39(14)(13)(12)}$ so that $r^2=56.$

Since the radius of circle O is perpendicular to BC at R, we have by the pythagorean theorem $BO^2=BI^2=r^2+x^2=56+169=225$ so that BI=$\boxed{\textbf{(A) } 15}.$
## Solution 2
We can use mass points and Stewart's to solve this problem. Because we are looking at the Incenter we then label A with a mass of 25, B with 26, and C with 27. We also label where the angle bisectors intersect the opposite side A', B', and C' correspondingly. It follows then that point B' has mass 52. Which means that $\overline{BB'}$ is split into a 2:1 ratio. We can then use Stewart's to find $\overline{BB'}.$ So we have $25^2\frac{27}{2} + 27^2\frac{25}{2} = \frac{25 \cdot 26 \cdot 27}{4} + 26\overline{BB'}^2.$ Solving we get $\overline{BB'} = \frac{45}{2}.$ Plugging it in we get $\overline{BI} = 15.$ Therefore the answer is $\boxed{\textbf{(A) } 15}$

*~Solution by **arowaaron***
## Solution 3
We can use POP(Power of a point) to solve this problem. First, notice that the area of $\triangle ABC$ is $\sqrt{39(39 - 27)(39 - 26)(39 - 25)} = 78\sqrt{14}.$ Therefore, using the formula that sr = A, where s is the semi-perimeter and r is the length of the inradius, we find that $r =2\sqrt{14}.$

Draw radii to the three tangents, and let the tangent hitting BC be $T_1$, the tangent hitting AB be $T_2$, and the tangent hitting AC be $T_3$. Let BI = x. By the pythagorean theorem, we know that $BT_1=\sqrt{x^2 - 56}.$ By POP, we also know that $BT_2$ is also $\sqrt{x^2 - 56}.$ Because we know that BC = 25, we find that $CT_1 = 25-\sqrt{x^2 - 56}.$ We can rinse and repeat and find that $AT_2 = 26 - (25 - \sqrt{x^2 - 56}) = 1 + \sqrt{x^2 - 56}.$ We can find $AT_2$ by essentially coming in from the other way. Since AB = 27, we also know that $AT_3 = 27-\sqrt{x^2 - 56}.$ By POP, we know that $AT_2=AT_3$, so 1 + $\sqrt{x^2 - 56} = 27 - \sqrt{x^2 - 56}.$

Let $\sqrt{x^2 - 56} = A,$ for simplicity. We can change the equation into 1 + A = 27 - A, which we find A to be 13. Therefore, $\sqrt{x^2 - 56} = 13,$ which further implies that $x^2 - 56 = 169$. After simplifying, we find $x^2 = 225,$ so $x =\boxed{\textbf{(A) } 15}$

*~EricShi1685*
## See Also
