# 2019 AMC 12A Problem 5

> This problem is the same as [2019 AMC 10A #7](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #5](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
Two lines with slopes $\dfrac{1}{2}$ and $2$ intersect at $(2,2)$. What is the area of the triangle enclosed by these two lines and the line $x+y=10  ?$

$\textbf{(A) } 4 \qquad\textbf{(B) } 4\sqrt{2} \qquad\textbf{(C) } 6 \qquad\textbf{(D) } 8 \qquad\textbf{(E) } 6\sqrt{2}$
## Solution 1
Let's first work out the slope-intercept form of all three lines:
$(x,y)=(2,2)$ and $y=\frac{x}{2} + b$ implies $2=\frac{2}{2} +b=> 2=1+b$ so $b=1$, while $y=2x + c$ implies $2= 2 \cdot 2+c=> 2=4+c$ so $c=-2$. Also, $x+y=10$ implies $y=-x+10$. Thus the lines are $y=\frac{x}{2} +1, y=2x-2,$ and $y=-x+10$.
Now we find the intersection points between each of the lines with $y=-x+10$, which are $(6,4)$ and $(4,6)$. Using the distance formula and then the Pythagorean Theorem, we see that we have an isosceles triangle with base $\sqrt{2}$ and height $\sqrt{2}$, whose area is $\boxed{\textbf{(C) }6}$.
## Solution 3
Like in the other solutions, solve the systems of equations to see that the triangle's two other vertices are at $(4, 6)$ and $(6, 4)$. Then apply Heron's Formula: the semi-perimeter will be $s = \sqrt{2} + \sqrt{20}$, so the area reduces nicely to a difference of squares, making it $\boxed{\textbf{(C) }6}$.
## Solution 4
Like in the other solutions, we find, either using algebra or simply by drawing the lines on squared paper, that the three points of intersection are $(2, 2)$, (4, 6)$$, and $(6, 4)$. We can now draw the bounding square with vertices $(2, 2)$, (2, 6), (6, 6)$$ and $(6, 2)$, and deduce that the triangle's area is $\boxed{\textbf{(C) }6}$.
## Solution 5
Like in other solutions, we find that the three points of intersection are  $(2, 2)$, (4, 6)$$, and $(6, 4)$. Using graph paper, we can see that this triangle has $6$ boundary lattice points and $4$ interior lattice points. By Pick's Theorem, the area is $\frac62 + 4 - 1 = \boxed{\textbf{(C) }6}$.
## Solution 6
Like in other solutions, we find the three points of intersection. Label these $A (2, 2)$, $B (4, 6)$, and $C (6, 4)$. By the Pythagorean Theorem, $AB = AC = \sqrt5$ and $BC = \sqrt2$. By the Law of Cosines,


$$\cos A = \frac{(2\sqrt5)^2 + (2\sqrt5)^2 - (2\sqrt2)^2}{2 \cdot 2\sqrt5 \cdot 2\sqrt5} = \frac{20 + 20 - 8}{40} = \frac{32}{40} = \frac45$$


Therefore, $\sin A = \sqrt{1 - \cos^2 A} = \frac35$, so the area is $\frac12 bc \sin A = \frac12 \cdot 2\sqrt5 \cdot 2\sqrt5 \cdot \frac35 = \boxed{\textbf{(C) }6}$.
## Solution 7
Like in other solutions, we find that the three points of intersection are  $(2, 2)$, $(4, 6)$, and $(6, 4)$. The area of the triangle is half the absolute value of the determinant of the matrix determined by these points.


$$\frac12\begin{Vmatrix}
2&2&1\\
4&6&1\\
6&4&1\\
$\end{Vmatrix} = \frac1$2|-12| = $\frac12 \cdot 12 = \boxed{\textbf{(C) }6}$$$
## Solution 8
Like in other solutions, we find the three points of intersection. Label these $A (2, 2)$, $B (4, 6)$, and $C (6, 4)$. Then vectors $\overrightarrow{AB} = \langle 2, 4 \rangle$ and $\overrightarrow{AC} = \langle 4, 2 \rangle$. The area of the triangle is half the magnitude of the cross product of these two vectors.


$$\frac12\begin{Vmatrix}
i&j&k\\
2&4&0\\
4&2&0\\
$\end{Vmatrix} = \frac1$2|-12k| = $\frac12 \cdot 12 = \boxed{\textbf{(C) }6}$$$
## Solution 9
Like in other solutions, we find that the three points of intersection are $(2, 2)$, (4, 6)$$, and $(6, 4)$. By the Pythagorean theorem, this is an isosceles triangle with base $\sqrt2$ and equal length $\sqrt5$. The area of an isosceles triangle with base $b$ and equal length $l$ is $\frac{b\sqrt{4l^2-b^2}}{4}$. Plugging  in $b = \sqrt2$ and $l = \sqrt5$,


$$\frac{2\sqrt2 \cdot \sqrt{80-8}}{4} = \frac{\sqrt{576}}{4} = \frac{24}{4} = \boxed{\textbf{(C) }6}$$
## Solution 10 (Trig)
Like in other solutions, we find the three points of intersection. Label these $A (2, 2)$, $B (4, 6)$, and $C (6, 4)$. By the Pythagorean Theorem, $AB = AC = \sqrt5$ and $BC = \sqrt2$. By the Law of Cosines,


$$\cos A = \frac{(2\sqrt5)^2 + (2\sqrt5)^2 - (2\sqrt2)^2}{2 \cdot 2\sqrt5 \cdot 2\sqrt5} = \frac{20 + 20 - 8}{40} = \frac{32}{40} = \frac45$$


Therefore, $\sin A = \sqrt{1 - \cos^2 A} = \frac35$. By the extended Law of Sines,


$$2R = \frac{a}{\sin A} = \frac{2\sqrt2}{\frac35} = \frac{10\sqrt2}{3}$$


$$R = \frac{5\sqrt2}{3}$$


Then the area is $\frac{abc}{4R} = \frac{2\sqrt2 \cdot 2\sqrt5^2}{4 \cdot \frac{5\sqrt2}{3}} = \boxed{\textbf{(C) }6}$.
## Solution 11
The area of a triangle formed by three lines,


$$a_1x + a_2y + a_3 = 0$$


$$b_1x + b_2y + b_3 = 0$$


$$c_1x + c_2y + c_3 = 0$$


is the absolute value of


$$\frac12 \cdot \frac{1}{(b_1c_2-b_2c_1)(a_1c_2-a_2c_1)(a_1b_2-a_2b_1)} \cdot \begin{vmatrix}
$a_$1&$a_$2&$a_3$\\
$b_$1&$b_$2&$b_3$\\
$c_$1&$c_$2&$c_3$\\
$\end{vmatrix}^2$$$


Plugging in the three lines,


$$-x + 2y - 2 = 0$$


$$-2x + y + 2 = 0$$


$$x + y - 10 = 0$$


the area is the absolute value of


$$\frac12 \cdot \frac{1}{(-2-1)(-1-2)(-1+4)} \cdot \begin{vmatrix}
-1&2&-2\\
-2&1&2\\
1&1&-10\\
$\end{vmatrix}^2 = \frac12 \cdot \frac{1}{27} \cdot 18^2 = \boxed{\textbf{(C) }6}$$$


Source: Orrick, Michael L. “THE AREA OF A TRIANGLE FORMED BY THREE LINES.” Pi Mu Epsilon Journal, vol. 7, no. 5, 1981, pp. 294–298. JSTOR, www.jstor.org/stable/24336991.
## Solution 12 (Heron's Formula)
Like in other solutions, we find that our triangle is isosceles with legs of $\sqrt5$ and base $\sqrt2$. Then, the semi - perimeter of our triangle is,

$$\frac{4\sqrt5+2\sqrt2}{2} = 2\sqrt5 + \sqrt2.$$

 Applying Heron's formula, we find that the area of this triangle is equivalent to

$$\sqrt{{(2\sqrt5+\sqrt2)}{(2\sqrt5-\sqrt2)}{(2)}} = \sqrt{{(20-2)}{(2)}} = \boxed{\textbf{(C) }6}.$$


*~rbcubed13*
## Solution 13
Like in the other solutions, we find that the three points of intersection are $(2, 2)$, $(4, 6)$, and $(6, 4)$. By the shoelace theorem, we have

$$\dfrac{1}{2} \left|(2*4 + 6*6 + 4*2) - (2*6 + 4*4 + 6*2) \right|$$

 Evaluating this we get our answer of $\boxed{\textbf{(C) }6}.$

*~tontongoated110*
## Video Solution 1
https://youtu.be/KWs9FpLSi5A

Education, the Study of Everything
## Video Solution 2
https://youtu.be/D5FEuT5ExmU

*~savannahsolver*
## See Also
