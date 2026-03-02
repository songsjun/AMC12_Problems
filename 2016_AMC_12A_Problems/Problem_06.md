# 2016 AMC 12A Problem 6

## Problem
A triangular array of $2016$ coins has $1$ coin in the first row, $2$ coins in the second row, $3$ coins in the third row, and so on up to $N$ coins in the $N$th row. What is the sum of the digits of $N$?

$\textbf{(A)}\ 6\qquad\textbf{(B)}\ 7\qquad\textbf{(C)}\ 8\qquad\textbf{(D)}\ 9\qquad\textbf{(E)}\ 10$
## Solution 1
We are trying to find the value of $N$ such that

$$1+2+3\cdots+(N-1)+N=\frac{N(N+1)}{2}=2016.$$

 Noticing that $\frac{63\cdot 64}{2}=2016,$ we have $N=63,$ so our answer is $\boxed{\textbf{(D) } 9}.$

Notice that we were attempting to solve $\frac{N(N+1)}{2} = 2016 \Rightarrow N(N+1) = 2016\cdot2 = 4032$. Approximating $N(N+1) \approx N^2$, we were looking for a perfect square that is close to, but less than, $4032$. Since $63^2 = 3969$, we see that $N = 63$ is a likely candidate.  Multiplying $\cdot64$ confirms that our assumption is correct.
## Solution 2 (Adding but somewhat more concise)
Knowing that each row number can stand for the number of coins there are in the row, we can just add until we get $2016$.
Notice that $1 + 2 + 3 \cdots + 10 = 55.$ Knowing this, we can say that $11 + 12 \cdots + 20 = 155$ and $21 + \cdots +30 =255$ and so on. This is a quick way to get to the point that N is between 60 and 70. By subtracting from the sum of the number from 1 through 70, we learn that when we subtract $70, 69, 68, 67, 66, 65,$and $64, N = 63.$ Adding those two digits, we get the answer $\boxed{\textbf{(D) } 9}.$ - CorgiARMY
## Solution 3 (Brute force)
If you continue from solution one's conclusion that

$$\frac{N(N+1)}{2}=2016$$

, the equation can be simplified to:


$${N(N+1)}=4032$$


now we can factorize 4032 into $2^6, 3^2,$ and 7, this means that N, and N+1 have to be made from some combination of these numbers, and we can try out values until we get that n is 63, and $n+1$ is 64. Adding the digits of N, we get that the answer is, $\boxed{\textbf{(D) } 9}.$
*~LIUGRA001*
## Video Solution
https://youtu.be/XXX4_oBHuGk?t=543

*~IceMatrix*

https://youtu.be/jJZxzzU1bBk

*~savannahsolver*
## See Also
