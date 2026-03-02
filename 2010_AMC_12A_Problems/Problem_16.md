# 2010 AMC 12A Problem 16

> This problem is the same as [2010 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12A_Problems) and [2010 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10A_Problems).
## Problem
Bernardo randomly picks 3 distinct numbers from the set $\{1,2,3,...,7,8,9\}$ and arranges them in descending order to form a 3-digit number. Silvia randomly picks 3 distinct numbers from the set $\{1,2,3,...,6,7,8\}$ and also arranges them in descending order to form a 3-digit number. What is the probability that Bernardo's number is larger than Silvia's number?

$\textbf{(A)}\ \frac{47}{72} \qquad \textbf{(B)}\ \frac{37}{56} \qquad \textbf{(C)}\ \frac{2}{3} \qquad \textbf{(D)}\ \frac{49}{72} \qquad \textbf{(E)}\ \frac{39}{56}$
## Solution 1
We can solve this by breaking the problem down into 2 cases and adding up the probabilities.

Case 1: Bernardo picks 9.
If Bernardo picks a 9 then it is guaranteed that his number will be larger than Silvia's. The probability that he will pick a 9 is $\frac{1 \cdot \binom{8}{2}}{\binom{9}{3}} = \frac{\frac{8\cdot7}{2}}{\frac{9\cdot8\cdot7}{3\cdot2\cdot1}}=\frac{1}{3}.$

Case 2: Bernardo does not pick 9.
Since the chance of Bernardo picking 9 is $\frac{1}{3},$ the probability of not picking 9 is $\frac{2}{3}.$

If Bernardo does not pick 9, then he can pick any number from 1 to 8. Since Bernardo is picking from the same set of numbers as Silvia, the probability that Bernardo's number is larger is equal to the probability that Silvia's number is larger.

Ignoring the 9 for now, the probability that they will pick the same number is the number of ways to pick Bernardo's 3 numbers divided by the number of ways to pick any 3 numbers.

We get this probability to be $\frac{3!}{8\cdot{7}\cdot{6}} = \frac{1}{56}$

The probability of Bernardo's number being greater is
$$\frac{1-\frac{1}{56}}{2} = \frac{55}{112}$$

Factoring the fact that Bernardo could've picked a 9 but didn't:

$$\frac{2}{3}\cdot{\frac{55}{112}} = \frac{55}{168}$$

Adding up the two cases we get $\frac{1}{3}+\frac{55}{168} = \boxed{\frac{37}{56}\ \textbf{(B)}}$
### Note
We have for case 1: $\frac{1 \cdot \binom{8}{2}}{\binom{9}{3}}$ since 1 is the number of ways to pick 9 and $\binom{8}{2}$ is the number of ways to pick the other 2 numbers. $\binom{9}{3}$ means to choose 3 numbers from 9.

*~mathboy282*

A common pitfall is saying that the probability of picking the same number is $\frac{8*7*6}{(8*7*6)^2}.$ This actually undercounts. Note that picking 3,7,6 will lead to the same end result as picking 7,3,6 (order does not matter, since it will be descending no matter what). Thus, we multiply by 3! :)

*~smartguy888*
## Solution 2
From Bernardo's set, there are $\binom{9}{3} = 84$ numbers that he can randomly choose. From Silvia's set, there are
$\binom{8}{3} = 56$ numbers that she can randomly choose. Since Bernardo and Silvia can choose their numbers independently, there are 84 $\cdot 56$ pairs of numbers that you can compare. For example, if Bernardo chooses 321 and Silvia chooses 543, that is one pair. We can sort Bernardo's numbers from the greatest to the smallest. We can do the same for Silvia's numbers. So, Bernardo's greatest 84 - 56 = 28 numbers are all bigger than Silvia's numbers. Here, we have 28 $\cdot 56$ pairs satisfying that Bernardo's number will be greater than Silvia's. If Bernardo chooses the 29th greatest number, which is the same as Silvia's greatest number, hence there will be 56 - 1 = 55 pairs satisfying that Bernardo's 29th greatest number will be greater than Silvia's. Similarly, if Bernardo chooses the 30th greatest number, there will be 55 - 1 = 54 pairs satisfying that Bernardo's 30th greatest number will be greater than Silvia's. This pattern continues. So if Bernardo chooses the 29th greatest number or below, he will have 55 + 54 + 53 + $\cdots + 1$ pairs where his number will be greater than Silvia's.

In total, Bernardo's probability of having a greater number than Silvia's is $\frac{28 \cdot 56 + (55 + 54 + 53 + \cdots + 1)}{84 \cdot 56} = \frac{37}{56},$ which is $\textbf{(B)}.$

- Leo M.
## Solution 3
Two cases:

1st: Bernado gets a nine, there are in total $\binom{8}{2}\cdot \binom{8}{3}=1568$ ways such Bernado gets a bigger number

2nd: Both of them get numbers from one to eight, because of symmetry, they have equal chance of getting a bigger number. Thus, there are $\frac{(\binom{8}{3})^2-\binom{8}{3}}{2}=1540$ ways

And there are in total $\binom{9}{3}\cdot \binom{8}{3}$ ways to pick numbers, the possibility is $\frac{1568+1540}{4704}=\frac{37}{56}$

*~bluesoul*
## Video Solution by Pi Academy
https://youtu.be/-Yev19cGmZU?si=bmph0RbqUej4k5tO

*~Pi Academy*
## Other Video Solutions
https://youtu.be/rsURe5Xh-j0?t=590

*~IceMatrix*

https://youtu.be/dT5EM8K8o2c

*~savannahsolve*
## See also
