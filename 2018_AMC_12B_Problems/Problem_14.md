# 2018 AMC 12B Problem 14

> This problem is the same as [2018 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems) and [2018 AMC 10B #19](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems).
## Problem
Joey and Chloe and their daughter Zoe all have the same birthday. Joey is $1$ year older than Chloe, and Zoe is exactly $1$ year old today. Today is the first of the $9$ birthdays on which Chloe's age will be an integral multiple of Zoe's age. What will be the sum of the two digits of Joey's age the next time his age is a multiple of Zoe's age?

$\textbf{(A) }7 \qquad
$\textbf{(B) }8 \qquad$
$\textbf{(C) }9 \qquad$
$\textbf{(D) }10 \qquad$
$\textbf{(E) }11 \qquad$$
## Solution 1
Suppose that Chloe is $c$ years old today, so Joey is $c+1$ years old today. After $n$ years, Chloe and Zoe will be $n+c$ and $n+1$ years old, respectively. We are given that

$$\frac{n+c}{n+1}=1+\frac{c-1}{n+1}$$

 is an integer for $9$ nonnegative integers $n.$ It follows that $c-1$ has $9$ positive divisors. The prime factorization of $c-1$ is either $p^8$ or $p^2q^2.$ Since $c-1<100,$ the only possibility is $c\cdot3^2=36,$ from which $c=37.$ We conclude that Joey is $c+1=38$ years old today.

Suppose that Joey's age is a multiple of Zoe's age after $k$ years, in which Joey and Zoe will be $k+38$ and $k+1$ years old, respectively. We are given that

$$\frac{k+38}{k+1}=1+\frac{37}{k+1}$$

 is an integer for some positive integer $k.$ It follows that $37$ is divisible by $k+1,$ so the only possibility is $k=36.$ We conclude that Joey will be $k+38=74$ years old then, from which the answer is $\boxed{\textbf{(E) }11}.$

*~Supercj ~MRENTHUSIASM ~Zeric*
## Solution 2
Let Joey's age be $j$, Chloe's age be $c$, and we know that Zoe's age is $1$.

We know that there must be $9$ values $k\in\mathbb{Z}$ such that $c+k=a(1+k)$ where $a$ is an integer.

Therefore, $c-1+(1+k)=a(1+k)$ and $c-1=(1+k)(a-1)$. Therefore, we know that, as there are $9$ solutions for $k$, there must be $9$ solutions for $c-1$. We know that this must be a perfect square. Testing perfect squares, we see that $c-1=36$, so $c=37$. Therefore, $j=38$. Now, since $j-1=37$, by similar logic, $37=(1+k)(a-1)$, so $k=36$ and Joey will be $38+36=74$ and the sum of the digits is $\boxed{\textbf{(E) }11}$.
## Solution 3 (Intense Logic)
Chloe has exactly $9n$ birthdays that are integral multiples of Zoe.

We check $n=1$. This indicates that Chloe has an integral birthday of 9, meaning that Joey has an integral birthday of 10. This means that the next coinciding birthday is the 12th integral birthday for Joey, but as the pattern continues there will be $> 9$ exact integral birthdays, so $n=1$ does not work.

We check $n=2$. We also see that Joey would have an integral birthday of 19, but 20 is not possible here as well, as it would result in $> 9$ integral birthdays.

We check $n=3$. We see that the 30th integral birthday for Joey is when Zoe is 3, and this is also not possible as Joey and Zoe will intertwine at 36th, and then never intertwine again.

So we try $n = 4$. We see that at 38, we instantly get another integral birthday, where Joey is at the 38th integral birthday and Zoe is on the 2nd. We see this again at $(J, Z) (40, 4)$, and again at $(42, 6)$, then $(45, 9)$, and we see it gets more and more uncommon. We can conclude that there will exist $= 9$ exact integral multiples, and therefore our answer is $3 + $8 = $\boxed{\textbf{(E) }11}$.

*~Pinotation*
## Solution 4
Here's a different way of stating Solution 2:

If a number is a multiple of both Chloe's age and Zoe's age, then it is a multiple of their difference. Since the difference between their ages does not change, then that means the difference between their ages has $9$ factors. Therefore, the difference between Chloe and Zoe's age is $36$, so Chloe is $37$, and Joey is $38$. The common factor that will divide both of their ages is $37$, so Joey will be $74$. The answer is $7 + 4 =  \boxed{\textbf{(E) }11}$.
## Solution 5
Similar approach to above, just explained less concisely and more in terms of the problem (less algebraic).

Let $C+n$ denote Chloe's age, $J+n$ denote Joey's age, and $Z+n$ denote Zoe's age, where $n$ is the number of years from now. We are told that $C+n$ is a multiple of $Z+n$ exactly nine times. Because $Z+n$ is $1$ at $n=0$ and will increase until greater than $C-Z$, it will hit every natural number less than $C-Z$, including every factor of $C-Z$. For $C+n$ to be an integral multiple of $Z+n$, the difference $C-Z$ must also be a multiple of $Z$, which happens if $Z$ is a factor of $C-Z$. Therefore, $C-Z$ has nine factors. The smallest number that has nine positive factors is $2^23^2=36$ . (We want it to be small so that Joey will not have reached three digits of age before his age is a multiple of Zoe's.) We also know $Z=1$ and $J=C+1$. Thus,


$$\begin{align*}
C-Z&=36, \\
J-Z&=37.
$\end{align*}$$$


By our above logic, the next time $J-Z$ is a multiple of $Z+n$ will occur when $Z+n$ is a factor of $J-Z$. Because $37$ is prime, the next time this happens is at $Z+n=37$, when $J+n=74$. The answer is $\boxed{\textbf{(E) }11}$.
## Video Solution
https://youtu.be/E2SbkCQ1V84

*~savannahsolver*
## Video Solution by OmegaLearn
https://youtu.be/zfChnbMGLVQ?t=111

*~pi_is_3.14*
## See Also
