# 2025 AMC 12A Problem 17

## Problem
The polynomial (z + i)(z + $2i)(z + 3i$) + 10 has three roots in the complex plane, where $i =\sqrt{-1}.$ What is the area of the triangle formed by these three roots?

$\textbf{(A)}~6 \qquad \textbf{(B)}~8 \qquad \textbf{(C)}~10 \qquad \textbf{(D)}~12 \qquad \textbf{(E)}~14$
## Solution 1
Noticing the symmetry, we begin with a substitution: $w =z+2$i. We now have the polynomial (w-i)(w)(w+i)+10. Expanding, we get
$$w^3+w+10.$$
Using the Rational Root Theorem, we notice that -2 is a root of this polynomial. Upon dividing the polynomial by $w+2$, we get that
$$w^3+w+10 = (w+2)(w^2-2w+5).$$
Using the Quadratic Formula upon $w^2-2w+5$, we get that the other two roots are 1+$2i$ and 1-$2i$.

From here, notice that the area of the triangle formed by the roots of this polynomial will be equal to that of the original polynomial because the substitution only shifted the graph $2i$ up, not affecting the distances between each root.

Graphing the roots onto the complex plane, the vertical side of the triangle has length 4, with the altitude to that side having length 3. Therefore, the triangle has area $\frac{4 \cdot 3}{2} = \boxed{6}.$

*~lprado*
## Solution 2 (bash)
Expand the left hand side, and we get $x^3-11x+10+(6x^2-6$)i. We immediately see that $x=1$ is a root, so factor this out, and we get $x^2+(6i+1)x+(6i-10$). We put this into the quadratic formula, and we get the other two roots are $\frac{-6i-1 \pm \sqrt{5-12i}}{2}.$ Note that 5-$1$2i = (3-$2i)^2,$ hence we get $\frac{2-8i}{2} = 1-4$i and $\frac{-4i-4}{2} = -2-2$i are the other two roots. We convert into coordinates to get (1,-4), (1,0), and (-2,-2). Note that one of these lines is vertical ((1,-4) to (1,0)), so the area is the base (4) times the height (1-(-2)=3) over 2, aka $\boxed{6}.$

*~ScoutViolet*
## Solution 3 (Shoelace Theorem)
Similarly to Solution 1, we find that w can be -2, 1+$2i$, or 1-$2i$. Therefore the 3 solutions of z are -2-$2i$, 1, and 1-$4i$.

Now, taking the real parts to be the x-coordinates and the imaginary parts to be the y-coordinates, we can use the Shoelace Theorem to find that $area=\frac{1}{2}$|(-$2\cdot0+1\cdot(-4)+1\cdot(-2))-((-2)\cdot1+0\cdot1+(-4)\cdot(-2))$|=6

*~backtosq-1*
*~minor edit by 526*
## Video Solution 1 by OmegaLearn.org
https://youtu.be/WIkOFDf3Fr4
## Video Solution 2 by StressedPineapple
https://youtube.com/watch?v=NWBPm3lThH4&t=127s
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
