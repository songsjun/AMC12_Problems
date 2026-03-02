# 2024 AMC 12A Problem 11

> This problem is the same as [2024 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10A_Problems/Problem_18) and [2024 AMC 12A #11](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12A_Problems/Problem_11).
## Problem
There are exactly $K$ positive integers $b$ with $5 \leq b \leq 2024$ such that the base-$b$ integer $2024_b$ is divisible by $16$ (where $16$ is in base ten). What is the sum of the digits of $K$?

$\textbf{(A) }16\qquad\textbf{(B) }17\qquad\textbf{(C) }18\qquad\textbf{(D) }20\qquad\textbf{(E) }21$
## Solution 1
$2024_b = 2b^3+2b+4\equiv 0\pmod{16}\implies b^3+b+2\equiv 0\pmod 8$. If $b$ is even, then $b+2\equiv 0\pmod 8\implies b\equiv 6\pmod 8$. If $b$ is odd, then $b^2\equiv 1\pmod 8\implies b^3+b+2\equiv 2b+2\pmod 8$ so $2b+2\equiv 0\pmod 8\implies b+1\equiv 0\pmod 4\implies b\equiv 3,7\pmod 8$. Now $8\mid 2024$ so $\frac38\cdot 2024=759$ but one of the answers we got from that, $3$, is too small, so $759 - 1 = 758\implies\boxed{\textbf{(D) }20}$.

*~OronSH ~mathkiddus ~andliu766 ~megaboy6679 ~trevian1(minor edit for clarity)*
## Solution 2

$$
\begin{align*}
2024_b\equiv0\pmod{16} \\
2b^3+2b+4\equiv0\pmod{16} \\
b^3+b+2\equiv0\pmod8 \\
\end{align*}
$$


Clearly, $b$ is either even or odd. If $b$ is even, let $b=2a$.


$$
\begin{align*}
(2a)^3+2a+2\equiv0\pmod8 \\
8a^3+2a+2\equiv0\pmod8 \\
0+2a+2\equiv0\pmod8 \\
a+1\equiv0\pmod4 \\
a\equiv3\pmod4 \\
\end{align*}
$$


Thus, one solution is $b=2(4x+3)=8x+6$ for some integer $x$, or $b\equiv6\pmod8$.

What if $b$ is odd? Then let $b=2a+1$:


$$
\begin{align*}
(2a+1)^3+2a+1+2\equiv0\pmod8 \\
8a^3+12a^2+6a+1+2a+1+2\equiv0\pmod8 \\
8a^3+12a^2+8a+4\equiv0\pmod8 \\
4a^2+4\equiv0\pmod8 \\
a^2\equiv1\pmod2 \\
\end{align*}
$$


This simply states that $a$ is odd. Thus, the other solution is $b=2(2x+1)+1=4x+3$ for some integer $x$, or $b\equiv3\pmod4$.

We now simply must count the number of integers between $5$ and $2024$, inclusive, that are $6$ mod $8$ or $3$ mod $4$. Note that the former case comprises even numbers only while the latter is only odd; thus, there is no overlap and we can safely count the number of each and add them.

In the former case, we have the numbers $6,14,22,30,\dots,2022$; this list is equivalent to $8,16,24,32,\dots,2024\cong1,2,3,4,\dots,253$, which comprises $253$ numbers. In the latter case, we have the numbers $7,11,15,19,\dots,2023\cong4,8,12,16,\dots,2020\cong1,2,3,4,\dots,505$, which comprises $505$ numbers. There are $758$ numbers in total, so our answer is $\boxed{\textbf{(D) 20}}$.

*~Technodoggo*
## Solution 3
Note that $2024_b=2b^3+2b+4$ is to be divisible by $16$, which means that $b^3+b+2$ is divisible by $8$.

If $b=0$, then $b^3+b+2 \equiv (0)^3 + (0) + 2 \equiv 2$ is not divisible by $8$.

If $b=1$, then $b^3+b+2 \equiv (1)^3 + (1) + 2  \equiv 4$ is not divisible by $8$.

If $b=2$, then $b^3+b+2 \equiv (2)^3 + (2) + 2  \equiv 4$ is not divisible by $8$.

If $b=3$, then $b^3+b+2 \equiv (3)^3 + (3) + 2  \equiv (8+1)\cdot3 + (3) + 2 \equiv 0$ is divisible by $8$.

If $b=4$, then $b^3+b+2 \equiv (4)^3 + (4) + 2 \equiv 0 + 4 + 2 \equiv 6$ is not divisible by $8$.

If $b=5$, then $b^3+b+2 \equiv (-3)^3 + (-3) + 2 \equiv  (8+1)\cdot 3 + (-3) + 2 \equiv 2$ is not divisible by $8$.

If $b=6$, then $b^3+b+2 \equiv (-2)^3 + (-2) + 2 \equiv -8 + (-2) + 2 \equiv 0$ is divisible by $8$.

If $b=7$, then $b^3+b+2 \equiv (-1)^3 + (-1) + 2 \equiv -1 + (-1) + 2 \equiv 0$ is divisible by $8$.

Therefore, for every $8$ values of $b$, $3$ of them will make $b^3+b+2$ divisible by $8$. Therefore, since $2024$ is divisible by $8$, $\dfrac{3}{8}\cdot2024=759$ values of $b$, but this includes $b=3$, which does not satisfy the given inequality. Therefore, the answer is

$$759-1=758\rightarrow7+5+8=\boxed{\text{(D) }20}$$

*~Tacos_are_yummy_1*

More detail by ~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 4
$2024_b=2\ast\ b^3+2\ast\ b+4\ \\
$${2024}_{\left(b+8\right)}=2\ast\left(b+8\right)^3+2\ast\left(b+8\right)+4$$$
${2024}_{\left(b+8\right)}-{2024}_b=2*\left(8\right)*\left(b^2+8b+64\right)+2*8\ =16*\left(b^2+8b+64\right)+16$


$$
\begin{align*}
2024_{(b+8)}-2024_b\equiv0\ (mod\ 16)\\
2024_{(b+8)}\ \ \equiv2024_b\ \ (mod\ 16)\\
2024_0\equiv4\ (mod\ 16)\\
2024_1\equiv8\ (mod\ 16)\\
2024_2\equiv6\ (mod\ 16)\\
2024_3\equiv0(mod\ 16)\\
2024_4\equiv12(mod\ 16)\\
2024_5\equiv8(mod\ 16)\\
2024_6\equiv0(mod\ 16)\\
2024_7\equiv0(mod\ 16)\\
\end{align*}
$$


We need
$b\ \equiv3\ (mod\ 8)\ \ or\ b\ \equiv6\ (mod\ 8)\ \ or\ b\ \equiv7\ (mod\ 8) \\

$$\lfloor(2024-3)/8\rfloor+\lfloor(2024-6)/8\rfloor+\lfloor(2024-7)/8\rfloor+3=759$$$

take away one because $b=3$ is out of range, so $\Rightarrow7+8+5=\boxed{\text{(D) }20}$
### Solution 4.1: Alternate Ending
One can arrange 2024 into different "blocks" consisting of 8 numbers each, particularly $\{0,1,2,3,4,5,6,7\}$, $\{8,9,10,11,12,13,14,15\}$ ...

These just represent different $\mod(8)$ class residues. So, you can just divide 2024 by 8 blocks giving us 253 total blocks with 0 extra semi-blocks.

We see that $2024_3 \mod 8, 2024_6 \mod 8$, and $2024_7 \mod 8$ all appear exactly 253 times each, so we have $253 \times 3 = 759$ different values of $K$.

However, we must not include $2024_3$, as the bases $b$ range from $5 \le b \le 2024$, therefore we have $759-1=758$ cases.

Our answer is $7+5+8= \boxed{\text{(D) }20}$.

*~Pinotation (I did not do the solution above this remark)*
## Solution 5 (Factoring)
Start similar to other solutions.


$$b^3+b+2 \equiv 0\pmod 8$$


Except now we notice the following:


$$
\begin{align*}
b^3+8+b+2 \equiv 8\pmod 8 \equiv 0\pmod 8\\
(b+2)(b^2-2b+4) + b+2 \equiv 0\pmod 8\\
(b+2)(b^2-2b+5) \equiv 0\pmod 8\\
\end{align*}
$$


Notice that $b+2$ and $b^2-2b+5$ have opposite parity, and when multiplied, is divisible by $8$.
Thus, either $b+2$ or $b^2-2b+5$ is divisible by $8$.

$b+2$ is obvious, where $b+2 | 8$ when $b \equiv 6\pmod 8$

When testing for $b^2-2b+5 | 8$, we find $b \equiv 3, 7\pmod 8$

Proceed similar to the other solutions, $\lfloor\dfrac{3}{8} \cdot 2024\rfloor-1=759-1=758$, where $\boxed{\text{(D) }20}$

Also noting this is an example of a misplaced problem this would be far to easy for even P 18 of amc 10, deserved to be Q5-6

*~NSAoPS*
## Video Solution by [https://artofproblemsolving.com/wiki/index.php/User:grogg007 grogg007]
https://youtu.be/xDye0tT4oPc
## Video Solution by Power Solve
https://www.youtube.com/watch?v=qtFvaD9TEaA
## Video Solution by Pi Academy
https://youtu.be/fW7OGWee31c?si=oq7toGPh2QaksLHE
## Video Solution by SpreadTheMathLove
https://youtu.be/snp3Yo8rU-M?si=GHqpGqQs6Q0xM57j
## Video solution by TheNeuralMathAcademy
https://www.youtube.com/watch?v=4b_YLnyegtw&t=3726s
