# 2009 AMC 12B Problem 6

> This problem is the same as [2009 AMC 10B #7](https://artofproblemsolving.com/wiki/index.php/2009_AMC_10B_Problems) and [2009 AMC 12B #6](https://artofproblemsolving.com/wiki/index.php/2009_AMC_12B_Problems).
## Problem
By inserting parentheses, it is possible to give the expression
$$2\times3 + 4\times5$$
several values.  How many different values can be obtained?


$$\text{(A) } 2 \qquad \text{(B) } 3 \qquad \text{(C) } 4 \qquad \text{(D) } 5 \qquad \text{(E) } 6$$

## Solution
The three operations can be performed on any of 3! = 6 orders.  However, if the addition is performed either first or last, then multiplying in either order produces the same result. So at most four distinct values can be obtained.  It is easy to check that the values of the four expressions

$$
\begin{align*} (2\times3) + (4\times5) &= 26,\\ (2\times3 + 4)\times5 &= 50,\\ 2\times(3 + 4\times5) &= 46,\\ 2\times(3 + 4)\times5 &= 70 \end{align*}
$$

are in fact all distinct.  So the answer is $\boxed{4},$ which is choice $\mathrm{(C)}.$
## See also
