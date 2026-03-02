# 2022 AMC 12B Problem 4

> This problem is the same as [2022 AMC 10B #7](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_7) and [2022 AMC 12B #4](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_4).
## Problem
For how many values of the constant $k$ will the polynomial $x^{2}+kx+36$ have two distinct integer roots?

$\textbf{(A)}\ 6 \qquad\textbf{(B)}\ 8 \qquad\textbf{(C)}\ 9 \qquad\textbf{(D)}\ 14 \qquad\textbf{(E)}\ 16$
## Solution 1
Let $p$ and $q$ be the roots of $x^{2}+kx+36.$ By [Vieta's Formulas](https://artofproblemsolving.com/wiki/index.php/Vieta's_Formulas), we have $p+q=-k$ and $pq=36.$

It follows that $p$ and $q$ must be distinct factors of $36.$ The possibilities of $\{p,q\}$ are

$$\pm\{1,36\},\pm\{2,18\},\pm\{3,12\},\pm\{4,9\}.$$


Each unordered pair gives a unique value of $k.$ Therefore, there are $\boxed{\textbf{(B) }8}$ values of $k,$ corresponding to $\mp37,\mp20,\mp15,\mp13,$ respectively.

*~stevens0209 ~MRENTHUSIASM ~$\color{magenta}zoomanTV$*
## Solution 2
Note that $k$ must be an integer. Using the [quadratic formula](https://artofproblemsolving.com/wiki/index.php/quadratic_formula), $x=\frac{-k \pm \sqrt{k^2-144}}{2}.$ Since $4$ divides $144$ evenly, $k$ and $k^2-144$ have the same parity, so $x$ is an integer if and only if $k^2-144$ is a perfect square.

Let $k^2-144=n^2.$ Then, $(k+n)(k-n)=144.$ Since $k$ is an integer and $144$ is even, $k+n$ and $k-n$ must both be even. Assuming that $k$ is positive, we get $5$ possible values of $k+n$, namely $2, 4, 8, 6, 12$, which will give distinct positive values of $k$, but $k+n=12$ gives $k+n=k-n$ and $n=0$, giving $2$ identical integer roots. Therefore, there are $4$ distinct positive values of $k.$ Multiplying that by $2$ to take the negative values into account, we get $\cdot2=\boxed{\textbf{(B) }8}$ values of $k$.

*~pianoboy*
## Solution 3 (Pythagorean Triples)
Proceed similar to Solution 2 and deduce that the discriminant of $x^{2}+kx+36$ must be a perfect square greater than $0$ to satisfy all given conditions. Seeing something like $k^2-144$ might remind us of a right triangle, where $k$ is the hypotenuse, and $12$ is a leg. There are four ways we could have this: a $9-$12-$15$ triangle, a $12-$16-$20$ triangle, a $5-$12-$13$ triangle, and a $12-$35-$37$ triangle.

Multiply by $2$ to account for negative $k$ values (since $k$ is being squared), and our answer is $\boxed{\textbf{(B) }8}$.
## Solution 4
Since $36 = \cdot3^2$, that means there are $(2+1)(2+1) = 9$ possible factors of $36$. Since $6 \cdot 6$ violates the distinct root condition, subtract $1$ from $9$ to get $8$. Each sum is counted twice, and we count of those twice for negatives. This cancels out, so we get $\boxed{\textbf{(B) }8}$.

*~songmath20  Edited 5.1.2023*
## Solution 5 (Discriminant and Factor Rainbow)
Since to have two solutions, the discriminant must be greater than $0$, $k^2 - 144 > 0$ so k must be greater than $12$ or less than $-12$(since it's squared). Next, we know that when factoring, the two numbers must multiply to $36$. So you can create a factor rainbow(remember from elementary school) which has the pairs of integers that multiply to $36( 1, 2, 3, 4, 6, 6, 9, 12, 18, 36 )$ (you just look at the position and the one on the opposite side, for example $2$ is the second value, and $18$ is the second last value, and they multiply to 36). See that there are $4$ pairs of values which add up to greater than $1$2($6+6$ is equal to $12,$ not greater), and we look at the negative values of them too(since k is squared) we get $\boxed{\textbf{(B) }8}$ total values.

*~SIGMAMATHEMATICIAN*
## Video Solution (⚡️Lightning Fast⚡️)
https://youtu.be/WX871JJbdY4

*~Education, the Study of Everything*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## Video Solution by Interstigation
https://youtu.be/_KNR0JV5rdI?t=679
## Video Solution by Math4All999
https://youtube.com/watch?v=cnUq_Op3YzY&feature=shared
## Video Solution by Gavin Does Math
https://youtu.be/1qO3eejxuPo
## See Also
