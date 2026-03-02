# 2025 AMC 12B Problem 25

## Problem
Three concentric circles have radii 1, 2, and 3. An equilateral triangle of side length s has one vertex on each circle. What is $s^{2}$?

$\textbf{(A)}~6 \qquad \textbf{(B)}~\frac{25}{4} \qquad \textbf{(C)}~\frac{13}{2} \qquad \textbf{(D)}~\frac{27}{4} \qquad \textbf{(E)}~7$
## Solution 1
Let $\triangle ABC$ and center O be such that OA=1, OB=2, OC=3. Suppose the length of the side of ABC is s. Noticing that OA + OB = OC, we suspect that OACB is a cyclic quadrilateral. If it was, we could apply Ptolemy's Theorem, which would say that

$$
CB \cdot OA + OB \cdot AC = OC \cdot AB
s + 2s = 3s.
$$

Because Ptolemy's is true, OACB is cyclic. Because it's cyclic,  $\angle AOB = 180 - \angle BCA = 120.$ Applying Law of Cosines on AOB, we get

$$
s^2 = 1^2 + 2^2 - 2 \cdot 1 \cdot 2 \cdot \cos{120}
s^2 = 1 + 4 +2 = \boxed{7}.
$$


*~lprado*
## Solution 2
Call the point that lies on the circle $r = 1$ as A, $r = 2$ as B and $r = 3$ as C.

We could set A = (1, 0), B = ($2\cos B, 2\sin B)$ and C = ($3\cos C, 3\sin C)$

$$s = BA = CB = CA.$$

$$BA = (2\cos B - 1)^2 + (2\sin B)^2 = 5 - 4\cos B$$

$$CA = (3\cos C - 1)^2 + (3\sin C)^2 = 10 - 6\cos C$$

$$CB = (3\cos C - 2\cos B)^2 + (3\sin C - 2\sin B)^2 = 13 - 12\cos(B - C)$$

Let $\cos B =$ x and $\cos C =$ y for easier representation

Because 5 - $4\cos B = 10 - 6\cos C,$ hence $x =\frac{6y-5}{4}$

Also, 5 - $4\cos B = 13 - 12\cos(B - C),$ which $12\cos(B - C) = 8 + 4\cos B = 8 + 4\cdot\frac{6y-5}{4} = 3 + 6$y, leading to $\cos(B - C) = \frac{1+2y}{4}$

Noting that $\cos(B - C) =$ xy + $\sqrt{1-x^{2}}\sqrt{1-y^{2}} = \frac{1+2y}{4}$
$$1 - x^2 = 1 - (\frac{6y-5}{4})^2 = \frac{-36y^2 + 60y - 9}{16}$$

let K= $\sqrt{1-x^{2}}\sqrt{1-y^{2}},$ which the equation xy + $\sqrt{1-x^{2}}\sqrt{1-y^{2}} = \frac{1+2y}{4}$ can be simplified to $\frac{y(6y-5)}{4} + K = \frac{1+2y}{4}$

By rearranging, the equation $\frac{y(6y-5)}{4} + K = \frac{1+2y}{4}$ turns into K = $\frac{-6y^2 + 7y + 1}{4}$

Squaring both sides, which $K^2 = (1 - x^2)(1 - y^2) =\frac{(-6y^2 + 7y + 1)^2}{16}$
Substituting in 1 - $x^2 =\frac{-36y^2 + 60y - 9}{16},$ we get (-$6y^2+7y + 1)^2 = (-36y^2+60y - 9)(1 - y^2)$

By expanding, LHS = $36y^4-84y^3 + 37y^2+14y + 1$ and RHS = $36y^4-60y^3 - 27y^2+60y - 9$

Rearrange it, we get $12y^3-32y^2 + 23y - 5 = 0$

By inspection (which y cant be greater than 1 because it is a cosine value), let’s try y = $\frac{1}{2}$: it is a root.

By polynomial division, this becomes $(2y - 1)(6y^2-13y + 5) = 0$

The other 2 solutions from the quadratic are $\frac{1}{2}$ and $\frac{5}{3} (g$reater than 1, rejected), meaning that the only y possible value is $\frac{1}{2}.$

Because length of CA = ($3\cos C - 1)^2 + (3\sin C)^2 = 10 - 6\cos C,$ hence the answer is 10 - $6(1/2) = $10 - $3 =\boxed{\textbf{(E)} \ 7}.$

*~Mitsuihisashi14*
## Solution 3 (rotation)
Let A be a point on the circle with radius 1, B be a point on the circle with radius 2, C be a point on the circle with radius 3. Call the shared center for these three circles O. First let’s check if O is in $\triangle ABC.$
Rotate OA clockwise by $60^{\circ}$ to OA’, then it is equivalent to check if point A’ is outside $\triangle ABC.$
Assume that A’ is outside $\triangle ABC,$ easy to prove that $\triangle AOC$\cong $\triangle AA$’B. Therefore OC=A’B=3, in $\triangle OA$’B,
OA’+OB=$1+2=3$=A’B
This violates the triangle inequality. Thus A’ must be inside $\triangle ABC$ in order to let the shape make sense.
Easy to prove $\triangle AOB$\cong $\triangle AA$’C, therefore A’C=2. And by rotation OA’=1. Also notice that OC=3, which means OA’+A’C=OC, this means O, A’, C must be collinear. Since $\angle AOA$’=$\angle AA$’O=$60^{\circ}$, $\angle AA$’C=$120^{\circ}$, then use Law of Cosines in $\triangle AA$’C:

$$s^{2}=AC^{2}=1^{2}+2^{2}-2\cdot 1\cdot{2}\cdot\cos 120^{\circ}=\boxed{\textbf{(E)} \ 7}$$

*~Augustusgao*
## Solution 4
Let A be a point on the circle with radius 1, B be a point on the circle with radius 2, C be a point on the circle with radius 3. Call the shared center for these three circles O. First let’s check if O is in $\triangle ABC.$
Rotate OA clockwise by $60^{\circ}$ to OA’, then it is equivalent to check if point A’ is outside $\triangle ABC.$
Assume that A’ is outside $\triangle ABC,$ easy to prove that $\triangle AOC$\cong $\triangle AA$’B. Therefore OC=A’B=3, in $\triangle OA$’B,
OA’+OB=$1+2=3$=A’B
This violates the triangle inequality. Thus A’ must be inside $\triangle ABC$ in order to let the shape make sense.
Easy to prove $\triangle AOB$\cong $\triangle AA$’C, therefore A’C=2. And by rotation OA’=1. Also notice that OC=3, which means OA’+A’C=OC, this means O, A’, C must be collinear. Since $\angle AOA$’=$\angle AA$’O=$60^{\circ}$, $\angle AA$’C=$120^{\circ}$, then use Law of Cosines in $\triangle AA$’C:

$$s^{2}=AC^{2}=1^{2}+2^{2}-2\cdot 1\cdot{2}\cdot\cos 120^{\circ}=\boxed{\textbf{(E)} \ 7}$$

## Solution 5
Let O be the common center and let the vertices of the triangle A,B,C satisfy OA=1, OB=2, OC=3, with side length AB=BC=CA=s. Let $x=s^{2}$. Let $\alpha=\angle AOB, \beta=\angle BOC, \gamma=\angle COA,$ so $\alpha+\beta+\gamma=360^\circ.$ By the Law of Cosines,


$$
x = 1^2+2^2-2\cdot1\cdot2\cos\alpha = 5-4\cos\alpha \Rightarrow \cos\alpha = \frac{5-x}{4}
x = 2^2+3^2-2\cdot2\cdot3\cos\beta = 13-12\cos\beta \Rightarrow \cos\beta = \frac{13-x}{12}
x = 3^2+1^2-2\cdot3\cdot1\cos\gamma = 10-6\cos\gamma \Rightarrow \cos\gamma = \frac{10-x}{6}
$$


For angles summing to $360^\circ,$ we have

$$\cos^2\alpha+\cos^2\beta+\cos^2\gamma - 2\cos\alpha\cos\beta\cos\gamma = 1$$
Substitute $\cos\alpha,\cos\beta,\cos\gamma$ in terms of x and plug in answer choices (don't bother trying to solve it), we get x = $\boxed{7}.$

*~Raine999*
## Solution 6
Let $\omega_1$ be a circle of radius 1 centered at O=(0, 0). Let $\omega_2$ be a circle of radius 2 centered at (0, 0). Let A be the point (0, 3). Let B be some point on $\omega_1.$ Let C be some point in the plane such that ABC is equilateral. Our goal is to find some C that lies on $\omega_2.$

Because $\angle BAC=60^\circ$ and AB=AC, we see that C must be the rotation of B around A, either $60^\circ$ clockwise or counterclockwise. Note that because the locus of all points B is $\omega_1,$ the locus of all points C is the two circles formed by rotating $\omega_1 60^\circ$ around A, either direction.

We want a C that lies on $\omega_2,$ so we naturally intersect $\omega_2$ with one of these two circles (I chose the one that's rotated counterclockwise because the numbers are nicer). We could easily calculate the intersections using coord geo, but notice that the problem asks for a unique s; this means that the circle is tangent to $\omega_2.$ The tangent point, which is the only C that works, lies on the line connecting the centers. The center (denote it O') of (half of) C's locus is the center of $\omega_2$ rotated $60^\circ$ counterclockwise. Because AO=AO' and $\angle OAO$'=$60^\circ,$ we see $\triangle OAO$' is equilateral, meaning $\angle AOO$'=$\angle AOC=60^\circ,$ which means by extension that C is $30^\circ$ counterclockwise from the horizontal. OC=2 as C lies on $\omega_2,$ so the coordinates of C are at ($2\cos 30^\circ, 2\sin 30^\circ)=(\sqrt{3}, 1). A$ is at (0, 3), and a quick distance formula gives us $s^2=(C.x-A.x)^2+(C.y+A.y)^2=3+4=\boxed{7}.$
*~JoeyG*
## Video Solution 1 by OmegaLearn.org
https://youtu.be/6154vt0ob7A
## Video Solution 2 by SpreadThemATHlOVE
https://www.youtube.com/watch?v=e00IGB7NNF8
## See Also
