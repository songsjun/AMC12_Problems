# 2009 AMC 12B Problem 23

## Problem
A region S in the complex plane is defined by
$$S = \{x + iy: - 1\le x\le1, - 1\le y\le1\}.$$
A complex number z = x + iy is chosen uniformly at random from S. What is the probability that $\left(\frac34 + \frac34i\right)$z is also in S?

$\textbf{(A)}\ \frac12\qquad \textbf{(B)}\ \frac23\qquad \textbf{(C)}\ \frac34\qquad \textbf{(D)}\ \frac79\qquad \textbf{(E)}\ \frac78$
## Solution 1
First, turn $\frac34 + \frac34$i into polar form as $\frac{3\sqrt{2}}{4}e^{\frac{\pi}{4}i}$. Restated using geometric probabilities, we are trying to find the portion of a square enlarged by a factor of $\frac{3\sqrt{2}}{4}$ and rotated 45 degrees that lies within the original square. This skips all the absolute values required before. Finish with the symmetry method stated above.

*~asdf334*
## Solution 2
We multiply z and $\left(\frac{3}{4}+\frac{3}{4}i\right)$ to get $\left(\frac{3}{4}x-\frac{3}{4}y\right)+\left(\frac{3}{4}$xi+$\frac{3}{4}$yi$\right).$ Since we want to find the probability that this number is in S, we need the real and complex coefficients of this number to be less than or equal to 1 or greater than or equal to -1. This gives us the equations $-1\le \frac{3}{4}x-\frac{3}{4}$y $\le 1$ and $-1\le \frac{3}{4}x+\frac{3}{4}y\le 1.$ Now, we see that we can solve this by graphing. We can graph our barriers $-1\lex\le 1$ and $-1\ley\le 1$ to form a 2 by 2 square centered at the origin. Graphing our two equations gives us the four lines $x-y=\frac{4}{3},x-y=-\frac{4}{3},x+y=\frac{4}{3},x+y=-\frac{4}{3}.$ The square that is formed is the region that satisfies these four equations. Now, the barriers and this square gives us an octagon as the desired region. The area of this octagon is the total area of the square minus the 4 small triangles on each corner, each with $\frac{2}{9}$ area. Therefore, the octagon has area of $\frac{28}{9}.$ Finally, to find the probability of it working, we find the area of the octagon divided by the area of the entire square which is $\frac{\frac{28}{9}}{4}=\frac{7}{9}$ or $\boxed{D}.$

*~jeteagle*
## See Also
