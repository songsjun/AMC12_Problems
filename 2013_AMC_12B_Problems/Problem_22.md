# 2013 AMC 12B Problem 22

## Problem
Let m>1 and n>1 be integers. Suppose that the product of the solutions for x of the equation


$$8(\log_n x)(\log_m x)-7\log_n x-6 \log_m x-2013 = 0$$


is the smallest possible integer. What is m+n?



$\textbf{(A)}\ 12\qquad\textbf{(B)}\ 20\qquad\textbf{(C)}\ 24\qquad\textbf{(D)}\ 48\qquad\textbf{(E)}\ 272$
## Solution
Rearranging logs, the original equation becomes



$$\frac{8}{\log n \log m}(\log x)^2 - \left(\frac{7}{\log n}+\frac{6}{\log m}\right)\log x - 2013 = 0$$





By Vieta's Theorem, the sum of the possible values of $\log$ x is $\frac{\frac{7}{\log n}+\frac{6}{\log m}}{\frac{8}{\log n \log m}} = \frac{7\log m + 6 \log n}{8} = \log \sqrt$[8]{$m^7n^6$}. But the sum of the possible values of $\log$ x is the logarithm of the product of the possible values of x. Thus the product of the possible values of x is equal to $\sqrt$[8]{$m^7n^6$}.




It remains to minimize the integer value of $\sqrt$[8]{$m^7n^6$}. Since m, n>1, we can check that $m = 2^2$ and $n = 2^3$ work. Thus the answer is $4+8 =\boxed{\textbf{(A)}\ 12}.$
## Video Solution
For those who prefer a video solution: https://www.youtube.com/watch?v=vX0y9lRv9OM&t=312s
## Video Solution 2 by MOP 2024
https://youtu.be/n5RfHdh3HTk

*~r00tsOfUnity*
## See also
