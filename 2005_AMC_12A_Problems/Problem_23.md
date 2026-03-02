# 2005 AMC 12A Problem 23

## Problem
Two distinct numbers a and b are chosen randomly from the set $\{2, 2^2, 2^3, \ldots, 2^{25}\}$. What is the probability that $\log_{a}$b is an integer?


$$\mathrm{(A)}\ \frac{2}{25}\qquad \mathrm{(B)}\ \frac{31}{300}\qquad \mathrm{(C)}\ \frac{13}{100}\qquad \mathrm{(D)}\ \frac{7}{50}\qquad \mathrm{(E)}\ \frac{1}{2}$$

## Solution
Let $\log_{a}$b = z, so a^z = b. Define $a = 2^x$, $b = 2^y$; then $\left(2^x\right)^z = 2^{xz}= 2^y,$ so x \mid y. Here we can just make a table and count the number of values of y per value of x. The largest possible value of x is 12, and so we get $\sum_{x=1}^{12} \left\lfloor\frac{25}{x}-1\right\rfloor = 24 + 11 + 7 + 5 + 4 + 3 + 2 + 2 + 1 + 1 + 1 + 1 = 62.$

The total number of ways to pick two distinct numbers (where the order matters) is $\frac{25!}{(25-2)!}= 25 \cdot 24 = 600,$ so we get a probability of $\frac{62}{600} = \boxed{\textbf{(B) }\frac{31}{300}}.$
## See also
