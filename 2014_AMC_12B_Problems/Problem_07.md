# 2014 AMC 12B Problem 7

## Problem
For how many positive integers n is $\frac{n}{30-n}$ also a positive integer?

$\textbf{(A)}\ 4\qquad\textbf{(B)}\ 5\qquad\textbf{(C)}\ 6\qquad\textbf{(D)}\ 7\qquad\textbf{(E)}\ 8$
## Solutions
### Solution 1
We know that n $\le 30$ or else 30-n will be negative, resulting in a negative fraction.  We also know that n $\ge 15$ or else the fraction's denominator will exceed its numerator making the fraction unable to equal a positive integer value.  Substituting all values n from 15 to 30 gives us integer values for $n=15$, 20, 24, 25, 27, 28, 29.  Counting them up, we have $\boxed{\textbf{(D)}\ 7}$ possible values for n.
### Solution 2
Let  $\frac{n}{30-n}=m$ , where  m $\in \mathbb{N}$ . Solving for  n , we find that  $n=\frac{30m}{m+1}$ . Because  m  and  $m+1$  are relatively prime,  $m+1$|30 . Our answer is the number of proper divisors of  $2^13^15^1 ,$ which is  (1+1)(1+1)(1+1)-$1 =\boxed{\textbf{(D)}\ 7}$ .
## Video Solution 1 (Quick and Easy)
https://youtu.be/rN76FKYRjls

*~Education, the Study of Everything*
### Solution 3
We know that 30-n|n. Then, by divisibility rules:


$$
\Leftrightarrow 30-n|n+30-n
\Leftrightarrow 30-n|30
$$


There are 8 divisors of 30, but n must be positive, so 30|30 isn't counted, meaning we have $\boxed{\textbf{(D)}\ 7}$
### Solution 4
We recognize that 15 because positive integer, it is easy to just test the numbers, yielding: 29, 28, 27, 25, 24, 20, 15 meaning we have $\boxed{\textbf{(D)}\ 7}$  ~MathCosine
## See also
