# 2003 AMC 12B Problem 21

## Problem
An object moves 8 cm in a straight [line](https://artofproblemsolving.com/wiki/index.php/line) from A to B, turns at an angle $\alpha,$ measured in radians and chosen at random from the interval (0,$\pi),$ and moves 5 cm in a straight line to C. What is the [probability](https://artofproblemsolving.com/wiki/index.php/probability) that AC < 7?


$$\mathrm{(A)}\ \frac{1}{6} \qquad\mathrm{(B)}\ \frac{1}{5} \qquad\mathrm{(C)}\ \frac{1}{4} \qquad\mathrm{(D)}\ \frac{1}{3} \qquad\mathrm{(E)}\ \frac{1}{2}$$

## Solution 1 (Trigonometry)
By the [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines),

$$
\begin{align*} AB^2 + BC^2 - 2 AB \cdot BC \cos \alpha = 89 - 80 \cos \alpha = AC^2 &< 49\\ \cos \alpha &> \frac 12\\ \end{align*}
$$


It follows that 0 < $\alpha < \frac$ {$\pi$}3, and the probability is $\frac{\pi/3}{\pi} = \boxed{\textbf{(D) } \frac13 }.$
## Solution 2 (Analytic Geometry)
[center|500px](https://artofproblemsolving.com/wiki/index.php/File:2003AMC12BP21.png)

WLOG, let the object turn clockwise.

Let B = (0, 0), A = (0, -8).

Note that the possible points of C create a semi-circle of radius 5 and center B. The area where AC < 7 is enclosed by a circle of radius 7 and center A. The probability that AC < 7 is $\frac{\angle ABO}{180 ^\circ}.$

The function of \odot B is $x^2 + y^2 = 25,$ the function of \odot A is $x^2 +$ (y+8)^$2 = 49$.

O is the point that satisfies the system of equations: $\begin{cases}x^2 + y^2 = $25 \\ $x^2 + (y+8)^2 = $49 $\end{cases}$


$$x^2 + (y+8)^2 - x^2 - y^2 = 49 - 25, 64 + 16y =24, y = - \frac52, x = \frac{5 \sqrt{3}}{2}, O = (\frac{5 \sqrt{3}}{2}, - \frac52)$$


Note that $\triangle BDO$ is a 30-60-90 triangle, as BO = 5, BD = $\frac{5 \sqrt{3}}{2}, DO = \frac52.$ As a result $\angle CBO = 30 ^\circ, \angle ABO = 60 ^\circ.$

Therefore the probability that AC < 7 is $\frac{\angle ABO}{180 ^\circ} = \frac{60 ^\circ}{180 ^\circ} = \boxed{\textbf{(D) } \frac13 }$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 3 (Geometric Probability)
Setting A = (0,0) we get that B = (8,0), after assuming segment AB to be straight in the x-direction relative to our coordinate system (in other words, due to symmetrically we can set $x = 8$ for point B). This gives C = (8 + 5cos($\alpha), 5$sin($\alpha)).$ Using the distance formula we get sqrt((8 + 5cos($\alpha))^2 + (5$sin($\alpha))^2) < 7.$ After algebra, this simplifies to cos($\alpha) < -\frac{1}{2}.$ After evaluating the constraints of the problem, we land on option (D).

*~PeterDoesPhysics*
## Solution 4 (Triangle Inequality)
Note that we can treat $\text{ABC}$ as a triangle with side lengths 5, 8 and AC=x. Because 0 and $\pi$ are not part of the interval of valid $\alpha$ values, $\triangle \text{ABC}$ is a non-degenerate triangle. Then, by the Triangle Inequality, 5+8>x, 5+x>8, and 8+x>5. These reduce to x<13, x>3, and x>-3. Thus, the possible values of x are 3 or $x=\text{[}4,5,6,7,8,9,10,11,12\text{]}.$ Of these 9 possible x, 3 of them are less than 7, so the probability that x<7 is $\frac39=\frac13=\boxed{\text{(D)}}.$ ~~AndrewZhong2012~~
## See also
