# 2024 AMC 12A Problem 24

## Problem
A $\textit{disphenoid}$ is a tetrahedron whose triangular faces are congruent to one another. What is the least total surface area of a disphenoid whose faces are scalene triangles with integer side lengths?

$\textbf{(A) }\sqrt{3}\qquad\textbf{(B) }3\sqrt{15}\qquad\textbf{(C) }15\qquad\textbf{(D) }15\sqrt{7}\qquad\textbf{(E) }24\sqrt{6}$
## Solution 1 (Definition of disphenoid)
Notice that any scalene $\textit{acute}$ triangle can be the faces of a $\textit{disphenoid}. ($See proof in Solution 2.)

As a result, we simply have to find the smallest area a scalene acute triangle with integer side lengths can take on. This occurs with a 4,5,6 triangle (notice that if you decrease the value of any of the sides the resulting triangle will either be isosceles, degenerate, or non-acute). For this triangle, the semiperimeter is $\frac{15}{2},$ so by Heron’s Formula:


$$
\begin{align*}
A&=\sqrt{\frac{15}{2}\cdot\frac{7}{2}\cdot\frac{5}{2}\cdot\frac{3}{2}}\\
&=\sqrt{\frac{15^2\cdot7}{16}}\\
&=\frac{15}{4}\sqrt{7}
\end{align*}
$$


The surface area is simply four times the area of one of the triangles, or $\boxed{\textbf{(D) }15\sqrt{7}}.$

*~eevee9406*
## Solution 2 (Disphenoid in Box)
Let the side lengths of one face of the disphenoid be a, b, c. By the definition of a disphenoid with scalene faces, opposite sides must be the same length. Then the disphenoid can be constructed in a rectangular box with dimensions p, q, r such that a, b, c are the 3 different diagonal lengths of the faces of the box and no two sides are parallel (someone feel free to insert a diagram). Then we have the system


$$
p^2 + q^2 = a^2
p^2 + r^2 = b^2
q^2 + r^2 = c^2
$$


for positive integers a, b, c and positive p, q, r.

Solving for p, q, r, we have


$$
p^2 = \frac{a^2 + b^2 - c^2}{2}
q^2 = \frac{a^2 - b^2 + c^2}{2}
r^2 = \frac{-a^2 + b^2 + c^2}{2}
$$


(Notice that, by law of cosines (or by Pythagorean Inequality), these (parallelepiped box side lengths squared) p^2, q^2, r^2 each have the same sign as the cosine of the angle at a vertex of a triangular face of the disphenoid. Since they are squares and so non-negative, every angle is non-obtuse. Further, since they are squares of positive side lengths, every angle is acute. So a, b, c are the side lengths of an $\textit{acute}$ triangle.)

WLOG, let a < b < c.
For a<$4, a^2$ is less than or equal to the gap between squares greater than $a^2,$ so all such triangles are non-acute and fail.

The next smallest case works:  $4^2 +5^2 > 6^2$ so a, b, $c = 4$, 5, 6.

Using Heron's Formula, the minimum total surface area of the disphenoid is $\boxed{\textbf{(D) }15\sqrt{7}}.$

Bonus: by Heron’s Formula, the area of an $x-1, x, x+1$ triangle is x $\sqrt{3 (x-2)(x+2)}/4 = x \sqrt{3 (x^2-4)}/4$.

*~babyhamster*

(Acute triangle observations and bonus formula by oinava)
## Solution 3 (Volume formula)
Recall the formula for a disphenoid is $72V^2=(-a^2+b^2+c^2)(a^2-b^2+c^2)(a^2+b^2-c^2),$ where V is the volume and a,b,c are the sides of each face. Because 72V^2 is a positive number, (-a^2+b^2+c^2)(a^2-b^2+c^2)(a^2+b^2-c^2) must also be positive which is enough to rule out 2,3,4 and etc, leaving us with a 4-5-6 triangle for a surface area of $\boxed{\textbf{(D) }15\sqrt{7}}$

*~PaixiaoLover*
## Video Solution
[https://youtu.be/mlsBAql6URw?si=gSIWmdZzByO1OESo 2024 AMC 12 A #24]

[https://mathproblemsolvingskills.wordpress.com/ MathProblemSolvingSkills.com]
## See also
