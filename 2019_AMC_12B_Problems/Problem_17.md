# 2019 AMC 12B Problem 17

## Problem
How many nonzero complex numbers z have the property that 0, z, and $z^3,$ when represented by points in the complex plane, are the three distinct vertices of an equilateral triangle?

$\textbf{(A) }0\qquad\textbf{(B) }1\qquad\textbf{(C) }2\qquad\textbf{(D) }4\qquad\textbf{(E) }\text{infinitely many}$
## Solution 1
Convert z and $z^3$ into modulus-argument (polar) form, giving $z=r\text{cis}(\theta)$ for some r and $\theta.$ Thus, by De Moivre's Theorem, $z^3=r^3\text{cis}(3\theta).$ Since the distance from 0 to z is r, and the triangle is equilateral, the distance from $0 to z^3$ must also be r, so $r^3=r,$ giving $r=1$. (We know r $\neq 0$ since the problem statement specifies that z must be nonzero.)

Now, to get from $z to z^3,$ which should be a rotation of $60^{\circ}$ if the triangle is equilateral, we multiply by $z^2 =\text{cis}(2\theta),$ again using De Moivre's Theorem and $r=1$. Thus we require $2\theta=\pm\frac{\pi}{3} + 2\pi$ k (where k can be any integer). If 0 < $\theta < \frac{\pi}{2},$ we must have $\theta=\frac{\pi}{6},$ while if $\frac{\pi}{2} \leq \theta < \pi,$ we must have $\theta = \frac{5\pi}{6}.$ Hence there are 2 values that work for 0 < $\theta < \pi.$ By symmetry, the interval $\pi \leq \theta < 2\pi$ will also give 2 solutions. The answer is thus 2 + $2 =\boxed{\textbf{(D) }4}.$

*Note*: Here's a graph showing how z and $z^3$ move as $\theta$ increases: https://www.desmos.com/calculator/xtnpzoqkgs.
## Solution 2 (Quick Look)
As before, $r=1$. Represent z in polar form. By De Moivre's Theorem, $z^3=\text{cis}(3\theta).$ To form an equilateral triangle, their difference in angle must be $\frac{\pi}{3},$ so
$\frac{\text{cis}(3\theta)}{\text{cis}(\theta)}=\text{cis}(2\theta)=\text{cis}(\pm\frac{\pi}{3})$
From the polar form of z, we know that $0\geq\theta\leq2\pi,$ so $\text{cis}(2\theta)$ cycles in a circle twice. By contrast, $\pm\frac{\pi}{3}$ represent 2 fixed, distinct points. Thus, $\text{cis}(2\theta)$ intersects these points twice each$\implies\boxed{\textbf{(D) }4}$

*Visual: https://www.desmos.com/calculator/rnpxzns0jn*

 To be more rigorous, you can find the 4 solutions. $\text{cis}(2\theta)$ cycles twice, so $2\theta=\pm\frac{\pi}{3}+2n\pi,$ where $n=0$,1. Then, $\theta=\frac{\pi}{6}, \frac{7\pi}{6}, \frac{5\pi}{6}, \frac{11\pi}{6}.$ Substitute those values into z and check that they are valid. $\implies\boxed{\textbf{(D) }4}$

(Solution by BJHHar)
## Solution 3
For the triangle to be equilateral, the vector from $z to z^3, i.e z^3 - z,$ must be a $60^{\circ}$ rotation of the vector from 0 to z, i.e. just z. Thus we must have

$\frac{(z^3-z)}{(z-0)}=\text{cis}{(\pi/3)} \text{ or } \text{cis}(5\pi/3)$

Simplifying gives
$z^2-1=\text{cis}(\pi/3) \text{ or }z^2-1=\text{cis}(5\pi/3)$
so
$z^2=1+$$\text{cis}(\pi/3) \text{ or }z^2=1+\text{cis}(5\pi/3)$

Since any nonzero complex number will have two square roots, each equation gives two solutions. Thus, as before, the total number of possible values of z is $\boxed{\textbf{(D) }4}.$
## Solution 4 (Quick and Easy)
Since the complex numbers 0,z, and $z^3$ form an equilateral triangle in the complex plane, we note that either $z^3$ is a 60 degrees counterclockwise rotation about the origin from z or z is a 60 degrees counterclockwise rotation about the origin from $z^3.$

Therefore, we note that either $z^3 = z\text{cis} 60^\circ{}$ or z $\text{cis}(-60^\circ{}) =z^3$

The first equation in z (meaning $z^3 = z\text{cis} 60^\circ{})$ gives us: $z^2 =$ cis $60^\circ{},$ which gives 2 solutions in z.

The second equation in z (which is z $\text{cis} (-60^\circ{}) =z^3)$ gives us $z^2 =\text{cis} (-60^\circ{}),$ which must give another 2 solutions in z.

Therefore, there are $\boxed{(D) 4}$ solutions for z. (Professor-Mom)

Note: The motivation for this method came from an older AIME problem, namely https://artofproblemsolving.com/wiki/index.php/1994_AIME_Problems/Problem_8.
## Solution 5
Let the $z =re^{i\theta}$, so $z^3 =r^3e^{3i\theta}$. To have an equilateral triangle, we must have |$z^3$| = |z|, so $r^3 = r,$ so $r= 1$.

Note that the angle between $z^3$ and z is $3\theta - \theta = 2\theta.$ Then, by the Law of Cosines,

$$|z^3 - z|^2 = |z|^2 + |z^3|^2 - 2|z||z^3|\cos 2\theta.$$

Since we have an equilateral triangle, it must be that |$z^3 - z$| =|z| = |$z^$3| = $r = 1$. Hence,

$$
1 = 2 - 2\cos 2\theta = 2 - 2(1-2\sin^2\theta) = 4\sin^2\theta,
\sin^2\theta = \frac{1}{4}
\sin\theta = \pm\frac{1}{2}
\theta = \pm\frac{\pi}{6}, \pm\frac{5\pi}{6}.
$$


These 4 values of $\theta$ correspond to $\boxed{(D)4}$ distinct values of z.
*~brainfertilzer*
## Solution 6 (Quick, rectangular form)
Let z = a + bi, where a and b are real numbers. Then, since 0, z, and $z^3$ are vertices of an equilateral triangle in the complex plane, expanding $z^3$ gives the following :
$$(a + bi)^3 = (a^3 - 3ab^2) + i(3a^2b - b^3)$$
Now, we let $z = z^3$ and equate real and complex parts. It then follows that :
$$a^3 - 3ab^2 = a, 3a^2b - b^3 = b$$
from which solving gives
$$a^2 - 3b^2 = 1 (1), 3a^2 - b^2 = 1 (2)$$
We find (1) = (2)
$$a^2 - 3b^2 = 3a^2 - b^2$$
and
$$a^2 = -b^2$$
Focusing on (1) then gives

$$
4a^2 = 1
a^2 = \frac{1}{4}
$$

Now, finding the square roots gives
$$a = \pm\frac{1}{2}, b = \pm\frac{i}{2}$$
And so there are $\boxed{(D)4}$ possible solutions.
*~elpianista227*

*~edited by DRA777*
## Video Solution
For those who prefer a video: https://www.youtube.com/watch?v=uBL80yd1ihc
## See Also
