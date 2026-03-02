# 2018 AMC 12B Problem 10

> This problem is the same as [2018 AMC 12B #10](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems) and [2018 AMC 10B #14](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems).
## Problem
A list of $2018$ positive integers has a unique mode, which occurs exactly $10$ times. What is the least number of distinct values that can occur in the list?

$\textbf{(A)}\ 202\qquad\textbf{(B)}\ 223\qquad\textbf{(C)}\ 224\qquad\textbf{(D)}\ 225\qquad\textbf{(E)}\ 234$
## Solution 1 (Statistics)
To minimize the number of distinct values, we want to maximize the number of times a number appears. So, we could have $223$ numbers appear $9$ times, $1$ number appear once, and the mode appear $10$ times, giving us a total of $223 + 1 + 1 = \boxed{\textbf{(D)}\ 225}.$
## Solution 2 (Algebra)
As in Solution 1, we want to maximize the number of time each number appears to do so. We can set up an equation $10 + 9( x - 1 )\geq2018,$ where $x$ is the number of values. Notice how we can then rearrange the equation into $1 + 9 ( 1 )+9 ( x - 1 )\geq2018,$ which becomes $9 \geq2017,$ or $x\geq224\frac19.$ We cannot have a fraction of a value so we must round up to $\boxed{\textbf{(D)}\ 225}.$

*~Username_taken12*
## Solution 3 (Literally Solution 1)
There is a unique number $n$ with a mode of 10. This means we have 2008 terms left. We see that $\lfloor 2008/9 \rfloor = 223$, with remainder 1. Our answer is simply $223 + 1 + $1 = $\boxed{\textbf{(D)}\ 225}.$

*~Pinotation*
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/M-z7SJwlsLY

*~Education, the Study of Everything*
## See Also
