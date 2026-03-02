# 2017 AMC 12B Problem 23

## Problem
The graph of y=f(x), where f(x) is a polynomial of degree 3, contains points A(2,4), B(3,9), and C(4,16). Lines AB, AC, and BC intersect the graph again at points D, E, and F, respectively, and the sum of the x-coordinates of D, E, and F is 24. What is f(0)?

$\textbf{(A)}\quad {-2} \qquad \qquad \textbf{(B)}\quad 0 \qquad\qquad \textbf{(C)}\quad 2 \qquad\qquad \textbf{(D)}\quad \dfrac{24}5 \qquad\qquad\textbf{(E)}\quad 8$
## Solution 1
Note that $f(x) - x^2$ has roots 2, 3, and 4. Therefore, we may write $f(x) = a(x-2)(x-3)(x-4) +x^2. Now$ we find that lines AB, AC, and BC are defined by the equations $y =5x - 6, y= 6x-8$, and y=7$x-12$ respectively.

Since we want to find the x-coordinates of the intersections of these lines and f(x), we set each of them to f(x) and synthetically divide by the solutions we already know exist.

In the case of line AB, we may write a$(x-2)(x-3)(x-4)+x^2-5x+6 = a(x-2)(x-3)(x-r_1$) for some real number $r_1$. Dividing both sides by $(x-2)(x-3)$ gives a$(x-4)+1 = a(x-r_1)$ or $r_1=\frac$ {$4a-1$}{a}.

For line AC, we have a$(x-2)(x-3)(x-4)+x^2-6x+8 = a(x-2)(x-4)(x-r_2$) for some real number $r_2$, which gives a$(x-3)+1 = a(x-r_2)$ or $r_2=\frac$ {$3a-1$}{a}.

For line BC, we have a$(x-2)(x-3)(x-4)+x^2-7x+12 = a(x-3)(x-4)(x-r_3$) for some real number $r_3$, which gives a$(x-2)+1 = a(x-r_3)$ or $r_3=\frac$ {$2a-1$}{a}.

Since $r_1+r_2 + r_3 = 24$, we have  $\frac$ {4a-1}{a} + $\frac$ {3a-1}{a} + $\frac$ {$2a-1$}{a} = 24 or  $\frac$ {$9a-3$}{a} = 24. Solving for a gives a = - $\frac{1}{5}.$

Substituting this back into the original equation, we get f(x) = $-\frac{1}{5}(x-2)(x-3)(x-4) +x^2,$ and f(0) = $-\frac{1}{5}(-2)(-3)(-4) + 0 = \boxed{\textbf{(D)}\frac{24}{5}}$

Solution by vedadehhc
## Solution 2
No need to find the equations for the lines, really. First of all, $f(x) = a(x-2)(x-3)(x-4) +x^2.$ Let's say the line AB is y=bx+c, and $x_1$ is the x coordinate of the third intersection, then 2, 3, and $x_1$ are the three roots of f(x) - bx-c. The values of b and c have no effect on the sum of the 3 roots, because the coefficient of the $x^2$ term is always -9$a+1$. So we have
$$\frac{9a-1}{a} = 2 + 3 + x_1= 3 + 4 + x_2 = 2 + 4 + x_3$$
Adding all three equations up, we get
$$3\left(\frac{9a-1}{a}\right) = 18 + x_1 + x_2 + x_3 = 18 + 24$$
Solving this equation, we get a = $-\frac{1}{5}.$ We finish as Solution 1 does.
$$\boxed{\textbf{(D)}\frac{24}{5}}.$$

- Mathdummy

Cleaned up by SSding
## Solution 3
Map every point (x,y) to (x, y - x^2). Note that the x-coordinates do not change. Under this map, A goes to (2,0), B goes to (3, 0) and C goes to (4,0). The cubic through A, B, and C remains a cubic, while the lines between two points turn into quadratics. Finally, note that the intersection points of the lines and the cubic have the same x-coordinates as the intersection points of the quadratics and the cubic after applying the mapping. The cubic under this new coordinate plane has equation k$(x-2)(x-3)(x-4)$. The quadratic through A and B is c$(x-2)(x-3)$. Note that c$(x-2)(x-3)+ x^2$ must be a line, so c = -1 to cancel out the squared terms. The intersection of the quadratic and cubic is solved by
$$-(x-2)(x-3) = k(x-2)(x-3)(x-4) \implies x = 4 - \frac{1}{k}$$
Similarly, the other x-coordinates are 3 - $\frac{1}{k}$ and 2 - $\frac{1}{k}.$ Summing, we have
$$9 - \frac{3}{k} = 24 \implies k = -\frac{1}{5}$$
We have f(x) = $-\frac{1}{5} (x-2)(x-3)(x-4) +x^2$ so f(0) = 2 $\cdot 3 \cdot 4/5 =\boxed{\textbf{(D)}\frac{24}{5}}.$

If the mapping is too complicated, this solution is equivalent to realizing that the line AB has the equation $y = x^2 -$ (x-2)(x-3)$$ and solving for the intersection points.

~[https://artofproblemsolving.com/wiki/index.php/User:Crazyvideogamez CrazyVideoGamez]
## Solution 4 (Mindless Vieta's Theorem)
Since f(x) is a third degree polynomial, let $f(x)=ax^3+bx^2+cx+d.$ We want to solve for d.

Notice that the 3 solutions to $f(x)=x^2$ are 2, 3, 4. Hence the polynomial $ax^3+(b-1)x^2+cx+d$ has roots 2, 3, 4. By Vieta's theorem we get $-\frac{d}{a}=24.$ It's not hard to get that AB, AC, and BC are given by the equations $y =5x - 6, y= 6x-8$, and y=7$x-12$ respectively. The 3 solutions to $f(x)=5x-6$ are 2, 3, $x_D$. Like before, using Vieta's theorem we get $-\frac{d+6}{a}=6$x_D. Similarly we get $-\frac{d+8}{a}=8$x_E and $-\frac{d+12}{a}=12$x_F.

At this point we have 5 unknowns: a, d, $x_D$, $x_E$, $x_F$, and 5 equations:

$$
\begin{align}
& -\frac{d}{a}=24\\
\\
& -\frac{d+6}{a}=6x_D\\
\\
& -\frac{d+8}{a}=8x_E\\
\\
&-\frac{d+12}{a}=12x_F\\
\\
&x_D+x_E+x_F=24
\end{align}
$$


The specific structure of this system of equations allows it to be solved with relatively ease. Solving, we get $d=\frac{24}{5}$

*~tsun26*
## See Also
