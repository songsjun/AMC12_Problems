# 2002 AMC 12B Problem 1

> This problem is the same as [2002 AMC 12B #1](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12B_Problems) and [2002 AMC 10B #3](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10B_Problems).
## Problem
The [arithmetic mean](https://artofproblemsolving.com/wiki/index.php/arithmetic_mean) of the nine numbers in the set $\{9, 99, 999, 9999, \ldots, 999999999\}$ is a 9-digit number M, all of whose digits are distinct. The number M doesn't contain the digit


$$\mathrm{(A)}\ 0 \qquad\mathrm{(B)}\ 2 \qquad\mathrm{(C)}\ 4 \qquad\mathrm{(D)}\ 6 \qquad\mathrm{(E)}\ 8$$

## Solution 1
We wish to find $\frac{9+99+\cdots +999999999}{9},$ or $\frac{9(1+11+111+\cdots +111111111)}{9}=123456789.$ This doesn't have the digit 0, so the answer is $\boxed{\mathrm{(A)}\ 0}$
## Solution 2
Notice that the final number is guaranteed to have the digits $\{1, 3, 5, 7, 9\}$ and that each of these digits can be paired with an even number adding up to 9. $\boxed{\mathrm{(A)}\ 0}$ can be taken out, with the other digits fulfilling divisibility by 9.
## Solution 3
The arithmetic mean is $\frac{(10^1-1)+(10^2-1)+\ldots+(10^9-1)}{9}=\frac{1111111101}{9}=123456789.$ So select $\boxed{\mathrm{A}}.$
*~hastapasta*
## Video Solution by Daily Dose of Math
https://youtu.be/w0Q7LG7jdg8

*~Thesmartgreekmathdude*
## See also
