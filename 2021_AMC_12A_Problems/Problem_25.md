# 2021 AMC 12A Problem 25

## Problem
Let d(n) denote the number of positive integers that divide n, including 1 and n. For example, d(1)=1,d(2)=2, and d(12)=6. (This function is known as the divisor function.) Letf(n)=$\frac{d(n)}{\sqrt [3]n}.$There is a unique positive integer N such that f(N)>f(n) for all positive integers $n\ne N.$ What is the sum of the digits of N?

$\textbf{(A) }5 \qquad \textbf{(B) }6 \qquad \textbf{(C) }7 \qquad \textbf{(D) }8\qquad \textbf{(E) }9$
## Solution 1 (Generalization)
We consider the prime factorization of n: $n=\prod_{i=1}^{k}$p_$i^{e_i}$. By the Multiplication Principle, we have d(n)=$\prod_{i=1}^{k}(e_i+1).$ Now, we rewrite f(n) as f(n)=$\frac{d(n)}{\sqrt [3]n}=\frac{\prod_{i=1}^{k}(e_i+1)}{\prod_{i=1}^{k}p_i^{e_i/3}}=\prod_{i=1}^{k}\frac{e_i+1}{p_i^{{e_i}/3}}.$ As f(n)>0 for all positive integers n, note that f(a)>f(b) if and only if $f(a)^3>f(b)^3$ for all positive integers a and b. So, f(n) is maximized if and only if $f(n)^3=\prod_{i=1}^{k}\frac{(e_i+1)^3}{p_i^}$ is maximized.

For each independent factor $\frac{(e_i+1)^3}{p_i^{e_i}}$ with a fixed prime $p_i$, where $1\leqi\leq$ k, the denominator grows faster than the numerator, as exponential functions always grow faster than polynomial functions. Therefore, for each prime $p_i$ with $\left(p_1,p_2,p_3,p_4,\ldots\right)=\left(2,3,5,7,\ldots\right),$ we look for the nonnegative integer $e_i$ such that $\frac{(e_i+1)^3}{p_i^{e_i}}$ is a relative maximum:

$$
\begin{array}{c|c|c|c|c} & & & & \\ [-2.25ex] \boldsymbol{i} & \boldsymbol{p_i} & \boldsymbol{e_i} & \boldsymbol{\dfrac{(e_i+1)^3}{p_i^{e_i}}} & \textbf{Max?} \\ [2.5ex] \hline\hline & & & & \\ [-2ex] 1 & 2 & 0 & 1 & \\ & & 1 & 4 & \\ & & 2 & 27/4 &\\ & & 3 & 8 & \checkmark\\ & & 4 & 125/16 & \\ [0.5ex] \hline & & & & \\ [-2ex] 2 & 3 & 0 & 1 &\\ & & 1 & 8/3 & \\ & & 2 & 3 & \checkmark\\ & & 3 & 64/27 & \\ [0.5ex] \hline & & & & \\ [-2ex] 3 & 5 & 0 & 1 & \\ & & 1 & 8/5 & \checkmark\\ & & 2 & 27/25 & \\ [0.5ex] \hline & & & & \\ [-2ex] 4 & 7 & 0 & 1 & \\ & & 1 & 8/7 & \checkmark\\ & & 2 & 27/49 & \\ [0.5ex] \hline & & & & \\ [-2ex] \geq5 & \geq11 & 0 & 1 & \checkmark \\ & & \geq1 & \leq8/11 & \\ [0.5ex] \end{array}
$$

Finally, the positive integer we seek is N=$2^3\cdot3^2\cdot5^1\cdot7^1=2520.$ The sum of its digits is $2+5+2+0=\boxed{\textbf{(E) }9}.$

Alternatively, once we notice that $3^2$ is a factor of N, we can conclude that the sum of the digits of N must be a multiple of 9. Only choice $\textbf{(E)}$ is possible.

*~MRENTHUSIASM*
## Solution 2 (Solution 1 but Fewer Notations)
The question statement asks for the value of N that maximizes f(N). Let N start out at 1; we will find what factors to multiply N by, in order for N to maximize the function.

First, we will find what power of 2 to multiply N by. If we multiply N by $2^{a}$, the numerator of f, d(N), will multiply by a factor of $a+1$; this is because the number $2^{a}$ has $a+1$ divisors. The denominator, $\sqrt$[3]{N}, will simply multiply by $\sqrt$[3]{$2^{a}$}. Therefore, the entire function multiplies by a factor of $\frac{a+1}{\sqrt[3]{2^{a}}}.$ We want to find the integer value of a that maximizes this value. By inspection, this is 3. Therefore, we multiply N by 8; right now, N is 8.

Next, we will find what power of 3 to multiply N by. Similar to the previous step, we wish to find the integer value of a that maximizes $\frac{a+1}{\sqrt[3]{3^{a}}}.$ This value, also by inspection, is 2.

We can repeat this step on the rest of the primes to get
$$N = 2^{3} \cdot 3^{2} \cdot 5 \cdot 7$$
but from 11 on, $a=0$ will maximize the value of the function, so the prime is not a factor in N.
We evaluate N to be 2520, so the answer is $\boxed{\textbf{(E) }9}.$
## Solution 3 (Fast)
Using the answer choices to our advantage, we can show that N must be divisible by 9 without explicitly computing N, by exploiting the following fact:

**Claim**: If n is not divisible by 3, then f$(9n) > f(3n)$ > f(n).

**Proof**: Since d($\cdot)$ is a [multiplicative function](https://artofproblemsolving.com/wiki/index.php/multiplicative_function), we have d$(3n)$ = d(3)$d(n) = 2d(n)$ and d$(9n)=3d(n)$. Then

$$
\begin{align*} f(3n) &= \frac{2d(n)}{\sqrt[3]{3n}} \approx 1.38 f(n)\\ f(9n) &= \frac{3d(n)}{\sqrt[3]{9n}} \approx 1.44 f(n) \end{align*}
$$

Note that the values $\frac{2}{\sqrt[3]{3}}$ and $\frac{3}{\sqrt[3]{9}}$ do not have to be explicitly computed; we only need the fact that $\frac{3}{\sqrt[3]{9}} > \frac{2}{\sqrt[3]{3}} > 1$ which is easy to show by hand.

The above claim automatically implies N is a multiple of 9: if N was not divisible by 9, then f(9N) > f(N) which is a contradiction, and if N was divisible by 3 and not 9, then f(3N) > f(N) > $f\left(\frac{N}{3}\right),$ also a contradiction. Then the sum of digits of N must be a multiple of 9, so only choice $\boxed{\textbf{(E) } 9}$ works.

*~scrabbler94*
## Solution 4 (Guesswork)
The problem mentions the sum of digits - recall that if a number is divisible by 9, then so is the sum of its digits. Guess that the answer must therefore be $\boxed{\textbf{(E) } 9}$ .

- youtube.com/indianmathguy
## Solution 5 (Simple Explanation)
The aim of this problem is to maximize f(N).

Let's start with when N has one prime factor. If this is the case, let a be its exponent. Clearly, 2 must be the prime factor because regardless of what prime we use, the numerator will only depend on a, so we must minimize the denominator. Therefore, in this case, we want to maximize $\frac{a+1}{\sqrt[3]{2^{a}}} (s$ince the N will have $a+1$ factors). By inspection, we find that $a=3$ does the job.

Now notice that we can add another prime factor to N. Since we can split up prime factors and multiplication under prime factorization and cube roots, we just need to maximize the same process for the second prime factor. Again, we go with the next least prime factor to minimize the denominator which is 3. To clarify, we want to maximize $\frac{b+1}{\sqrt[3]{3^{b}}} (l$etting the exponent be b). Inspection again gives that $b=2$ is maximal.

We repeat this process two more times, adding a prime factor for 5 and 7. We find by inspection that the maximizing power of 5 is 1 and the maximizing power of 7 is also 1.

Now, notice that if n>8, then regardless of what exponent we put in the numerator, f(n)=$\frac{d(n)}{\sqrt [3]n}$ will be less than 1. This is bad, because then our maximized value of f(N) will decrease. Noting that our next least prime factor is 11, we know that we are done.

We evaluate $N=2^3*3^2*5^1*7^1 to$ be 2520, so the answer is $2+5+2+0 =\boxed{\textbf{(E) }9}.$

*~xHypotenuse*
## Calculus Remark
We can find the maximum of the function f(x)=$\frac{x+1}{a^{x/3}}$ for some prime a by taking the derivative and setting it equal to 0. We get f'(x) = $e^{-\frac{x\ln a}{3}}-\frac{\ln a}{3}xe^{-\frac{x\ln a}{3}}-\frac{\ln a}{3}e^{-\frac{x\ln a}{3}} = 0 \to 1-\frac{\ln a}{3}$x - $\frac{\ln a}{3}=0 \to \frac{\ln a}{3}$x = $1-\frac{\ln a}{3} \tox =\frac{3}{\ln a}\left( 1-\frac{\ln a}{3} \right) = \frac{3}{\ln a}-1.$ This gives the exponents you need for each prime in the prime factorization of N; however, it outputs real numbers, not positive integers.

*~ndv1tt*
## Video Solutions
https://www.youtube.com/watch?v=gWaUNz0gLE0 (by Dedekind Cuts)

https://youtu.be/6P-0ZHAaC_A (by OmegaLearn) ~ pi_is_3.14
## See also
