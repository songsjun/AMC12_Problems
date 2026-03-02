# 2002 AMC 12B Problem 25

## Problem
Let $f(x) = x^2+6x + 1$, and let R denote the [set](https://artofproblemsolving.com/wiki/index.php/set) of [point](https://artofproblemsolving.com/wiki/index.php/point)s (x,y) in the [coordinate plane](https://artofproblemsolving.com/wiki/index.php/coordinate_plane) such that
f(x) + f(y) $\le 0 \qquad \text{and} \qquad$ f(x)-f(y) $\le 0$
The area of R is closest to

$\textbf{(A) } 21 \qquad\textbf{(B)}\ 22 \qquad\textbf{(C)}\ 23 \qquad\textbf{(D)}\ 24 \qquad\textbf{(E)}\ 25$
## Solution 1
The first condition gives us that
$$x^2 + 6x + 1 + y^2 + 6y + 1 \le 0 \Longrightarrow (x+3)^2 + (y+3)^2 \le 16$$

which is a [circle](https://artofproblemsolving.com/wiki/index.php/circle) centered at (-3,-3) with [radius](https://artofproblemsolving.com/wiki/index.php/radius) 4. The second condition gives us that


$$x^2 + 6x + 1 - y^2 - 6y - 1 \le 0 \Longrightarrow (x^2 - y^2) + 6(x-y) \le 0 \Longrightarrow (x-y)(x+y+6) \le 0$$


Thus either

$$x - y \ge 0,\quad x+y+6 \le 0$$

or

$$x - y \le 0,\quad x+y+6 \ge 0$$

[center](https://artofproblemsolving.com/wiki/index.php/Image:2002_12B_AMC-25.png)

Each of those lines passes through (-3,-3) and has slope $\pm 1,$ as shown above. Therefore, the area of R is half of the area of the circle, which is $\frac{1}{2} (\pi \cdot 4^2) = 8\pi \approx \boxed{\textbf{(E) }25}.$
*~SHEN KISLAY KAI*
## Solution 2
Similar to Solution 1, we proceed to get the area of the circle satisfying f(x)+f(y) $\le 0,$ or 16 $\pi.$

Since f(x)-f(y) $\le 0 \implies$ f(x) $\le$ f(y), we have that by symmetry, if (x,y) is in R, then (y,x) is not, and vice versa. Therefore, the shaded part of the circle above the line y=x has the same area as the unshaded part below y=x, and the unshaded part above y=x has the same area as the shaded part below y=x. This means that exactly half the circle is shaded, allowing us to divide by two to get $\frac{16 \pi }{2} = 8\pi \approx \boxed{\textbf{(E) }25}.$ ~samrocksnature + ddot1 +Shen kislay kai
## Note
The equation  $\frac{(x-h)^2}{a^2} - \frac{(y-k)^2}{b^2} = 0 \hspace{1mm} \text{or} \hspace{1mm} \frac{(y-k)^2}{a^2} - \frac{(x-h)^2}{b^2} = 0$  is the equation of a degenerate hyperbola.
## See also
