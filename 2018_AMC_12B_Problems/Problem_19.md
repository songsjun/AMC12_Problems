# 2018 AMC 12B Problem 19

> This problem is the same as [2018 AMC 12B #19](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems) and [2018 AMC 10B #21](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems).
## Problem
Mary chose an even $4$-digit number $n$. She wrote down all the divisors of $n$ in increasing order from left to right: $1,2,\ldots,\dfrac{n}{2},n$. At some moment Mary wrote $323$ as a divisor of $n$. What is the smallest possible value of the next divisor written to the right of $323$?

$\textbf{(A) } 324 \qquad \textbf{(B) } 330 \qquad \textbf{(C) } 340 \qquad \textbf{(D) } 361 \qquad \textbf{(E) } 646$
## Solution 1 (Inequalities)
Let $d$ be the next divisor written to the right of $323.$

If $\gcd(323,d)=1,$ then

$$n\geq323d>323^2>100^2=10000,$$

 which contradicts the precondition that $n$ is a $4$-digit number.

It follows that $\gcd(323,d)>1.$ Since $\cdot19,$ the smallest possible value of $d$ is $\cdot20=\boxed{\textbf{(C) } 340},$ from which

$$n=\operatorname{lcm}(323,d)=17\cdot19\cdot20=6460.$$


*~MRENTHUSIASM ~tdeng*
## Solution 2 (Inequalities)
Let $d$ be the next divisor written to the right of $323.$

Since $n$ is even and $\cdot19,$ we have $n=2\cdot17\cdot19\cdot k=646k$ for some positive integer $k.$ Moreover, since $\leq \leq9998,$ we get $\leq \leq15.$ As $d>323,$ it is clear that $d$ must be divisible by $17$ or $19$ or both.

Therefore, the smallest possible value of $d$ is $\cdot20=\boxed{\textbf{(C) } 340},$ from which

$$n=\operatorname{lcm}(323,d)=17\cdot19\cdot20=6460.$$


*~MRENTHUSIASM ~bjhhar*
## Solution 3 (Quick)
The prime factorization of $323$ is $17 \cdot 19$. Our answer must be a multiple of either $17$ or $19$ or both. Since $17 < 19$, the next smallest divisor that is divisble by $17$ would be $323 + 17 = \boxed{\textbf{(C) } 340}$

~[https://artofproblemsolving.com/wiki/index.php/User:South South]
## Solution 4 (Answer Choices)
Since prime factorizing $323$ gives you $17 \cdot 19$, the desired answer needs to be a multiple of $17$ or $19$, this is because if it is not a multiple of $17$ or $1$9, $n$ will be more than a $4$ digit number. For example, if the answer were to instead be $3$24, $n$ would have to be a multiple of $\cdot3^4\cdot17\cdot19$ for both $323$ and $324$ to be a valid factor, meaning $n$ would have to be at least $104652$, which is too big. Looking at the answer choices, $\textbf{(A)}$ and $\textbf{(B)}$ are both not a multiple of neither $17$ nor $1$9, $\textbf{(C)}$ is divisible by $1$7. $\textbf{(D)}$ is divisible by $19$, and $\textbf{(E)}$ is divisible by both $17$ and $19$. Since $\boxed{\textbf{(C) } 340}$ is the smallest number divisible by either $17$ or $19$ it is the answer. Checking, we can see that $n$ would be $6$460, a $4$-digit number. Note that $n$ is also divisible by $2$, one of the listed divisors of $n$. (If $n$ was not divisible by $2$, we would need to look for a different divisor.)

*~Edited by Mathandski*
## Solution 5 (Answer Choices)
Note that $323$ multiplied by any of the answer choices results in a $5$ or $6$-digit $n$. So, we need a choice that shares a factor(s) with $323$, such that the factors we'll need to add to the prime factorization of $n$ (in result to adding the chosen divisor) won't cause our number to multiply to more than $4$ digits.
The prime factorization of $323$ is $\cdot19$, and since we know $n$ is even, our answer needs to be

- even

- has a factor of $17$ or $19$

We see $340$ achieves this and is the smallest to do so ($646$ being the other). So, we get $\boxed{\textbf{(C) } 340}$.

*~OGBooger (Solution)*

*~Pearl2008 (Minor Edits)*
## Solution 6 (Very Rigorous)
This is not the fastest solution, but if i saw this question on an Olympiad/AIME, where there are no answer choices, and my work counted, this is what i would do (for the purpose of this question, $a=323$, b=answer, c=the four digit number);

$\newline$
Note that for any $a,b,c \in \mathbb{Z}^+$, if $a|c$ and $b|c$ then lcm$(a,b)|c$ (this is because if something divides a or b, it must divide c, and thus the max of all of the prime factors, ie: lcm, divides c) since $a=323,b > a$, if $gcd(a,b)=1$ then $lcm(a,b)=ab$ and thus $ab|c \implies c>a^2 \implies c>100^2 \implies$ c is not a four digit number.
$\newline$ thus, $gcd(a,b)\neq1$. This implies that either $17|b$, or $19|b$, or both.

$\newline$ Case 1: $17|b$, $19\not|b$. We let $b=17b'$, and by Euclid's Lemma, $19\not|b'$. Then, $lcm(323,b)|c \implies 17(lcm(19,b'))|c$. Since we already established that, $19\not|b$ (and since 19 is prime, if it does not divide a number it is coprime to that number), $17*19*b'|c \implies 323b'|c$. Since $b=17b'>19*17$, $b' \geq 20$. A quick check shows $b'=20, b=340$ suffices.
$\newline$ Now, let us show that there are no such numbers less than 340.
$\newline$ Presume there exists such a number, $n \in \mathbb{Z}^+$ is in the range $(323,340)$. By hypothesis, there is a $d>1$ such that $d|323$, $d|n$. By properties of divisibility $d|n-323$. the maximum possible value of $n-323$ is $17^-$ (basically an arbitrary amount smaller than 17). But, since $d>1$ and $d|323, d \in \{17,19,323\}$. Of which, the minimum value is d=17. but, $17>17^-$ so there is no such d, and no such n.
$\newline$ Thus, our answer is just $\boxed{\textbf{(C) } 340}$.
$\newline$ ~Stereotypicalmathnerd
## Video Solution 1
https://www.youtube.com/watch?v=qlHE_sAXiY8

https://www.youtube.com/watch?v=T94oxV8schA&ab_channel=Jay

*~Coach J*
## Video Solution 2
https://www.youtube.com/watch?v=KHaLXNAkDWE
## Video Solution 3
https://www.youtube.com/watch?v=vc1FHO9YYKQ

*~bunny1*
## See Also
