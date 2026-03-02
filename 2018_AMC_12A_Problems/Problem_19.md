# 2018 AMC 12A Problem 19

## Problem
Let A be the set of positive integers that have no prime factors other than 2, 3, or 5. The infinite sum $\frac{1}{1} + \frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \frac{1}{5} + \frac{1}{6} + \frac{1}{8} + \frac{1}{9} + \frac{1}{10} + \frac{1}{12} + \frac{1}{15} + \frac{1}{16} + \frac{1}{18} + \frac{1}{20} +$\cdotsof the reciprocals of the elements of A can be expressed as $\frac{m}{n},$ where m and n are relatively prime positive integers. What is m+n?

$\textbf{(A) } 16 \qquad \textbf{(B) } 17 \qquad \textbf{(C) } 19 \qquad \textbf{(D) } 23 \qquad \textbf{(E) } 36$
## Solution 1
Note that the fractions of the form $\frac{1}{2^a3^b5^c},$ where a,b, and c are nonnegative integers, span all terms of the infinite sum.

Therefore, the infinite sum becomes

$$
\begin{align*} \sum_{a=0}^{\infty}\sum_{b=0}^{\infty}\sum_{c=0}^{\infty}\frac{1}{2^a3^b5^c} &= \left(\sum_{a=0}^{\infty}\frac{1}{2^a}\right)\cdot\left(\sum_{b=0}^{\infty}\frac{1}{3^b}\right)\cdot\left(\sum_{c=0}^{\infty}\frac{1}{5^c}\right) \\ &= \frac{1}{1-\frac12}\cdot\frac{1}{1-\frac13}\cdot\frac{1}{1-\frac15} \\ &= 2\cdot\frac32\cdot\frac54 \\ &= \frac{15}{4} \end{align*}
$$

by a product of geometric series, from which the answer is $15+4=\boxed{\textbf{(C) } 19}.$

*~athens2016 ~MRENTHUSIASM*
## Solution 2
This solution is the same as Solution 1 but potentially clearer.

Clearly this is just summing over the reciprocals of the numbers of the form $2^i3^j5^k,$ where i,j,k$\in$ [0,$\infty).$ So our desired sum is $\sum_{k=0}^{\infty}\sum_{j=0}^{\infty}\sum_{i=0}^{\infty}\frac{1}{2^i3^j5^k}.$ By the infinite geometric series formula, $\sum_{i=0}^{\infty}\frac{1}{2^i3^j5^k}$ is just $\frac{\frac{1}{3^j5^k}}{1-\frac{1}{2}}=\frac{2}{3^j5^k}.$ Applying the infinite geometric series formula again gives that $\sum_{j=0}^{\infty}\frac{2}{3^j5^k}=\frac{\frac{2}{5^k}}{1-\frac{1}{3}}=\frac{3}{5^k}.$ Applying the infinite geometric series formula again yields $\sum_{k=0}^{\infty}\frac{3}{5^k}=\frac{3}{1-\frac{1}{5}}=\frac{15}{4}.$ Hence our final answer is $15+4=\boxed{\textbf{(C) } 19}.$

*~vsamc*
## Solution 3
Separate into 7 separate infinite series's so we can calculate each and find the original sum:

The first infinite sequence shall be all the reciprocals of the powers of 2, the second shall be reciprocals of the powers of 3, and the third will consist of reciprocals of the powers of 5. We can easily calculate these to be 1, $\frac{1}{2}, \frac{1}{4}$ respectively.

The fourth infinite series shall be all real numbers in the form  $\frac{1}{2^a3^b},$ where a,b$\geq1.$

The fifth is all real numbers in the form  $\frac{1}{2^a5^b},$ where a,b$\geq1.$

The sixth is all real numbers in the form  $\frac{1}{3^a5^b},$ where a,b$\geq1.$

The seventh infinite series is all real numbers in the form  $\frac{1}{2^a3^b5^c},$ where a,b,c$\geq1.$

Let us denote the first sequence as $a_{1}$, the second as $a_{2}$, etc. We know $a_{1}=1, a_{2}=\frac{1}{2},a_{3}=\frac{1}{4},$ let us find $a_{4}$. factoring out $\frac{1}{6}$ from the terms in this subsequence, we would get $a_{4}=\frac{1}{6}(1+a_{1}+a_{2}+a_{4}).$

Knowing $a_{1}$ and $a_{2}$, we can substitute and solve for $a_{4}$, and we get $\frac{1}{2}.$ If we do similar procedures for the fifth and sixth sequences, we can solve for them too, and we get after solving them $\frac{1}{4}$ and $\frac{1}{8}.$

Finally, for the seventh sequence, we see $a_{7}=\frac{a_{8}}{30},$ where $a_{8}$  is the infinite series the problem is asking us to solve for. The sum of all seven subsequences will equal the one we are looking for, and we need to add the $\frac11$ term back: $1+1+\frac{1}{2}+\frac{1}{4}+\frac{1}{2}+\frac{1}{4}+\frac{1}{8}+\frac{a_{8}}{30}=a_{8}.$ We solve this to get $\frac{29}{8}=\frac{29a_{8}}{30},$ or $\frac{15}{4}=a_{8}.$ So our answer is $\frac{15}{4},$ but we are asked to add the numerator and denominator, which sums up to $\boxed{\textbf{(C) } 19}.$

~~Edited by mprincess0229~~
## Solution 4(clear but takes time)
First of all, we need to find some geometric sequences hidden in here.

The first sequence is just $\frac{1}{1}.$ We can just leave this 1 by itself.

The second sequence contains all numbers in the form of $\frac{1}{2^p}.$ This is just $\frac{1}{2} + \frac{1}{4} + \frac{1}{8} +$ ... = 1.

The third sequence contains all numbers in the form of $\frac{1}{2^p\cdot 3}.$ These add to $\frac{\frac13}{\frac12}.$

The fourth sequence contains all numbers in the form of $\frac{1}{2^p\cdot 5}.$ These add to $\frac{\frac15}{\frac12}.$

Essentially, every number is contained in a sequence that starts with the term that is the reciprocal of the result when the number is repeatedly divided by 2 until the number is odd.

These will add up to $1+1+\frac{\frac{1}{3}+\frac{1}{5}+\frac{1}{9}+\frac{1}{15}+\frac{1}{25}+\frac{1}{27}+\cdots}{\frac{1}{2}}.$ Note that the numerator of that fraction is the sum of the reciprocals of every number with only 3 or 5 in its prime factorization. Let's call that numerator x.

So now, we find x. That strategy worked out pretty well. Let's use it again.

The first sequence contains all numbers in the form of $\frac{1}{3^p}.$ These add to $\frac{\frac13}{\frac23}.$ The second sequence contains all numbers in the form of $\frac{1}{3^p\cdot5}.$ These add to $\frac{\frac15}{\frac23}.$ The third sequence contains all numbers in the form of $\frac{1}{3^p\cdot 5^2}.$ These add to $\frac{\frac{1}{25}}{\frac{2}{3}}$

Essentially, every number is contained in a sequence that starts with the term that is the reciprocal of the result when the number is repeatedly divided by 3 until the number is not divisible by 3.

The total sum for x is $\frac{1}{2}+\frac{\text{a geometric sequence}}{\frac{2}{3}},$ and that geometric sequence evaluates to $\frac{\frac{1}{5}}{1-\frac{1}{5}}=\frac{1}{4}.$ Then we just need to do the computation.

x is $\frac{\frac14}{\frac23}+\frac12=\frac78.$ Recalling our answer is $\frac{x}{\frac12}+2,$ we can plug in x to get a final answer of $\frac{7}{4}+2=\frac{15}{4}.$

Finally, we can add $15+4=\boxed{\textbf{(C) } 19}.$

*~yrock*
## Video Solution by LetsSolveMathProblems
https://www.youtube.com/watch?v=woXlEargLpI&ab_channel=LetsSolveMathProblems
## See Also
