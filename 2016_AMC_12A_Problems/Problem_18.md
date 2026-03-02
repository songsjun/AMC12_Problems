# 2016 AMC 12A Problem 18

## Problem
For some positive integer $n$, the number $110n^3$ has $110$ positive integer divisors, including $1$ and the number $110n^3$. How many positive integer divisors does the number $81n^4$ have?

$\textbf{(A) }110\qquad\textbf{(B) }191\qquad\textbf{(C) }261\qquad\textbf{(D) }325\qquad\textbf{(E) }425$
## Solution 1
Since the prime factorization of $110$ is $2 \cdot 5 \cdot 11$, we have that the number is equal to $2 \cdot 5 \cdot 11 \cdot n^3$.  This has $2 \cdot 2 \cdot 2=8$ factors when $n=1$.  This needs a multiple of 11 factors, which we can achieve by setting $n=2^3$, so we have $2^{10} \cdot 5 \cdot 11$ has $44$ factors.  To achieve the desired $110$ factors, we need the number of factors to also be divisible by $5$, so we can set $n=2^3 \cdot 5$, so $2^{10} \cdot 5^4 \cdot 11$ has $110$ factors.  Therefore, $n=2^3 \cdot 5$.  In order to find the number of factors of $81n^4$, we raise this to the fourth power and multiply it by $81$, and find the factors of that number.  We have $3^4 \cdot 2^{12} \cdot 5^4$, and this has $5 \cdot 13 \cdot 5=\boxed{\textbf{(D) }325}$ factors.
## Solution 2
$110n^3$ clearly has at least three distinct prime factors, namely 2, 5, and 11.

The number of factors of $p_1^{n_1}\cdots p_k^{n_k}$ is $(n_1+1)\cdots(n_k+1)$ when the $p$'s are distinct primes. This tells us that none of these factors can be 1. The number of factors is given as 110. The only way to write 110 as a product of at least three factors without $1$s is $\cdot 5\cdot 11$.

We conclude that $110n^3$ has only the three prime factors 2, 5, and 11 and that the multiplicities are 1, 4, and 10 in some order.  I.e., there are six different possible values of $n$ all of the form $n=p_\cdot p_2^3$.

$81n^4$ thus has prime factorization $81n^4=3^4\cdot p_1^4\cdot p_2^{12}$ and a factor count of $5\cdot5\cdot13=\boxed{\textbf{(D) }325}$

The expression $110n^3$ has at least three distinct prime factors, namely $2, 5,$ and $11$.

If a number has prime factorization $p_1^{n_1}\cdots p_k^{n_k},$ then its number of positive divisors is $(n_1+1)\cdots(n_k+1),$ where the $p_i$ are distinct primes. In particular, none of these factors can be equal to $1$.

We are told that $110n^3$ has exactly $110$ positive divisors. The only way to express $110$ as a product of at least three integers greater than $1$ is $110 = \cdot 5\cdot 11.$ Therefore, $110n^3$ has exactly three distinct prime factors, which must be $2, 5,$ and $11,$ and their corresponding exponents are $1, 4,$ and $10$ in some order.

It follows that $n^3$ contributes exponents $3$ and $9$ to two of these primes, so $n^3 = p_\cdot p_2^9$ for distinct primes $p_1, p_2 \in \{2,5,11\}.$ Hence, $n = p_\cdot p_2^3.$ There are six possible values of $n$ of this form.

Now consider $81n^4.$ Since $81 = 3^4$ and $n^4 = p_\cdot p_2^{12},$ we obtain $81n^4 = \cdot p_\cdot p_2^{12}.$ Applying the divisor formula yields $(4+1)(4+1)(12+1)=5\cdot5\cdot13=\boxed{\textbf{(D) }325}.$
## Video Solution
https://youtu.be/hAEsBh64VSY

*~savannahsolver*
## Video Solution by OmegaLearn
https://youtu.be/ZhAZ1oPe5Ds?t=3694

*~pi_is_3.14*
## Video Solution
https://www.youtube.com/watch?v=IxIinK0p8o4&list=PLyhPcpM8aMvJewbDgg6W1h6WjWqP-v4Uy&index=2

- AMBRIGGS
## See Also
