# 2015 AMC 12A Problem 16

> This problem is the same as [2015 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2015_AMC_12A_Problems) and [2015 AMC 10A #21](https://artofproblemsolving.com/wiki/index.php/2015_AMC_10A_Problems).
## Problem
Tetrahedron $ABCD$ has $AB=5, AC=3, BC=4, BD=4, AD=3$, and $CD=\tfrac{12}5\sqrt2$.  What is the volume of the tetrahedron?

$\textbf{(A) }3\sqrt2\qquad\textbf{(B) }2\sqrt5\qquad\textbf{(C) }\dfrac{24}5\qquad\textbf{(D) }3\sqrt3\qquad\textbf{(E) }\dfrac{24}5\sqrt2$
## Solution 1
Drop altitudes of triangle $ABC$ and triangle $ABD$ down from $C$ and $D$, respectively. Both will hit the same point; let this point be $T$. Because both triangle $ABC$ and triangle $ABD$ are 3-4-5 triangles, $CT = DT = \dfrac{3\cdot4}{5} = \dfrac{12}{5}$. Because $CT^{2} + DT^{2} = \left(\frac{12}{5}\right)^{2} = \left(\frac{12}{5}\sqrt{2}\right)^{2} = CD^{2}$, it follows that the $CTD$ is a right triangle, meaning that $\angle CTD = 90^\circ$, and it follows that planes $ABC$ and $ABD$ are perpendicular to each other. Now, we can treat $ABC$ as the base of the tetrahedron and $TD$ as the height. Thus, the desired volume is

$$V = \dfrac{1}{3} bh = \dfrac{1}{3}\cdot[ABC]\cdot TD = \dfrac{1}{3} \cdot 6 \cdot \dfrac{12}{5} = \dfrac{24}{5}$$

 which is answer $\boxed{\textbf{(C) } \dfrac{24}{5}}$
## Solution 2
Let the midpoint of $CD$ be $E$. We have $CE = \dfrac{6}{5} \sqrt{2}$, and so by the Pythagorean Theorem $AE = \dfrac{\sqrt{153}}{5}$ and BE $= \dfrac{\sqrt{328}}{5}$. Because the altitude from $A$ of tetrahedron $ABCD$ passes touches plane $BCD$ on $BE$, it is also an altitude of triangle $ABE$. The area $A$ of triangle $ABE$ is, by Heron's Formula, given by


$$16A^2 = 2a^2 b^2 + 2b^2 c^2 + 2c^2 a^2 - a^4 - b^4 - c^4 = -(a^2 + b^2 - c^2)^2 + 4a^2 b^2.$$


Substituting $a = AE, b = BE, c = 5$ and performing huge (but manageable) computations yield $A^2 = 18$, so $A = \sqrt{2}$. Thus, if $h$ is the length of the altitude from $A$ of the tetrahedron, BE $\cdot h = 2A = \sqrt{2}$. Our answer is thus


$$V = \dfrac{1}{3} Bh = \dfrac{1}{3} h \cdot BE \cdot \dfrac{6\sqrt{2}}{5} = \dfrac{24}{5},$$


and so our answer is $\boxed{\textbf{(C) } \dfrac{24}{5}}$
## Solution 3
Similar to solution 1, $\triangle CTD$ is an isosceles right triangle. $AB$ is perpendicular to the plane $CTD$. So, we can cut tetrahedron $ABCD$ into 2 tetrahedrons $ACTD$ and $BCTD$ with $\triangle CTD$ as their common base, $BT$ and $AT$ as their heights.


$[CTD]=\frac{1}{2} \cdot CT \cdot DT=\frac{1}{2} \cdot \frac{12}{5} \cdot \frac{12}{5}= \frac{72}{25}$

$V_{ABCD}=V_{ACDT}+V_{BCDT}=\frac{1}{3} \left([CTD] \cdot AT + [CTD] \cdot BT \right)=\frac{1}{3} \cdot [CTD] \cdot (AT+BT)=\frac{1}{3} \cdot [CTD] \cdot AB  =\frac{1}{3} \cdot \frac{72}{25} \cdot 5$

$= \boxed{\textbf{(C) } \dfrac{24}{5}}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 4 (Francesca's Irregular Tetrahedron Formula)
Note: Please don't ever try doing this in an actual competition. It's fun to do, however.

Using Piero della Francesca's Theorem:


$$V = \frac{1}{12} \left( \sqrt{-a^2b^2c^2 - a^2d^2e^2 - b^2d^2f^2 - c^2e^2f^2 + a^2c^2d^2 + b^2c^2d^2 + a^2b^2e^2 + b^2c^2e^2 + b^2d^2e^2 + c^2d^2e^2 + a^2b^2f^2 + a^2c^2f^2 + a^2d^2f^2 + c^2d^2f^2 + a^2e^2f^2 + b^2e^2f^2 - c^4d^2 - c^2d^4 - b^4e^2 - b^2e^4 - a^4f^2 - a^2f^4} \right)$$


Substituting this all in... You get
$\boxed{\textbf{(C) } \dfrac{24}{5}}$

*~Banspeedrun*
## Solution 5 (Coord Bash)
Set $B$ as $(0,0,0)$, $C$ at $(4,0,0)$, and $A$ at $(4,3,0)$. If we find $D$'s coordinates then the z-coordinate(the last coord) is the height we need since the rest of the coordinates have a z-coord of $0$. Notice that we are given every distance from point $D$, we can use basically satellite-type triangulation. $D$ is at every point a radius from points $A,B$ and $C$, or a sphere with the center at points $A,B$ and $C$. We can set up a system of equations to find where all 3 spheres intersect.


$$\begin{split}

$$
(x-4)^2+(y-3)^2+z^2 &=3^2 \\
x^2+y^2+z^2 &=4^2 \\
(x-4)^2+y^2+z^2 &=(\tfrac{12}{5}\sqrt2)^2
$$

$\end{split}$$$


Solving this system of equations gives you:


$$\begin{split}

$$
x &=\frac{64}{25} \\
y &=\frac{48}{25} \\
z &=\frac{12}{5}
$$

$\end{split}$$$


Since $z$ is the value we need, we can now solve for the volume. The base is just $\frac{3*4}{2}=6$


$$\begin{split}

$$
V &=\frac{1}{3}bh \\
V &=\frac{1}{3}(6)(\frac{12}{5}) \\
V &=\frac{72}{15} \\
V &=\boxed{\textbf{(C)}\dfrac{24}{5}}
$$

$\end{split}$$$
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=1J_P0tXszLQ
## Video Solution by TheBeautyofMath
https://www.youtube.com/watch?v=ckRtrNuNgk4

*~IceMatrix*
## See Also
