# 2019 AMC 12B Problem 4

> This problem is the same as [2019 AMC 10B #6](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10B_Problems) and [2019 AMC 12B #4](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems).
## Problem
There is a positive integer n such that $(n+1)$! + (n+2)! = n! $\cdot 440.$ What is the sum of the digits of n?

$\textbf{(A) }3\qquad\textbf{(B) }8\qquad\textbf{(C) }10\qquad\textbf{(D) }11\qquad\textbf{(E) }12$
## Solution
### Solution 1

$$
\begin{split}& (n+1)n! + (n+2)(n+1)n! = 440 \cdot n! \\ \Rightarrow \ &n![n+1 + (n+2)(n+1)] = 440 \cdot n! \\ \Rightarrow \ &n + 1 + n^2 + 3n + 2 = 440 \\ \Rightarrow \ &n^2 + 4n - 437 = 0\end{split}
$$


Solving by the quadratic formula, n = $\frac{-4\pm \sqrt{16+437\cdot4}}{2} = \frac{-4\pm 42}{2} = \frac{38}{2} = 19 (s$ince clearly n $\geq 0).$ The answer is therefore 1 + 9 = $\boxed{\textbf{(C) }10}.$
### Solution 2
Dividing both sides by n! gives
$$(n+1)+(n+2)(n+1)=440 \Rightarrow n^2+4n-437=0 \Rightarrow (n-19)(n+23)=0.$$
Since n is non-negative, $n=19$. The answer is 1 + $9 =\boxed{\textbf{(C) }10}.$
### Solution 3
Dividing both sides by n! as before gives $(n+1)+(n+1)(n+2)=440$. Now factor out $(n+1)$, giving $(n+1)(n+3)=440$. By considering the prime factorization of 440, a bit of experimentation gives us $n+1=20$ and $n+3=22$, so $n=19$, so the answer is 1 + $9 =\boxed{\textbf{(C) }10}.$
### Solution 4
Since $(n+1)$! + (n+2)! = (n+1)n! + (n+2)(n+1)n! = 440 $\cdot$ n!, the result can be factored into $(n+1)(n+3)$n!=440 $\cdot$ n! and divided by n! on both sides to get $(n+1)(n+3)=440$. From there, it is easier to complete the square with the quadratic $(n+1)(n+3)= n^2 +4n + 3$, so $n^2+4n+4=441 \Rightarrow (n+2)^2=441.$ Solving for n results in $n=19$,-23, and since n>0, $n=19$ and the answer is 1 + $9 =\boxed{\textbf{(C) }10}.$

*~Randomlygenerated*
### Solution 5
Rewrite $(n+1)$! + (n+2)! = 440 $\cdot$ n! as $(n+1)$n! + (n+2)(n+1)n! = 440 $\cdot$ n!. Factoring out the n! we get n!(n + 1 + $(n+1)(n+2)$) = 440 $\cdot$ n!. Expand this to get n!$(n^2 +4n + $3) = 440 $\cdot$ n!. Factor this and divide by n! to get (n + 1)(n + 3) = 440. If we take the prime factorization of 440 we see that it is 2^3 * 5 * 11. Intuitively, we can find that n + 1 = 20 and n + 3 = 22. Therefore, $n = 19$. Since the problem asks for the sum of the didgits of n, we finally calculate $1 + 9 = 10$ and get answer choice $\boxed{\textbf{(C) }10}.$

*~pnacham*
### Solution 6
Factor out n! from the left side of the equation:
 $(n+1)$! + (n+2)! = (n+1)n! + (n+2)(n+1)$$n!

$$
= (n+1)n! \left[ 1 + (n+2) \right]
= (n+1)(n+3) \cdot n!
$$


Setting this equal to the given expression 440 $\cdot$ n!:
$$(n+3)(n+1) \cdot n! = 440 \cdot n!$$

Dividing both sides by n!:
$$(n+3)(n+1) = 440$$

To solve for n, let $a =n+2$. Then ($n+3) = a+1$ and ($n+1) = a-1$:

$$
(a+1)(a-1) = 440
a^2 - 1 = 440
a^2 = 441
a = 21
$$


Substituting back for n:
$$n+2 = 21 \implies n = 19$$

The sum of the digits of n is 1 + 9 = $\boxed{10}.$

*~Ipimath*
## Video Solution
https://youtu.be/7p_ESPPF2es

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/ba6w1OhXqOQ?t=1956
## Video Solution
https://youtu.be/7xf_g3YQk00

*~IceMatrix*
## Video Solution
https://youtu.be/6YFN_hwotUk

*~savannahsolver*
## See Also
