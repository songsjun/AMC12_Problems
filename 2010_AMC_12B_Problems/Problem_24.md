# 2010 AMC 12B Problem 24

## Problem
The set of real numbers x for which

$$\dfrac{1}{x-2009}+\dfrac{1}{x-2010}+\dfrac{1}{x-2011}\ge1$$

is the union of intervals of the form a. What is the sum of the lengths of these intervals? $\textbf{(A)}$\ $\dfrac{1003}{335} \qquad \textbf{(B)}$\ $\dfrac{1004}{335} \qquad \textbf{(C)}$\ 3 $\qquad \textbf{(D)}$\ $\dfrac{403}{134} \qquad \textbf{(E)}$\ $\dfrac{202}{67}$
## Solution 1
Because the right side of the inequality is a horizontal line, the left side can be translated horizontally by any value and the intervals will remain the same. For simplicity of calculation, we will find the intervals where $\frac{1}{x+1}+\frac{1}{x}+\frac{1}{x-1}\ge1$ We shall say that f(x)=$\frac{1}{x+1}+\frac{1}{x}+\frac{1}{x-1}.$ f(x) has three vertical asymptotes at $x=\{-1,0,1\}$. As the sum of decreasing hyperbolas, the function is decreasing at all intervals. Values immediately to the left of each asymptote approach negative infinity, and values immediately to the right of each asymptote approach positive infinity. In addition, the function has a horizontal asymptote at $y=0$. The function intersects 1 at some point from x=-1 to $x=0$, and at some point from $x=0 to x=1$, and at some point to the right of $x=1$. The intervals where the function is greater than 1 are between the points where the function equals 1 and the vertical asymptotes. If p, q, and r are values of x where $f(x)=1$, then the sum of the lengths of the intervals is (p-(-1))+$(q-0)+(r-1)$=p+q+r. $\frac{1}{x+1}+\frac{1}{x}+\frac{1}{x-1}=1\implies$ x(x-1)$+(x-1)(x+1)+x(x+1)=x(x-1)(x+1)\impliesx^3-3x^2-x+1=0$ And now our job is simply to find the sum of the roots of $x^3-3x^2-x+1$. Using [Vieta's formulas](https://artofproblemsolving.com/wiki/index.php/Vieta's_formulas), we find this to be 3 $\Rightarrow\boxed{C}.$ *NOTE*': For the AMC, one may note that the transformed inequality should not yield solutions that involve big numbers like 67 or 134, and immediately choose C.
## Solution 2
As in the first solution, note that the expression can be translated into $\frac{1}{x+1}+\frac{1}{x}+\frac{1}{x-1}\ge1$ without affecting the interval lengths. This simplifies into $\frac{-x^3+3x^2+x-1}{(x)(x+1)(x-1)}\ge0,$ so $-x^3+3x^2+x-1\ge0.$ Each interval is (-1, a), (0, b), (1, c), where a, b, and c are the roots of $-x^3+3x^2+x-1=0$ so the total length is a+b+c, which is the sum of the roots, or $\boxed3.$
## Solution 3
Note that all of the answers but C have weird factors of 2010, but 2010 is a random number (set x'=$x-2010$). So therefore the answer is \fbox{C(3)}
## See also
