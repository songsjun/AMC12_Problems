# 2026 AMC 12A Problem 13

## Problem
A board has $4$ spaces in a row, which can be filled with numbers. The sides of a fair, $8$-sided die are numbered $1$ through $8$. David rolls the die $4$ times. After each roll, he randomly chooses an empty spot to write the number shown on the die. What is the probability that the numbers on the board form a strictly increasing sequence when read from left to right?

$\textbf{(A) } \frac{1}{128} \qquad\textbf{(B) } \frac{5}{432} \qquad\textbf{(C) } \frac{35}{2048} \qquad\textbf{(D) } \frac{35}{1024} \qquad\textbf{(E) } \frac{1}{24}$

## Solution
Notice that this is equivalent to just independently choosing a random number in each of the four places. The number of orderings where the numbers on the board form a strictly increasing sequence is just the number of ways to choose $4$ distinct numbers from the set of $8$ numbers (since each selection corresponds to a unique valid strictly increasing ordering). Therefore, the answer is


$$
\frac{\binom{8}{4}}{8^4}=\frac{8\cdot 7\cdot 6\cdot 5}{8^4\cdot 24}=\frac{70}{2^{12}}=\frac{35}{2048}
$$


so the answer is $\boxed{\textbf{(C)}}$.

~ [eevee9406](https://artofproblemsolving.com/wiki/index.php/User:Eevee9406)

## Alternative Solution
The probability that David rolls four different numbers is $\left(\frac{8}{8}\right)\left(\frac{7}{8}\right)\left(\frac{6}{8}\right)\left(\frac{5}{8}\right)$.

There's only one right order out of 24 orders ($4!$), so the probability that they are in the right order is $\frac{1}{24}$.

Multiplying, we get $\boxed{\textbf{(C) } \frac{35}{2048}}$.

~ [ShockFish](https://artofproblemsolving.com/wiki/index.php/User:ShockFish)

## Alternative Solution 2
We can immediately see that the largest possible first digit is $5$, so we will find the number of correct orderings for each unique first digit $\leq 5$.

To start, the only valid ordering for the case where the first digit is $5$ is $5, 6, 7, 8$.

We look at the case where the first number is $4$, and we can see that the remaining $3$ numbers must be selected out of ${5, 6, 7, 8}$. Notice that selecting an ordering whilst satisfying the condition that they must be in strictly increasing order is the same as choosing to exclude $1$ number, as the $3$ numbers that remain only have one order in which they are strictly increasing. Thus the number of orderings where the first digit is $4$ is $\binom{4}{1}$. (The simpler logic is just choosing $3$ of the $4$ numbers and doing $\binom{n}{3}$ for each case, but these two are logically equivalent)

We can generalize this to the remaining cases of the first digit being $3, 2,$ or $1$. If $3$ is the first digit, then the number of correct orderings is the same as the number of combinations where we exclude $2$ numbers from the $5$ numbers that are bigger than $3$, which is $\binom{5}{2}$.

Thus, the total number of correct orderings will be $1+\binom{4}{1}+\binom{5}{2}+\binom{6}{3}+\binom{7}{4}=70$.

The total number of possible orderings is ${8^4}=4096$, so the probability will be $\frac{70}{4096}=\boxed{\textbf{(C) } \frac{35}{2048}}$.

~ bread782

## Remark
Answers $\textbf{(B)}$ and $\textbf{(E)}$ are sus because they have denominators that are multiples of 3, but the dice has 8 sides

~iambaconiamgod

## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
