# 2016 AMC 12A Problem 16

## Problem 16
The graphs of $y=\log_3 x, y=\log_x 3,y=\log_\frac{1}{3}$ x, and $y=\log_x \dfrac{1}{3}$ are plotted on the same set of axes. How many points in the plane with positive x-coordinates lie on two or more of the graphs?

$\textbf{(A)}\ 2\qquad\textbf{(B)}\ 3\qquad\textbf{(C)}\ 4\qquad\textbf{(D)}\ 5\qquad\textbf{(E)}\ 6$
## Solution
Setting the first two equations equal to each other, $\log_3x =\log_x 3.$

Solving this, we get $\left(3, 1\right)$ and $\left(\frac{1}{3}, -1\right).$

Similarly with the last two equations, we get $\left(3, -1\right)$ and $\left(\frac{1}{3}, 1\right).$

Now, by setting the first and third equations equal to each other, we get $\left(1, 0\right).$

Pairing the first and fourth or second and third equations won't work because then $\log$ x $\leq 0.$

Pairing the second and fourth equations will yield $x = 1$, but since you can't divide by $\log 1 = 0,$ it doesn't work.

After trying all pairs, we have a total of 5 solutions $\rightarrow \boxed{\textbf{(D)} 5}$
## Solution 2
Note that $\log_ba =\log_c$ a / $\log_c$ b.

Then $\log_ba =\log_a$ a / $\log_ab = 1/\log_a$ b

$$\log_\frac{1}{a} b = \log_a \frac{1}{a} / \log_a b = -1/ \log_a b$$

$$\log_\frac{1}{b} a = -\log_a b$$

Therefore, the system of equations can be simplified to:

$$y = t$$

$$y = -t$$

$$y = \frac{1}{t}$$

$$y = -\frac{1}{t}$$

where $t =\log_3$ x. Note that all values of t correspond to exactly one positive x value, so all (t,y) intersections will correspond to exactly one (x,y) intersection in the positive-x area.

Graphing this system of functions will generate a total of 5 solutions $\rightarrow \boxed{\textbf{(D)} 5}$
## See Also
