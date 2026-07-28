# 2025 AMC 12A Problem 13

## Problem
Let C = $\{1, 2, 3, \dots, 13\}$. Let N be the greatest integer such that there exists a subset of C with N elements that does not contain five consecutive integers. Suppose N integers are chosen at random from C without replacement. What is the probability that the chosen elements do not include five consecutive integers?

$\textbf{(A)}~\frac{3}{130} \qquad \textbf{(B)}~\frac{3}{143} \qquad \textbf{(C)}~\frac{5}{143} \qquad \textbf{(D)}~\frac{1}{26} \qquad \textbf{(E)}~\frac{5}{78}$
## Solution 1
Removing only one element cannot work: one of the two remaining end blocks has at least six consecutive integers. Removing 5 and 10 does work, leaving

$$
\{1,2,3,4,6,7,8,9,11,12,13\}.
$$

Thus the largest possible subset has $N=11$ elements. Let $a<b$ be the two elements removed. To avoid a run of five consecutive integers, we need

$$
a\leq5,\qquad b-a\leq5,\qquad 14-b\leq5.
$$

The first and third inequalities give $a\leq5$ and $b\geq9$; together with $b\leq a+5$, the only possibilities are

$$
(a,b)=(4,9),\ (5,9),\ (5,10).
$$

There are therefore $3$ successful $11$-element subsets out of $\binom{13}{11}=\binom{13}{2}=78$ possible subsets. The desired probability is

$$
\frac{3}{78}=\boxed{\textbf{(D)}\ \frac{1}{26}}.
$$
## Solution 2
Trying to find a subset that satisfies the condition, we get $\{1,2,3,4,6,7,8,9,11,12,13\}$, which has N=11 elements. The subsets $\{1,2,3,5,6,7,8,10,11,12,13\}$ and $\{1,2,3,4,6,7,8,10,11,12,13\}$ also work. In total, we have 3 subsets and $\binom{13}{11}$ ways to choose 11 elements from C, so the probability is $\dfrac{3}{\binom{13}{11}} = \dfrac{1}{26}.$ Thus, the answer is $\boxed{\textbf{(D)}}$ ~anzhuPro
## Solution 3
First, let's find the number N: Consider if: N=13: It is impossible - It doesn't remove any integer, violating the condition "not contain five consecutive integers". N=12: It is also impossible, and still does not satisfy the condition. An example could be $\{1,2,3,4,6,7,8,9,10,11,12,13\}$. 1, 2, 3, and 4 doesn't violate the condition, but 6-13 are all consecutive, hence N can't be 12. N=11: This is possible, because $\dfrac{11}{3} = 3$ remainder 2. This means that we can have one string of consecutive length 3 and two strings of consecutive length 4. Hence, it could be either: *$\{1,2,3,5,6,7,8,10,11,12,13\}$ with consecutive integer lengths of (3, 4, 4). *$\{1,2,3,4,6,7,8,10,11,12,13\}$ with consecutive integer lengths of (4, 3, 4). *$\{1,2,3,4,6,7,8,9,11,12,13\}$ with consecutive integer lengths of (4, 4, 3). Thus giving 3 cases. The total ways of picking out 2 integers from a set of 13 is $\binom{13}{2} = 78.$ Hence, the probability is $\dfrac{3}{78} = \boxed{\dfrac{1}{26}}.$ Note: You can also consider the combinations of 1 string of consecutive length 3 and 2 strings of consecutive length 4. The length of 3 has 3 places to go, filling the rest 2 with 4 places each, giving 3/78 as well, resulting in the same answer. ~Mitsuihisashi14 Formatting and minor edits ~Logibyte
## Video Solution by Power Solve
https://www.youtube.com/watch?v=bpx-AaReYI8
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
