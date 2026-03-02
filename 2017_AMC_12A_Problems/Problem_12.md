# 2017 AMC 12A Problem 12

## Problem
There are 10 horses, named Horse 1, Horse 2, $\ldots,$ Horse 10. They get their names from how many minutes it takes them to run one lap around a circular race track: Horse k runs one lap in exactly k minutes. At time 0 all the horses are together at the starting point on the track. The horses start running in the same direction, and they keep running around the circular track at their constant speeds. The least time S > 0, in minutes, at which all 10 horses will again simultaneously be at the starting point is S = 2520. Let  T>0 be the least time, in minutes, such that at least 5 of the horses are again at the starting point. What is the sum of the digits of  T?

$\textbf{(A)}\ 2\qquad\textbf{(B)}\ 3\qquad\textbf{(C)}\ 4\qquad\textbf{(D)}\ 5\qquad\textbf{(E)}\ 6$
## Solution 1
We know that Horse k will be at the starting point after n minutes if k|n. Thus, we are looking for the smallest n such that at least 5 of the numbers $\{1,2,\cdots,10\}$ divide n. Thus, n has at least 5 positive integer divisors.

We quickly see that 12 is the smallest number with at least 5 positive integer divisors and that 1,2,3,4,6 are each numbers of horses. Thus, our answer is $1+2=\boxed{\textbf{(B) } 3}.$
## Solution 2
In order for at least 5 horses to finish simultaneously, the current time needs to have at least 5 divisors. Thus the number must have a form of either $p^4$ or $p^2*q,$ which have 5 and 6 factors respectively. The smallest number of the first form is 16, and the smallest number of the second form is 12.  Thus, our answer is $1+2=\boxed{\textbf{(B) } 3}.$
## See Also
