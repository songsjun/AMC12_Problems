# 2002 AMC 12A Problem 3

> This problem is the same as [2002 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12A_Problems) and [2002 AMC 10A #3](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10A_Problems).
## Problem
According to the standard convention for exponentiation,
$$2^{2^{2^{2}}} = 2^{(2^{(2^2)})} = 2^{16} = 65536.$$

If the order in which the exponentiations are performed is changed, how many other values are possible?

$\textbf{(A) } 0\qquad \textbf{(B) } 1\qquad \textbf{(C) } 2\qquad \textbf{(D) } 3\qquad \textbf{(E) } 4$
## Solution 1
The best way to solve this problem is by simple brute force.

It is convenient to drop the usual way how exponentiation is denoted, and to write the formula as 2\uparrow 2\uparrow 2\uparrow 2, where \uparrow denotes exponentiation. We are now examining all ways to add parentheses to this expression. There are 5 ways to do so:

$$
1. 2\uparrow (2\uparrow (2\uparrow 2))
1. 2\uparrow ((2\uparrow 2)\uparrow 2)
1. ((2\uparrow 2)\uparrow 2)\uparrow 2
1. (2\uparrow (2\uparrow 2))\uparrow 2
1. (2\uparrow 2)\uparrow (2\uparrow 2)
$$


We can note that 2\uparrow (2\uparrow 2) = (2\uparrow 2)\uparrow 2 =16. Therefore options 1 and 2 are equal, and options 3 and 4 are equal.
Option 1 is the one given in the problem statement. Thus we only need to evaluate options 3 and 5.

$$((2\uparrow 2)\uparrow 2)\uparrow 2 = 16\uparrow 2 = 256$$

$$(2\uparrow 2)\uparrow (2\uparrow 2) = 4 \uparrow 4 = 256$$

Thus the only other result is 256, and our answer is $\boxed{\textbf{(B) } 1}.$
## Solution 2 (Recursive Method)
We will proceed by recursion using the same notation as Solution 1. Note that we can either have (2 \uparrow 2 \uparrow 2) \uparrow 2 or 2 \uparrow (2 \uparrow 2 \uparrow 2).

However, the expression in the parentheses can either be (2 \uparrow 2) \uparrow 2 or 2 \uparrow (2 \uparrow 2), which correspond to the same value of 16. Therefore, we can either have $16^2$ or $2^{16}$, so our answer is $\boxed{\textbf{(B) }1}.$

*~TPColor*
## Video Solution by Daily Dose of Math
https://youtu.be/fJndjYHWBrU

*~Thesmartgreekmathdude*
## See Also
