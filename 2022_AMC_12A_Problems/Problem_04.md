# 2022 AMC 12A Problem 4

> This problem is the same as [2022 AMC 10A #7](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_7) and [2022 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_4).
## Problem
The least common multiple of a positive integer $n$ and $18$ is $180$, and the greatest common divisor of $n$ and $45$ is $15$. What is the sum of the digits of $n$?

$\textbf{(A) } 3 \qquad \textbf{(B) } 6 \qquad \textbf{(C) } 8 \qquad \textbf{(D) } 9 \qquad \textbf{(E) } 12$
## Solution 1
Note that


$$\begin{align*}

$$
18 &= 2\cdot3^2, \\
180 &= 2^2\cdot3^2\cdot5, \\
45 &= 3^2\cdot5 \\
15 &= 3\cdot5.
$$

$\end{align*}$$$


Let $n = \cdot3^b\cdot5^c.$ It follows that:
<ol style="margin-left: 1.5em;">
  <li>From the least common multiple condition, we have

$$\operatorname{lcm}(n,18) = \operatorname{lcm}(2^a\cdot3^b\cdot5^c,2\cdot3^2) = 2^{\max(a,1)}\cdot3^{\max(b,2)}\cdot5^{\max(c,0)} = 2^2\cdot3^2\cdot5,$$

 from which $a=2, \in\{0,1,2\},$ and $c=1.$</li><p>
  <li>From the greatest common divisor condition, we have

$$\gcd(n,45) = \gcd(2^2\cdot3^b\cdot5,3^2\cdot5) = 2^{\min(2,0)}\cdot3^{\min(b,2)}\cdot5^{\min(1,1)} = 3\cdot5,$$

 from which $b=1.$</li><p>
</ol>
Together, we conclude that $n=2^2\cdot3\cdot5=60.$ The sum of its digits is $\boxed{\textbf{(B) } 6}.$

*~MRENTHUSIASM ~USAMO333*
## Solution 2
The options for $\text{lcm}(x, 18)=180$ are $2$0, $60$, and $180$. The options for $\text{gcd}(y, 45)=15$ are $1$5, $3$0, 60, $75$, etc. We see that $60$ appears in both lists; therefore, $\boxed{\textbf{(B) } 6}$.

*~MrThinker*
## Remark
If you ignore or mess up the LCM, and get  $n=15$, you'll still get the correct answer.
## Video Solution 1
https://youtu.be/YI1E8C3ZX-U

*~Education, the Study of Everything*
## Video Solution 2
https://youtu.be/q2y-Wfdi4q8

*~savannahsolver*
## Video Solution 3 (Smart and Simple)
https://youtu.be/7yAh4MtJ8a8?si=o-aImrVOwbH1HoZv&t=673

*~Math-X*
## Video Solution 4
https://youtu.be/5KAiNlqbrsQ
## See Also
