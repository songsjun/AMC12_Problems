# 2025 AMC 12A Problem 23

> This problem is the same as [2025 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10A_Problems/Problem_24) and [2025 AMC 12A #23](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12A_Problems/Problem_23).
## Problem
Call a positive integer fair if no digit is used more than once, it has no $0s$, and no digit is adjacent to two greater digits. For example, 196, 23 and 12463 are fair, but 1546, 320, and 34321 are not. How many fair positive integers are there?

$\textbf{(A) } 511 \qquad \textbf{(B) } 2584 \qquad \textbf{(C) } 9841 \qquad \textbf{(D) } 17711 \qquad \textbf{(E) } 19682$
## Solution 1
For any chosen set of $n$ digits, a fair integer has no local minimum. Start with the largest chosen digit. Insert the next-largest digit either to the left or to the right of the existing string; repeat for every smaller chosen digit. This produces every fair arrangement exactly once, so there are $2^{n-1}$ fair arrangements of a fixed set of $n$ digits.

There are $\binom{9}{n}$ ways to choose those digits. Hence the number of fair $n$-digit integers is

$$
\binom{9}{n}2^{n-1}.
$$

Summing over all possible lengths gives

$$
\begin{aligned}
\sum_{n=1}^{9}\binom{9}{n}2^{n-1}
&=\frac12\left(\sum_{n=0}^{9}\binom{9}{n}2^n-1\right)\\
&=\frac12\left((1+2)^9-1\right)\\
&=\frac{19683-1}{2}=9841.
\end{aligned}
$$

Therefore the answer is $\boxed{\textbf{(C)}\ 9841}$.
## Solution 2
Note every $\textit{fair}$ number will have an increasing string of digits, a maximum digit, then a decreasing string of digits. This is because if it decreases then increases, then the digit in the middle will be less than its adjacent digits.

Let n be the maximum digit. For each number i, we may either place i before n, after n, or choose not to include it. Note this process will result in a unique number for every case, as the numbers before n must be in increasing order, and the numbers after n must be in decreasing order. Therefore, for each number n, we have $3^{n-1}$ cases. Since n $\in\{1,2,\cdots9\}$, we have: $\sum_{n=1}^9 3^{n-1}=\frac{3^9-1}{3-1}=\boxed{9841}.$ ~SilverRush
## Solution 2.5 (Cheese, Goldilocks Zone)
If you consider options D and E too large, and A and B too small, then C is your answer. $\boxed$ {$\text$ {(C) } 9841} Also E is twice C so C is your answer - Ameen Patel IrvingtonHighSchoolMathGeeks -Edited by TFEA ~Minor edits by Sophia866 ~I saw this :)
## Solution 3 (Recursion)
Let f(n) be the number of fair integers given an arbitrary set of n digits. Let a be the smallest of these digits. Notice that a is either the first or last digit, as if it were any other digit, the two digits surroudning it would both be greater. Then, notice that if the remaining $n-1$ slots form a fair number, so does the number when a is appended. Therefore, $f(n) = 2f(n-1$). From here, we may proceed with the calculation in Solution 1 to get the answer of $\boxed$ {$\text$ {(C) } 9841} ~ Shadowleafy
## Solution 4 (Two for one)
For any fair integer n, we write some 9-digit base-3 number(s) f(n)=$\left(\overline{d_1 d_2 \ldots d_9}\right)_3$ from left to right as follows: * $d_k=0$ if k is not in n; * $d_k=1$ if k is the to the left of all digits greater than k in n; * $d_k=2$ if k is the to the right of all digits greater than k in n. Note that the fairness ensured one and only one of the above three cases happens. Now if k is the largest digit in n then $d_k$ can be either 1 or 2. An example: If $n=136852$, then f(n)=$\overline{121021010}_3$ or $\overline{121021020}_3.$ It's easy to see that there is a 1-to-2 mapping from all fair integers to all 9-digit base-3 nonzero numbers. Therefore the answer is $\frac{3^9-1}{2}.$ ~ asops
## Video Solution 1 (In 2 Mins)
https://youtu.be/hYZkrBtIFvI?si=dMOaGsXSpxYV17PO ~ Pi Academy
## Video Solution 2 by OmegaLearn.org
https://youtu.be/fo1IdZ9ng98
## Video Solution 3 by StressedPineapple
https://youtube.com/watch?v=NWBPm3lThH4&t=457s
## Video Solution 4 by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution by Thinking Feet
https://youtu.be/Qog3Y-QQFkg
## See Also
