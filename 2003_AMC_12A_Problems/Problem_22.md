# 2003 AMC 12A Problem 22

## Problem
Objects A and B move simultaneously in the coordinate plane via a sequence of steps, each of length one. Object A starts at (0,0) and each of its steps is either right or up, both equally likely. Object B starts at (5,7) and each of its steps is either to the left or down, both equally likely. Which of the following is closest to the probability that the objects meet?


$$\mathrm{(A)} \ 0.10 \qquad \mathrm{(B)} \ 0.15 \qquad \mathrm{(C)} \ 0.20 \qquad \mathrm{(D)} \ 0.25 \qquad \mathrm{(E)} \ 0.30 \qquad$$

## Solution 1
If A and B meet, their paths connect (0,0) and (5,7). There are $\binom{12}{5}=792$ such paths. Since the path is 12 units long, they must meet after each travels 6 units, so the probability is $\frac{792}{2^{6}\cdot 2^{6}} \approx 0.20 \Rightarrow \boxed{C}.$

Note: The number of paths, $\binom{12}{5}$ comes from the fact that there must be 5 ups/downs and 7 lefts/rights in one path. WLOG, for Object A, the number of paths would be the amount of combinations of the sequence of letters with 5 "U"s 7 "R"s (i.e. UUUUURRRRRRR). This is $\frac{12!}{5!7!},$ which is equivalent to $\binom{12}{5}.$
*~bearjere*
## Solution 2 (Generating Functions)
We know that the sum of the vertical steps must be equal to 7. We also know that they must take 6 steps each. Since moving vertically or horizontally is equally likely, we can write all the possible paths as a generating function:

$$P(x)=(x+1)^{12}$$

Where we need to extract the $x^5$ coefficient. By the binomial coefficient theorem, that term is $\binom{12}{5}=792$ paths. Since there are also $2^{12}$ paths, we have:


$$\frac{792}{2^{12}}=\frac{792}{4096}\approx\frac{800}{4000}\approx\boxed{\text{(C) } 0.20}$$

## Solution 3 (Alcumus)
Since there are twelve steps between (0,0) and (5,7), A and B can meet only after they have each moved six steps. The possible meeting places are $P_{0}$ = (0,6), $P_{1}$ = (1,5), $P_{2}$ = (2,4), $P_{3}=(3,3), P_{4}$ = (4,2), and $P_{5}$ = (5,1). Let $a_{i}$ and $b_{i}$ denote the number of paths to $P_{i}$ from (0,0) and (5,7), respectively. Since A has to take i steps to the right and B has to take $i+1$ steps down, the number of ways in which A and B can meet at $P_{i}isa_{i}\cdotb_{i}$ = $\binom{6}{i} \binom{6}{i+1}.$ Since A and B can each take $2^{6}$ paths in six steps, the probability that they meet is$\begin{align*}$

$$
&\sum_{i = 0}^{5}\displaystyle\left ( \frac{a_{i}}{2^{6}}\displaystyle\right)\displaystyle\left( \frac{b_{i}}{2^{6}} \displaystyle\right) \\
& \qquad = \frac{\binom{6}{0}\binom{6}{1} + \binom{6}{1}\binom{6}{2} + \binom{6}{2}\binom{6}{3}
+ \binom{6}{3}\binom{6}{4}+ \binom{6}{4}\binom{6}{5} + \binom{6}{5}\binom{6}{6}}{2^{12}}\\
& \qquad = \frac{99}{512} \\
& \qquad \approx \boxed{0.20}.
$$

$\end{align*}$
Solution 2:
Consider the $\binom{12}{5}$ walks that start at (0,0), end at (5,7), and consist of 12 steps, each one either up or to the right. There is a one-to-one correspondence between these walks and the set of (A,B)-paths where A and B meet. In particular, given one of the $\binom{12}{5}$ walks from (0,0) to (5,7), the path followed by A consists of the first six steps of the walk, and the path followed by B is obtained by starting at (5,7) and reversing the last six steps of the walk. There are $2^{6}$ paths that take 6 steps from (0,0) and $2^{6}$ paths that take 6 steps from (5,7), so there are $2^{12}$ pairs of paths that A and B can take. The probability that they meet is$\begin{align*}$

$$
P&=\frac{1}{2^{12}}\binom{12}{5}\\
&=\frac{1}{2^{12}}\frac{12\cdot 11 \cdot 10 \cdot 9 \cdot 8}{5 \cdot 4 \cdot 3 \cdot 2 \cdot 1}\\
&=\frac{99}{2^9}.\\
$$

$\end{align*}$This is approximately 0.20, so the answer is $\boxed{C}.$
## See Also
