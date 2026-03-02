# 2018 AMC 12A Problem 10

> This problem is the same as [2018 AMC 10A #12](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_12) and [2018 AMC 12A #10](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_10).
## Problem
How many ordered pairs of real numbers $(x,y)$ satisfy the following system of equations?


$$\begin{align*}
$x+3$y&=3 \\
$$\big||x|-|y|\big|&=1$$
$\end{align*}$$$


$\textbf{(A) } 1 \qquad
$\textbf{(B) } 2 \qquad$
$\textbf{(C) } 3 \qquad$
$\textbf{(D) } 4 \qquad$
$\textbf{(E) } 8$$
## Solution 1
We can solve this by graphing the equations. The second equation looks challenging to graph, but start by graphing it in the first quadrant only (which is easy since the inner absolute value signs can be ignored), then simply reflect that graph into the other quadrants.

The graph looks something like this:
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((-3,0)--(3,0), Arrows);
draw((0,-3)--(0,3), Arrows);
draw((2,3)--(0,1)--(-2,3), blue);
draw((-3,2)--(-1,0)--(-3,-2), blue);
draw((-2,-3)--(0,-1)--(2,-3), blue);
draw((3,-2)--(1,0)--(3,2), blue);
draw((-3,2)--(3,0), red);
dot((-3,2));
dot((3/2,1/2));
dot((0,1));
```

</asy>
Now, it becomes clear that there are $\boxed{\textbf{(C) } 3}$ intersection points.

(not the author)(the lines in the first quadrant are $y=x+1$ and $y=x-1$ and we reflect them into all quadrants as all instances of variables are in a context where flipping the sign does not affect the overall expression)
## Solution 2
$x+3y=3$ can be rewritten to $x=3-3y$. Substituting $3-3y$ for $x$ in the second equation will give $||3-3y|-y|=1$. Splitting this question into casework for the ranges of $y$ will give us the total number of solutions.

$\textbf{Case 1:}y>1$:
$3-3y$ will be negative so $|3-3y| = 3y-3.$
$|3y-3-y| = |2y-3| = 1$
    Subcase 1: $y>\frac{3}{2}$
$2y-3$ is positive so $2y-3 = 1$ and $y = 2$ and $x = 3-3(2) = -3$
    Subcase 2: $1<y<\frac{3}{2}$
$2y-3$ is negative so $|2y-3| = 3-2y = 1$. $2y = 2$ and so there are no solutions ($y$ can't equal to $1$)

$\textbf{Case 2:}y = 1$:
It is fairly clear that $x = 0.$

$\textbf{Case 3:}y<1$:
$3-3y$ will be positive so $|3-3y-y| = |3-4y| = 1$
    Subcase 1: $y>\frac{3}{4}$
$3-4y$ will be negative so $4y-3 = 1\rightarrow4y = 4$. We already have this solution from Case 2 as $y = 1$.
    Subcase 2: $y<\frac{3}{4}$
$3-4y$ will be positive so $3-4y = 1\rightarrow4y = 2$. $y = \frac{1}{2}$ and $x = \frac{3}{2}$.
Thus, the solutions are: $(-3,2), (0,1), \left(\frac{3}{2},\frac{1}{2} \right)$, and the answer is $\boxed{\textbf{(C) } 3}$.
## Solution 3 (Straightforward Casework)
Note that $||x| - |y||$ can take on one of four values where $x$ and $y$ are: $x + y$ (positive, positive), $x - y$ (positive, negative), $-x + y$ (negative, positive), $-x -y$ (negative, negative). So we have 4 cases which we solve by cancellation with the two equations from the problem:

**Case 1: ||x| - |y|| = x+y  **


$$x+3y=3$$


$$x+y=1$$


Subtracting:

$2y=2 \Rightarrow y=1$ and $x=0$.

$\text{Result: } (0,1)$


**Case 2: ||x| - |y|| = x-y**


$$x+3y=3$$


$$x-y=1$$


Subtacting:

$4y=2 \Rightarrow y=\dfrac{1}{2}$ an $x=\dfrac{3}{2}$.

$\text{Result: } \left(\dfrac{3}{2},\dfrac{1}{2}\right)$


**Case 3: ||x| - |y|| = -x+y**


$$x+3y=3$$


$$-x+y=1$$


Adding:

$4y=4 \Rightarrow y=1$ and $x=0$.


$\text{Result: } (0,1)$. Since this is the same solution as we got in Case 1, we can not count this (otherwise, we would have overcounted).


**Case 4: ||x| - |y|| = -x-y**


$$x+3y=3$$


$$-x-y=1$$


Adding:

$2y=4 \Rightarrow y=2$ and $x=-3$.


$\text{Result: } (-3,2)$.


**Answer**

We solved each case by elimination (either adding the two equations or subtracting), to obtain three solutions: $(0, 1)$, (-3,2), $\left(\dfrac{3}{2}, \dfrac{1}{2}\right)$.

Our answer is $\boxed{\textbf{(C) } 3}$.


**Contributors**

*~trumpeter*

*~ccx09*

*~mXxHalo711*

*~BakedPotato66*

~<B+
## Solution 4
Just as in solution $2$, we derive the equation $||3-3y|-|y||=1$. If we remove the absolute values, the equation collapses into four different possible values. $3-$2y, $3-$4y, $2y-3$, and $4y-3$, each equal to either $1$ or $-1$. Remember that if $P-Q=a$, then $Q-P=-a$. Because we have already taken $1$ and $-1$ into account, we can eliminate one of the conjugates of each pair, namely $3-2y$ and $2y-3$, and $3-4y$ and $4y-3$. Find the values of $y$ when $3-2y=$1, $3-2y=-$1, $3-4y=1$ and $3-4y=-1$. We see that $3-2y=1$ and $3-4y=-1$ give us the same value for $y$, so the answer is $\boxed{\textbf{(C) } 3}$

*~Zeric Hang*
## Solution 5
Just as in solution $2$, we derive the equation $x=3-3y$. Squaring both sides in the second equation gives $x^2+y^2-2|xy|=1$. Putting $x=3-3y$ and doing a little calculation gives $10y^2-18y+9-2|3y-3y^2|=1$. From here we know that $3y-3y^2$ is either positive or negative.

When positive, we get $2y^2-3y+1=0$ and then, $y=1/2$ or $y=1$.
When negative, we get $y^2-3y+2=0$ and then, $y=2$ or $y=1$. Clearly, there are $3$ different pairs of values and that gives us $\boxed{\textbf{(C) } 3}$

*~OlutosinNGA*
## Video Solution 1
https://youtu.be/o63EtwelFp0

*~savannahsolver*
## Video Solution 2
https://www.youtube.com/watch?v=llMgyOkjNgU&ab_channel=TheBeautyofMath
## See Also
