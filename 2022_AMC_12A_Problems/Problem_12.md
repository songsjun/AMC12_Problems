# 2022 AMC 12A Problem 12

## Problem
Let M be the midpoint of $\overline{AB}$ in regular tetrahedron ABCD. What is $\cos(\angle CMD)$?

$\textbf{(A) } \frac14 \qquad \textbf{(B) } \frac13 \qquad \textbf{(C) } \frac25 \qquad \textbf{(D) } \frac12 \qquad \textbf{(E) } \frac{\sqrt{3}}{2}$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); import graph3; import solids; triple A, B, C, D, M; A = (2/3*sqrt(3)*Cos(90),2/3*sqrt(3)*Sin(90),0); B = (2/3*sqrt(3)*Cos(210),2/3*sqrt(3)*Sin(210),0); D = (2/3*sqrt(3)*Cos(330),2/3*sqrt(3)*Sin(330),0); C = (0,0,2/3*sqrt(6)); M = midpoint(A--B); currentprojection=orthographic((-2,0,1)); draw(A--B--D); draw(A--D,dashed); draw(C--A^^C--B^^C--D); draw(C--M,red); draw(M--D,red+dashed); dot("$A$",A,A-D,linewidth(5)); dot("$B$",B,B-A,linewidth(5)); dot("$C$",C,C-M,linewidth(5)); dot("$D$",D,D-A,linewidth(5)); dot("$M$",M,M-C,linewidth(5));
```

*~MRENTHUSIASM*
## Solution 1 (Right Triangles)
Without loss of generality, let the edge-length of ABCD be 2. It follows that MC=MD=$\sqrt3.$

Let O be the center of $\triangle ABD,$ so $\overline{CO}$\perp$\overline{MOD}.$ Note that MO=$\frac13 MD=\frac{\sqrt{3}}{3}.$

In right $\triangle CMO,$ we have $\cos(\angle CMD)=\frac{MO}{MC}=\boxed{\textbf{(B) } \frac13}.$
*~MRENTHUSIASM*
## Solution 2 (Law of Cosines)
Without loss of generality, let the edge-length of ABCD be 2. It follows that CM=DM=$\sqrt3.$

By the Law of Cosines, $\cos(\angle CMD) = \frac{CM^2 + DM^2 - CD^2}{2(CM)(DM)} = \boxed{\textbf{(B) } \frac13}.$
*~jamesl123456*
## Solution 3 (Double Angle Identities)
As done above, let the edge-length equal 2 (usually better than 1 because we can avoid fractions when dropping altitudes). Notice that the triangle stated in the question has two side-lengths that are the altitudes of two equilateral triangles. By dropping the equilateral triangles' altitude and using $30^{\circ}-60^{\circ}-90^{\circ}$ properties, we find that the other two sides are equal to $\sqrt{3}.$ Now by dropping the main triangle's altitude, we see it equals $\sqrt{2}$ from the Pythagorean Theorem. we can use the Double Angle Identities for Cosine. Doing this, we obtain $\cos(\angle CMD) = \frac{2}{3} - \frac13 = \boxed{\textbf{(B) } \frac13}.$
*~Misclicked*
## Solution 4 (Vector Methods)
Without loss of generality, let tetrahedron ABCD lie in three-dimensional space with vertices
A(-1, 1, 1), B(1, 1, -1), C(1, -1, 1), and D(-1, -1, -1).
Let point M be located at (0, 1, 0).


$$
\vec{MD} = \langle -1, -2, -1 \rangle
\vec{MC} = \langle 1, -2, 1 \rangle
$$


We know that the dot product of two vectors equals the product of their magnitudes multiplied by the cosine of the angle between them:

$$\vec{MD} \cdot \vec{MC} = (-1)(1) + (-2)(-2) + (-1)(1) = -1 + 4 - 1 = 2$$

Compute the magnitudes:


$$
||\vec{MD}|| = \sqrt{(-1)^2 + (-2)^2 + (-1)^2} = \sqrt{1 + 4 + 1} = \sqrt{6}
||\vec{MC}|| = \sqrt{(1)^2 + (-2)^2 + (1)^2} = \sqrt{1 + 4 + 1} = \sqrt{6}
$$


Then:

 $\vec{MD} \cdot \vec{MC} =$ ||$\vec{MD}$|| $\cdot$ ||$\vec{MC}$|| $\cdot \cos(\angle CMD)$

 2 = $\sqrt{6} \cdot \sqrt{6} \cdot \cos(\angle CMD) = 6 \cos(\angle CMD)$

Finally: $\cos(\angle CMD) = \frac{2}{6} = \boxed{\textbf{(B) } \frac13}.$
*~TylerTrikowsky*
## Video Solution 1 (Quick and Simple)
https://youtu.be/wKfL1hYJCaE

*~Education, the Study of Everything*
## Video Solution 1 (Smart and Simple)
https://youtu.be/7yAh4MtJ8a8?si=9uWHOngb2PTMRpg8&t=2423

*~Math-X*
## See Also
