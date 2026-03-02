# 2018 AMC 12B Problem 22

## Problem
Consider polynomials P(x) of degree at most 3, each of whose coefficients is an element of $\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9\}$. How many such polynomials satisfy P(-1) = -9?

$\textbf{(A) } 110 \qquad \textbf{(B) } 143 \qquad \textbf{(C) } 165 \qquad \textbf{(D) } 220 \qquad \textbf{(E) } 286$
## Solution 1 (Stars and Bars)
Suppose that $P(x)=ax^3+bx^2+cx+d.$ This problem is equivalent to counting the ordered quadruples (a,b,c,d), where all of a,b,c, and d are integers from 0 through 9 such that P(-1)=-a+b-c+d=-9. Let a'=9-a and c'=9-c. Note that both of a' and c' are integers from 0 through 9. Moreover, the ordered quadruples (a,b,c,d) and the ordered quadruples (a',b,c',d) have one-to-one correspondence.

We rewrite the given equation as (9-a)+b+(9-c)+$d=9$, or a'+b+c'+$d=9$. By the stars and bars argument, there are $\binom{9+4-1}{4-1}=\boxed{\textbf{(D) } 220}$ ordered quadruples (a',b,c',d).

*~pieater314159 ~MRENTHUSIASM*
## Solution 2 (Casework)
Suppose that $P(x)=ax^3+bx^2+cx+d.$ This problem is equivalent to counting the ordered quadruples (a,b,c,d), where all of a,b,c, and d are integers from 0 through 9 such that P(-1)=-a+b-c+d=-9, which rearranges to b+$d+9$=a+c.
Note that b+$d+9$ is an integer from 9 through 27, and a+c is an integer from 0 through 18. Therefore, both of b+$d+9$ and a+c are integers from 9 through 18. We construct the following table:

$$
\begin{array}{c|c|c|c||c} & & & & \\ [-2.5ex] \boldsymbol{b+d} & \boldsymbol{\#}\textbf{ of Ordered Pairs }\boldsymbol{(b,d)} & \boldsymbol{a+c} & \boldsymbol{\#}\textbf{ of Ordered Pairs }\boldsymbol{(a,c)} & \boldsymbol{\#}\textbf{ of Ordered Quadruples }\boldsymbol{(a,b,c,d)} \\ [0.5ex] \hline & & & & \\ [-2ex] 0 & 1 & 9 & 10 & 1\cdot10=10 \\ 1 & 2 & 10 & 9 & \phantom{0}2\cdot9=18 \\ 2 & 3 & 11 & 8 & \phantom{0}3\cdot8=24 \\ 3 & 4 & 12 & 7 & \phantom{0}4\cdot7=28 \\ 4 & 5 & 13 & 6 & \phantom{0}5\cdot6=30 \\ 5 & 6 & 14 & 5 & \phantom{0}6\cdot5=30 \\ 6 & 7 & 15 & 4 & \phantom{0}7\cdot4=28 \\ 7 & 8 & 16 & 3 & \phantom{0}8\cdot3=24 \\ 8 & 9 & 17 & 2 & \phantom{0}9\cdot2=18 \\ 9 & 10 & 18 & 1 & 10\cdot1=10 \end{array}
$$

We sum up the counts in the last column to get the answer $2\cdot(10+18+24+28+30)=\boxed{\textbf{(D) } 220}.$

*~BJHHar ~MRENTHUSIASM*
## See Also
