# 2006 AMC 12A Problem 11

> This problem is the same as [2006 AMC 12A #11](https://artofproblemsolving.com/wiki/index.php/2006_AMC_12A_Problems) and [2008 AMC 10A #11](https://artofproblemsolving.com/wiki/index.php/2006_AMC_10A_Problems/Problem_11).
## Problem
Which of the following describes the graph of the equation $(x+y)^2=x^2+y^2$?

$\mathrm{(A)}$\ $\text{the empty set}\qquad\mathrm{(B)}$\ $\text{one point}\qquad\mathrm{(C)}$\ $\text{two lines}\qquad\mathrm{(D)}$\ $\text{a circle}\qquad\mathrm{(E)}$\ $\text{the entire plane}$
## Solution

$$
\begin{align*}(x+y)^2&=x^2+y^2\\ x^2 + 2xy + y^2 &= x^2 + y^2\\ 2xy &= 0\end{align*}
$$

Either  $x = 0$  or  $y = 0$ . The [union](https://artofproblemsolving.com/wiki/index.php/union) of them is 2 lines, and thus the answer is $\mathrm{(C)}.$


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,-50)--(0,50));draw((-50,0)--(50,0));
```
## See also
