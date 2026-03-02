# 2015 AMC 12B Problem 18

## Problem
For every composite positive integer n, define r(n) to be the sum of the factors in the prime factorization of n. For example, r(50) = 12 because the prime factorization of 50 is 2 $\times 5^{2},$ and $2 + 5 + 5 = 12$. What is the range of the function r, $\{r(n): n \text{ is a composite positive integer}\}$ ?

$\textbf{(A)}\; \text{the set of positive integers} \\ \textbf{(B)}\; \text{the set of composite positive integers} \\ \textbf{(C)}\; \text{the set of even positive integers} \\ \textbf{(D)}\; \text{the set of integers greater than 3} \\ \textbf{(E)}\; \text{the set of integers greater than 4}$
## Solution
## Solution 1
This problem becomes simple once we recognize that the domain of the function is $\{4, 6, 8, 9, 10, 12, 14, 15, \dots\}$. By evaluating r(4) to be 4, we can see that $\textbf{(E)}$ is incorrect. Evaluating r(6) to be 5, we see that both $\textbf{(B)}$ and $\textbf{(C)}$ are incorrect. Since our domain consists of composite numbers, which, by definition, are a product of at least two positive primes, the minimum value of r(n) is 4, so $\textbf{(A)}$ is incorrect. That leaves us with $\boxed{\textbf{(D)}\; \text{the set of integers greater than }3}.$

## Solution 2
Think backwards. The range is the same as the numbers y that can be expressed as the sum of two or more prime positive integers.

The lowest number we can get is $y =2+2 = 4$. For any number greater than 4, we can get to it by adding some amount of 2's and then possibly a 3 if that number is odd. For example, 23 can be obtained by adding 2 ten times and adding a 3; this corresponds to the argument $n =2^{10}\times 3.$  Thus our answer is $\boxed{\textbf{(D)}\; \text{the set of integers greater than }3}.$
## Solution 3
Notice that by the Chicken McNugget Theorem, given $2s$ and $3s$, we can make any number larger than $2\cdot3 - 2 - 3 = 1.$ We also exclude 2 and 3 since they correspond to primes. All other numbers can be written as $2a+3b$, which $r(2^a3^b)$ will equal. Thus the answer is D.
## Solution 4 (Elimination)
Note that r(10) eliminates B and C and r(4) eliminates E. We can easily see that r(n) cannot be less that 3 by testing 2 and 3. So, the answer is clearly $\boxed{\textbf{(D)}\; \text{the set of integers greater than }3}.$
## See Also
