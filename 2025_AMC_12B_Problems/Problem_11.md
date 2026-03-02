# 2025 AMC 12B Problem 11

> This problem is the same as [2025 AMC 10B #14](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10B_Problems/Problem_14) and [2025 AMC 12B #11](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12B_Problems/Problem_11).
## Problem
Nine athletes, no two of whom are the same height, try out for the basketball team. One at a time, they draw a wristband at random, without replacement, from a bag containing 3 blue bands, 3 red bands, and 3 green bands. They are divided into a blue group, a red group, and a green group. The tallest member of each group is named the group captain. What is the probability that the group captains are the three tallest athletes?

$\textbf{(A) } \dfrac{2}{9} \qquad \textbf{(B) } \dfrac{2}{7} \qquad \textbf{(C) } \dfrac{9}{28} \qquad \textbf{(D) } \dfrac{1}{3} \qquad \textbf{(E) } \dfrac{3}{8}$
## Solution 1
We will arrange the nine athletes in a line, with the first three being in the blue group, the next three being in the red group, and the last three being in the green group. Suppose the three tallest athletes are named A, B, C, in some order.

We have 3! ways to choose which group each of these athletes can be in. We then have 3 $\cdot 3 \cdot 3$ ways to determine which of the three positions in that group they can take. From here, we must distribute the remaining six athletes in the remaining six spaces, which can be done in 6! ways.

There are therefore 6 $\cdot 27 \cdot 6$! favorable outcomes. There are also 9! total ways to arrange the athletes with no restrictions. Our answer is $\frac{6 \cdot 27 \cdot 6!}{9!} = \frac{6 \cdot 27}{9 \cdot 8 \cdot 7} = \boxed{\textbf{(C) }\frac{9}{28}}.$

*~lprado*
## Solution 2
Let the three tallest athletes be $A_1$ (tallest), $A_2$ (second-tallest), and $A_3$ (third-tallest).

The condition "the captains are $A_1, A_$2, $\text{and } A_3$" is equivalent to the condition "$A_1, A_$2, $\text{and } A_3$ must all be in different-colored groups." We can find this probability by considering them drawing bands sequentially.
Athlete $A_1$ (Tallest): $A_1$ draws a band. It can be any of the 9 bands. $A_1$ will always be a captain, so the probability is 1. We now have 8 bands left.
Athlete $A_2$ (2nd Tallest): $A_2$ must draw a band of a different color than $A_1$.
There are 8 bands left in the bag.
$A_1$ took one band, so 2 bands of that color remain.
The other 6 bands (3 of one color, 3 of another) are "good" bands for $A_2$.
The probability of $A_2$ drawing a different color is P($A_2) = \frac{6}{8}.$ Athlete $A_3$ (3rd Tallest): $A_3$ must draw a band of the third, remaining color.
We assume $A_1$ and $A_2$ were successful, so there are 7 bands left.
$A_1$ took a band of color 1. $A_2$ took a band of color 2.
There are 3 bands of color 3 (the "good" color) still in the bag.
The probability of $A_3$ drawing the last color is P($A_3) = \frac{3}{7}.$
The total probability is the product of these independent probabilities:
 P($\text{Total}) = P(A_1) \times P(A_2) \times P(A_3)$
 P($\text{Total}) = 1 \times \frac{6}{8} \times \frac{3}{7} = \frac{18}{56}$
Simplifying the fraction:
$$\frac{18}{56} = \frac{9}{28}$$

The correct option is (C).
*~Jonathanmo*
## Solution 3 (Counting)
There are $\binom{9}{3}\binom{6}{3}$ ways to assign rubber bands to the athletes. Now we have to find the number of ways for the team captains to be the 3 tallest people. Each of the 3 tallest people must have a different rubber band color, and there are 3! = 6 ways to permute their individual rubber band colors.

For the other 6 people, there are $\binom{6}{2}\binom{4}{2}$ ways to assign rubber bands to them.

Thus, our probability is $\frac{3! \cdot \binom{6}{2}\binom{4}{2}}{\binom{9}{3}\binom{6}{3}} = \boxed{\textbf{(C)}\hspace{3pt}\frac{9}{28}}.$

*~Milkdrinker*
## Solution 4 (similar to Solution 3)
We have $\binom{9}{3}\cdot \binom{6}{3}\cdot \binom{3}{3}=1680$ ways to select the people in each team, and we must divide by 3! ways to order the teams. This gives us $\frac{1680}{3!}=280$ total ways to create the teams.

To have the three team captains be the tallest, we need them to be in separate teams. There is 1 way to do this, and then we have 6 people remaining. There are $\binom{6}{2}\cdot \binom{4}{2}\cdot \binom{2}{2} = 90$ ways to place two more people on each team.

Our probability is $\frac{90}{280} = \boxed{\textbf{(C)} \frac{9}{28}}.$
*~OlympiadMaster*
## Solution 5
Assume the tallest person is in the red group. Then the second person has 6 spots to go out of 8 remaining (1 was taken away). Then the third tallest person has 3 spots to go out of 7 remaining. $\frac{6}{8} \cdot \frac{3}{7}$ is the same as $\boxed{\textbf{(C) }\frac{9}{28}}.$

*~fastone*
## Solution 6 (cheese)
Upon realizing that the denominator is a multiple of 7, and that there are a bunch of 3's in the numerator (just do some C&P with the right logic that could even be a bit flawed) we can make an educated guess that the answer must be $\boxed{\textbf{(C) }\frac{9}{28}}.$

*~vaishnav*
## Solution 7 (Fast, like Solution 5)
WLOG, assume that the three tallest people are the first ones to draw. Irrespective of where the first person goes, the probability that the second and third person go on different teams is
$\frac{6}{8}$ and $\frac{3}{7},$ respectively, yielding
$$\boxed{\textbf{(C) }\frac{9}{28}}.$$

*~AlgeBruh16*
## Solultion 8
We can visualize the nine athletes as a 3 $\times 3$ grid, where each row represents a color group and each row contains 3 positions. We want the three tallest athletes to become captains. This happens exactly when each of the three tallest athletes occupies a different row.

Total ways to choose positions for the three tallest athletes: $\binom{9}{3} = 84$

Favorable ways (exactly one of the three tallest athletes in each row): $3^3=27$

Thus, our probability is $\frac{27}{84} = \boxed{\textbf{(C) }\frac{9}{28}}.$

*~MathKing555*
## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=-AZDidEroIo
*~Pi Academy*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=dLSWVrrKsgs
## See Also
