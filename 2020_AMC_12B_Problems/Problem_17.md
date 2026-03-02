# 2020 AMC 12B Problem 17

## Problem
How many polynomials of the form $x^5 + ax^4 + bx^3 + cx^2 + dx + 2020,$ where a, b, c, and d are real numbers, have the property that whenever r is a root, so is $\frac{-1+i\sqrt{3}}{2} \cdot$ r? (Note that $i=\sqrt{-1})$

$\textbf{(A) } 0 \qquad \textbf{(B) }1 \qquad \textbf{(C) } 2 \qquad \textbf{(D) } 3 \qquad \textbf{(E) } 4$
## Solution 1
Let $P(x) = x^5+ax^4+bx^3+cx^2+dx+2020.$ We first notice that $\frac{-1+i\sqrt{3}}{2} =e^{2\pi i / 3}$.  That is because of Euler's Formula : $e^{ix}=\cos(x) +$ i $\cdot \sin(x). \frac{-1+i\sqrt{3}}{2} = -\frac{1}{2} +$ i $\cdot \frac$ {$\sqrt{3}$}{2} = $\cos(120^\circ) +$ i $\cdot \sin(120^\circ) =e^{ 2\pi i / 3}$.

In order r to be a root of P, $re^{2\pi i / 3}$ must also be a root of P, meaning that 3 of the roots of P must be r, $re^{i\frac{2\pi}{3}}$, $re^{i\frac{4\pi}{3}}$. However, since P is degree 5, there must be two additional roots. Let one of these roots be w, if w is a root, then $we^{2\pi i / 3}$ and $we^{4\pi i / 3}$ must also be roots. However, P is a fifth degree polynomial, and can therefore only have 5 roots. This implies that w is either r, $re^{2\pi i / 3}$, or $re^{4\pi i / 3}$. Thus we know that the polynomial P can be written in the form $(x-r)^m(x-re^{2\pi i / 3})^n(x-re^{4\pi i / 3}$)^p. Moreover, by Vieta's, we know that there is only one possible value for the magnitude of r as ||r||^$5 = 2020,$ meaning that the amount of possible polynomials P is equivalent to the possible sets (m,n,p). In order for the coefficients of the polynomial to all be real, n = p due to $re^{2\pi i / 3}$ and $re^{4 \pi i / 3}$ being conjugates and since m+n+$p = 5$, (as the polynomial is 5th degree) we have two possible solutions for (m, n, p) which are (1,2,2) and (3,1,1) yielding two possible polynomials. The answer is thus $\boxed{\textbf{(C) } 2}.$

*~Murtagh*
## Solution 2
Let $x_1$=r, then x_$2=\frac{-1+i\sqrt{3}}{2}$ r, x_$3=\left( \frac{-1+i\sqrt{3}}{2} \right) ^2r =\left( \frac{-1-i\sqrt{3}}{2} \right)$ r, x_$4=\left( \frac{-1+i\sqrt{3}}{2} \right) ^3$ r=r, which means $x_4$ is the same as $x_1$.

Now we have 3 different roots of the polynomial, $x_1, x_2$, and $x_3$. Next, we will prove that all 5 roots of the polynomial must be chosen from those 3 roots. Let us assume that there is one root $x_4$=p which is different from the three roots we already know, then there must be two other roots, x_$5=\left( \frac{-1+i\sqrt{3}}{2} \right) ^2p =\left( \frac{-1-i\sqrt{3}}{2} \right)$ p, x_$6=\left( \frac{-1+i\sqrt{3}}{2} \right) ^3$ p=p, different from all known roots. We get 6 different roots for the polynomial, which contradicts the limit of 5 roots. Therefore the assumption of a different root is wrong, thus the roots must be chosen from $x_1, x_2$, and $x_3$.

The polynomial then can be expressed as $f(x)=(x-x_1)^m (x-x_2)^n (x-x_3)^q,$ where m, n, and q are non-negative integers and m+n+$q=5$. Since a, b, c and d are real numbers, then n must be equal to q. By Vieta's we have mr + n($\frac{-1+i\sqrt{3}}{2}) +$ q($\frac{-1-i\sqrt{3}}{2}) =$ a real number. Therefore (m,n,q) can only be (1,2,2) or (3,1,1), so the answer is $\boxed{\mathbf{(C)} 2}.$

*~Yelong_Li, grogg007 added the part with vieta's*
## Solution 3
Call $\frac{-1+\sqrt{3}}{2}=q.$ We have r, qr, and $q^2r$ having to be roots, and since $q^3=1,$ we must choose 2 more roots out of these three such that the condition that a, b, c, and d are all real. There are \fbox{2} ways to do this because of the fundamental theorem of algebra, these being $\left(qr,qr^2\right)$ and $\left(r,r\right)$ because to satisfy FTA if z is a root then so must its conjugate.

*~joeythetoey*
## Solution 4 (Similar but using visualization)
> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; draw(Circle((0,0),10)); draw((0,0)--(-5,8.6602540378),red); draw((0,0)--(10,0),red); draw((0,0)--(-5,-8.6602540378),red);
```


Due to Euler's Formula, $\frac{-1+i\sqrt3}2$ is a 120 degree rotation CCW; therefore, the problem stipulates that a root must be followed by a root rotated 120 degrees CCW, and that the rotated root must also have yet another root 240 degrees CCW. Therefore, all roots must come similar groups of 3. We cannot have 6 roots from 2 groups, and we cannot have 0 roots, so the 3 distinct roots, when drawn (with 2 with multiplicities not shown), must look like the figure above.

As for the magnitudes of the roots, as all roots pictured above have the same magnitude, there is 1 possible magnitude for each root, which is $\sqrt$[5]{2020}, meaning we don't have to care about the scale of the diagram.

To satisfy the complex conjugate root theorem (that if the coefficients are real, any root of a+bi must have a root of a-bi), the figure depicting all 5 roots must be symmetrical across the horizontal axis. Without consideration for roots with multiplicities, there are 3 axes of symmetry for this shape, and two unique ways to align one of the axes of symmetry such that it's parallel to the horizontal axis, the other such case created by reflecting across the vertical axis.

However, not only must the magnitudes multiply to 2020, but the product of the roots must be *positive* 2020. Only one of the above cases can satisfy this condition (If there exists a configuration that multiplies to -2020, then reflecting across the vertical axis flips the sign creating the +2020 case, with the converse also being true. As each case guarantees the existence of the other, and while at least one case is guaranteed to exist in the first place, we know there is exactly 1 of each case that remain, with 1 prevailing +2020 case to use.

Now, when taking roots with multiplicities back into consideration, the singular case has 2 ways to assign multiplicities while preserving symmetry: either both collating to the horizontal root, or through one being distributed to each of the angled roots (This corresponds to the (2,2,1) and (3,1,1) cases discussed earlier).

Therefore, the final answer is $\boxed{\mathbf{(C)} 2}.$
## Video Solution by MistyMathMusic
https://www.youtube.com/watch?v=8V5l5jeQjNg
## See Also
