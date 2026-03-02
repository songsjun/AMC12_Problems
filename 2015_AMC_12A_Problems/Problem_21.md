# 2015 AMC 12A Problem 21

## Problem
A circle of radius r passes through both foci of, and exactly four points on, the ellipse with equation $x^2+16y^2=16$. The set of all possible values of r is an interval [a,b). What is a+b?

$\textbf{(A)}\ 5\sqrt{2}+4\qquad\textbf{(B)}\ \sqrt{17}+7\qquad\textbf{(C)}\ 6\sqrt{2}+3\qquad\textbf{(D)}\ \sqrt{15}+8\qquad\textbf{(E)}\ 12$
## Solution 1
We can graph the ellipse by seeing that the center is (0, 0) and finding the ellipse's intercepts. The points where the ellipse intersects the coordinate axes are (0, 1), (0, -1), (4, 0), and (-4, 0). Recall that the two foci lie on the major axis of the ellipse and are a distance of c away from the center of the ellipse, where $c^2 = a^2 - b^2,$ with a being half the length of the major (longer) axis and b being half the minor (shorter) axis of the ellipse. We have that $c^2 = 4^2 - 1^2 \impliesc^2 = 15 \implies$ c = $\pm \sqrt{15}.$ Hence, the coordinates of both of our foci are ($\sqrt{15}, 0)$ and ($-\sqrt{15}, 0).$ In order for a circle to pass through both of these foci, we must have that the center of this circle lies on the y-axis.

The minimum possible value of r belongs to the circle whose diameter's endpoints are the foci of this ellipse, so a = $\sqrt{15}.$ The value for b is achieved when the circle passes through the foci and only three points on the ellipse, which is possible when the circle touches (0, 1) or (0, -1). Which point we use does not change what value of b is attained, so we use (0, -1). Here, we must find the point (0, y) such that the distance from (0, y) to both foci and (0, -1) is the same. Now, we have the two following equations. ($\sqrt{15})^2 + (y)^2 =b^2 y + 1 = b\implies$ y = b - 1 Substituting for y, we have that $15 + (b - 1)^2 = $b^2 $\implies -2$b + 16 = 0.

Solving the above simply yields that $b = 8$, so our answer is a + $b =\sqrt{15} + 8 \textbf{ (D)}.$
## Solution 2
As above, we can show that the foci of the ellipse are ($\sqrt{15},0), (-\sqrt{15},0).$

To obtain the lower bound, note that the smallest circle is when the diameter is on the line segment formed by the two foci. We can check that this indeed passes through four points on the ellipse since $\sqrt{15}>1,$ so $a=\sqrt{15}.$

To get the upper bound, note that the circle must go through either (0,1) or (0,-1). WLOG, let let the circle go through (0,1). We know that the circle must go through the foci of the ellipse ($\sqrt{15},0), (-\sqrt{15},0),$ So we can apply power of a point to find the diameter. Let x denote the length of the line segment from the origin to the lower point on the circle. Note that x lies on the diameter. Then by POP, we have
x $\cdot 1 = \sqrt{15} \cdot \sqrt{15},$ yielding $x=15$, and so the radius of the circle is (15+1)/2=8, so $b=8$.
Thus $a+b=\sqrt{15}+8 \textbf{ (D)}.$

*~ccx09 (Roy Boy Apple Short Long)*
## Solution 3 (Bound a Circle)
The foci are at ($\pm\sqrt{15}, 0). A$ circle that goes through these points is centered at (0,n). Then, the radius is $\sqrt{n^2+15},$ so the circle is in the form $x^2+(y-n)^2=n^2+15. WLOG,$ assume n is positive. For the circle to hit the ellipse four times, $\sqrt{n^2+15}>$n+1 ($n+1$ being the distance between the circle's center and the farthest end of the ellipse that lies on the y-axis). Both sides are evidently positive, so we can square both sides, leaving $n^2+15>n^2+2n+1\implies$ n<7. The function for the radius $\sqrt{n^2+15}$ is always increasing as n increases right of $n=0$ and as n decreases left of $n=0$. So the minimum of the radius is $a=\sqrt{0^2+15}=\sqrt{15}$ and the maximum is less than $\sqrt{7^2+15}=8.$ Thus, $\sqrt{15}+8 \implies \textbf{(D)}.$

*~BJHHar*
## Solution 4 (Partial, If running out of time)
Note, this is not a full solution but can be used if one is running out of time.

As above, the minimum radius of the circle is $\sqrt{15}$ which is the a value. The only answer that contains $\sqrt{15}$ is $\boxed{\textbf{(D)} \sqrt{15}+8}$
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2015amc12a/394

*~dolphin7*
## See Also
