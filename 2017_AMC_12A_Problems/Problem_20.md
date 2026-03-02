# 2017 AMC 12A Problem 20

## Problem
How many ordered pairs (a,b) such that a is a positive real number and b is an integer between 2 and 200, inclusive, satisfy the equation ($\log_ba)^{2017}=\log_b(a^{2017})$?

$\textbf{(A)}\ 198\qquad\textbf{(B)}\ 199\qquad\textbf{(C)}\ 398\qquad\textbf{(D)}\ 399\qquad\textbf{(E)}\ 597$
## Solution
By the properties of logarithms, we can rearrange the equation to read $x^{2017}=2017x$ with $x=\log_b$ a. If $x\neq 0,$ we may divide by it and get $x^{2016}=2017$, which implies $x=\pm \root{2016}$\of{2017}. Hence, we have 3 possible values x, namely
 $x=0,\qquadx=2017^{\frac1{2016}}$,\, $\text{and}\quad$ x=-$2017^{\frac1{2016}}$.

Since $\log_b$ a=x is equivalent $to a=b^x,$ each possible value x yields exactly 199 solutions (b,a), as we can assign $a=b^x to$ each $b=2,3,\dots,200.$ In total, we have $3\cdot 199=\boxed{\textbf{(E) } 597}$ solutions.
## Video Solution (HOW TO THINK BETTER!!!)
https://youtu.be/hBqRcXa_xqE

*~Education, the Study of Everything*
## See Also
