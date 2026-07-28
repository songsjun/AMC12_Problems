# 2025 AMC 12A Problem 22

## Problem 22
Three real numbers are chosen independently and uniformly at random between 0 and 1. What is the probability that the greatest of these three numbers is greater than twice each of the other two numbers? In other words, if the chosen numbers are $a\geq b\geq c$, what is the probability that $a>2b$?

$\textbf{(A)}~\frac{1}{12}\qquad\textbf{(B)}~\frac19\qquad\textbf{(C)}~\frac18\qquad\textbf{(D)}~\frac16\qquad\textbf{(E)}~\frac14$

## Solution 1
First suppose a specified value, say $X$, is the greatest of the three choices and has value $x$. The other two values must both lie in the interval $[0,x/2)$, whose area is

$$
\left(\frac{x}{2}\right)^2.
$$

Thus the probability that $X$ is the greatest and is more than twice each other value is

$$
\int_0^1\left(\frac{x}{2}\right)^2\,dx
=\frac{1}{12}.
$$

Any of the three chosen values can be the greatest, and the three cases are disjoint except for ties, which have probability $0$. Therefore the desired probability is

$$
3\cdot\frac{1}{12}=\frac14.
$$

The answer is $\boxed{\textbf{(E)}\ \frac14}$.
## Solution 1.1 (same logic but faster)
Call the numbers x, y, and z for parity with the coordinate plane.

For simplicity, assume that x>y>z. This has a $\frac{1}{3!} = \frac{1}{6}$ chance of happening, so in the end we must remember to multiply our answer by 6.

From here, we can use geometric probability. All possible triples (x,y,z) lie in a unit cube centered at (0,0,0), which has a volume of 1. However, our desired region is where x>$2y>2z$. We can graph this and find that the desired triples lie in a right tetrahedron of sides 1, $\frac{1}{2},$ and $\frac{1}{2},$ Using $v =\frac{1}{6}$lwh, the volume of our desired region is $\frac{1}{6}(1)(\frac{1}{2})(\frac{1}{2}) = \frac{1}{24}.$ From this, we can see that the probability that we land in this region is $\frac{\frac{1}{24}}{1} = \frac{1}{24}.$

But remember that we still have to multiply our answer by 6, resulting in 6 $\times \frac{1}{24} = \boxed{\text{(E) } \frac{1}{4}}.$
*~mikeypoo5608*
## Solution 2 (Integration)
Consider the bounds of a, b, and c. We know that $a\geqb\geq$ c and $a\geq 2$b. For a to be in [0, 1], b must be in [0, 0.5]. As such, each of a, b, and c must be in the following intervals:

$$
\begin{align*}
1\geq &a\geq 2b, \\
0.5\geq &b\geq 0, \\
b\geq &c\geq 0.
\end{align*}
$$

Now, we can simply integrate over these bounds:

$$
\int_0^{1/2}\int_{2b}^1\int_0^b dc da db,
\int_0^{1/2}\int_{2b}^1 b da db,
\int_0^{1/2} b(1-2b) db,
\left[\frac{b^2}{2}-\frac{2b^3}{3}\right]_0^{1/2},
\frac{1}{24}.
$$

Since there are 6 equally likely permutations of a, b, and c, we multiply $6\cdot\frac{1}{24}$ to obtain our answer of $\boxed{\text{(E) } \frac{1}{4}}.$

Note that this is almost the same solution as Solution 1, where we find the volume of a similar polyhedron using a different method (except we do not need to visualize it). This method would remain effective even if the bounds were non-linear or if there were more than three variables.
## Solution 5
Consider three independent uniform random variables X, Y, Z on [0, 1]. The goal is to find the probability that the maximum value is greater than twice each of the other two values. Equivalently, if we order them as a $\geq$ b $\geq$ c, this is the probability that a > $2b$ (which implies a > $2c$ since b $\geq$ c).

Due to symmetry, compute the probability that X is the maximum and satisfies the condition, then multiply by 3. The condition simplifies to P(X > 2Y $\cap X > 2Z),$ as this ensures X is the maximum (almost surely).

The joint density is 1 over the unit cube. Thus,

$$
\begin{align*}
P(X > 2Y \cap X > 2Z) &= \int_0^1 \int_0^{x/2} \int_0^{x/2} \, dy \, dz \, dx \\
&= \int_0^1 \left(\frac{x}{2}\right)^2 \, dx \\
&= \int_0^1 \frac{x^2}{4} \, dx \\
&= \frac{1}{4} \cdot \frac{1}{3} \\
&= \frac{1}{12}.
\end{align*}The total probability is 3 \times \frac{1}{12} = \frac{1}{4}.
$$


Alternatively, using order statistics U < V < W with joint density 6 on 0 < u < v < w < 1,

$$
\begin{align*}
P(W > 2V) &= \int_0^{0.5} \int_{2v}^1 \int_0^v 6 \, du \, dw \, dv \\
&= 6 \int_0^{0.5} v (1 - 2v) \, dv \\
&= 6 \left[ \frac{v^2}{2} - \frac{2v^3}{3} \right]_0^{0.5} \\
&= 6 \times \dfrac{1}{24} \\
&= \dfrac{1}{4}.
\end{align*}
$$

No matter what entry points on this problem we choose, we can always get the correct answer: $\color{red}\boxed{\color{black}\text{(E) } \frac14}\color{black}$.

*~funkCCP*
## Solution 6
We have $a,b,c \sim U(0,1)$. Thus, if $a$ is the greatest, we must have $b,c < a/2$, which occurs with probability $a^2/4$. We integrate this over all $a$ (note the pdf of $U(0,1)$ is just $1$):

$$\int_0^1 \frac{a^2}{4} \, da=\left[\frac{a^3}{12}\right]_0^1=\frac{1}{12}$$

Since there are $3$ possibilities for the greatest among $a,b$, and $c$, we multiply this by $3$ to get $\cdot 1/12=\boxed{\text{(E) } \frac14}$

*~Jackson La Vallee*
## Video Solution 1 by OmegaLearn.org
https://youtu.be/XxVC6Hx2tIY
## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=8wNoOAqd5_o
