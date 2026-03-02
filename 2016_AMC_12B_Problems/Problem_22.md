# 2016 AMC 12B Problem 22

## Problem
For a certain positive integer n less than 1000, the decimal equivalent of $\frac{1}{n}$ is $0.\overline{abcdef},$ a repeating decimal of period of 6, and the decimal equivalent of $\frac{1}{n+6}$ is $0.\overline{wxyz},$ a repeating decimal of period 4. In which interval does n lie?

$\textbf{(A)}\ [1,200]\qquad\textbf{(B)}\ [201,400]\qquad\textbf{(C)}\ [401,600]\qquad\textbf{(D)}\ [601,800]\qquad\textbf{(E)}\ [801,999]$
## Solution
Solution by $e_power_pi_times_i$

If $\frac{1}{n} = 0.\overline{abcdef},$ n must be a factor of 999999. Also, by the same procedure, $n+6$ must be a factor of 9999. Checking through all the factors of 999999 and 9999 that are less than 1000, we see that $n = 297$ is a solution, so the answer is $\boxed{\textbf{(B)}}.$

Note: $n = 27$ and $n = 3$ are both solutions, which invalidates this method. However, we need to examine all factors of 999999 that are not factors of 99999, 999, or 99, or 9. Additionally, we need $n+6$ to be a factor of 9999 but not 999, 99, or 9. Indeed, 297 satisfies these requirements.

We can see that $n=27$ and $n=3$ are not solutions by checking it in the requirements of the problem: $\frac{1}{3}=0.3333\dots,$ period 1, and $\frac{1}{27}=0.037037\dots,$ period 3. Thus, $n=297$ is the only answer.

For anyone who wants more information about repeating decimals, visit: https://en.wikipedia.org/wiki/Repeating_decimal
## Solution 2 (Faster Approach)
Notice that the repeating fraction $0.\overline{abcdef}$ can be represented as $\frac{abcdef}{999999},$ and thereby, n|999999. Also, notice that $0.\overline{wxyz} = \frac{wxyz}{9999},$ so $(n+6)$|9999. However, we have to make some restrictions here. For instance, if n|99999, then $\frac{1}{n}$ could be expressed as $\frac{a’b’c’d’e’}{99999} =$ .$\overline{a’b’c’d’e’}$ which cannot happen. Therefore, from this, we see that the smallest m such that n|\underbrace{$999\cdots9$99}_{m $\text{ nines}$} is $m = 6$. Also, the smallest number m such that $(n+6)$|\underbrace{$999\cdots9$99}_{m $\text{ nines}$} is $m = 4$ by similar reasoning.

Proceeding, we can factorize 9999 = 99 $\times 101,$ after which we see that $n+6$ must contain a prime factor of 101 as it cannot divide 99 but must divide 9999. However, 101 is prime, so 101|$(n+6)$! Looking at the answer choices, all of the intervals are less than 1000, so we know that (the minimum value of) $n+6$ is thereby either 101, 101 $\times 3,$ or 101 $\times 9.$ Testing, we see that $n+6 = 303$ gives $n = 297 = 3^3 \times 11,$ which in fact is a divisor of 999 $\times 1001$ while not being a divisor of 999. Therefore, the answer is $\boxed{\text{(B)}}.$

*~Professor-Mom*
## Video Solution by CanadaMath (Problem 21-25)
Fast Forward to 11:20 for problem 22
https://www.youtube.com/watch?v=P3jJDLGyF2w&t=1546s

*~THEMATHCANADIAN*
## See Also
