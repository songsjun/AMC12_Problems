# 2022 AMC 12A Problem 10

> This problem is the same as [2022 AMC 10A #14](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_14) and [2022 AMC 12A #10](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_10).
## Problem
How many ways are there to split the integers $1$ through $14$ into $7$ pairs such that in each pair, the greater number is at least $2$ times the lesser number?

$\textbf{(A) } 108 \qquad \textbf{(B) } 120 \qquad \textbf{(C) } 126 \qquad \textbf{(D) } 132 \qquad \textbf{(E) } 144$
## Solution 1 (Multiplication Principle)
Clearly, the integers from $8$ through $14$ must be in different pairs, so are the integers from $1$ through $7.$ Note that $7$ must pair with $14.$

We pair the numbers $1,2,3,4,5,6$ with the numbers $8,9,10,11,12,13$ systematically:

- $6$ can pair with either $12$ or $13.$

- $5$ can pair with any of the three remaining numbers from $10,11,12,13.$

- $1,2,3,4$ can pair with the other four remaining numbers from $8,9,10,11,12,13$ without restrictions.

Together, the answer is $\cdot3\cdot4!=\boxed{\textbf{(E) } 144}.$

*~MRENTHUSIASM*
## Solution 2 (Multiplication Principle)
As said in Solution 1, clearly, the integers from $8$ through $14$ must be in different pairs.

We know that $8$ or $9$ can pair with any integer from $1$ to $4$, $10$ or $11$ can pair with any integer from $1$ to $5$, and $12$ or $13$ can pair with any integer from $1$ to $6$. Thus, $8$ will have $4$ choices to pair with, $9$ will then have $3$ choices to pair with ($9$ cannot pair with the same number as the one $8$ pairs with). $10$ cannot pair with the numbers $8$ and $9$ has paired with but can also now pair with $5$, so there are $3$ choices. $11$ cannot pair with $8$'s, $9$'s, or $10$'s paired numbers, so there will be $2$ choices for $11$. $12$ can pair with an integer from $1$ to $5$ that hasn't been paired with already, or it can pair with $6$. $13$ will only have one choice left, and $7$ must pair with $14$.

So, the answer is $\cdot3\cdot3\cdot2\cdot2\cdot1\cdot1=\boxed{\textbf{(E) } 144}.$

*~Scarletsyc*
## Solution 3 (Generalization)
The integers $x \in \{8, \ldots , 14 \}$ must each be the larger elements of a distinct pair.

Assign partners in decreasing order for $x \in \{7, \dots, 1\}$:

Note that $7$ must pair with $1$4: $\mathbf{1} \textbf{ choice}$.

For $5 \leq x \leq 7$, the choices are $\{2x, \dots, 14\} - \{ \text{previous choices}\}$. As $x$ decreases by 1, The minuend increases by 2 elements, and the subtrahend increases by 1 element, so the difference increases by 1, yielding $\mathbf{3!} \textbf{ combined choices}$.

After assigning a partner to $5$, there are no invalid pairings for yet-unpaired numbers, so there are $\mathbf{4!} \textbf{ ways}$ to choose partners for $\{1,2,3,4\}$.

The answer is $3! \cdot 4! = \boxed{\textbf{(E) } 144}$.

In general, for $1,\ldots,2n$, the same logic yields answer: $\left\lfloor\dfrac{n}{2}\right\rfloor! \cdot \left\lceil\dfrac{n}{2}\right\rceil!$

*~oinava*
## Video Solution (Interactive teaching approach!)
https://www.youtube.com/watch?v=7GMrB-hkGVA

*~Mathkidsbymax*
## Video Solution by Education, the Study of Everything
https://youtu.be/k6EUl65wS9Q
## Video Solution by Sohil Rathi
https://youtu.be/V1jOj8ysd_w

*~pi_is_3.14*
## Video Solution (Smart and Simple)
https://youtu.be/7yAh4MtJ8a8?si=jyIdy-jZb2raj3cM&t=1800

*~Math-X*
## Video Solution (RMM club)
https://youtu.be/DwCE1wu5hrA
## Video Solution by Lucas637 (Fast and Easy)
https://www.youtube.com/watch?v=egQK11g54mA
## Video Solution by TheBeautyofMath
https://youtu.be/0kkc4-y8TkU?t=1367

*~IceMatrix*
## See Also
