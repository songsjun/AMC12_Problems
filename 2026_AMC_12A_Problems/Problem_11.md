# 2026 AMC 12A Problem 11

> This problem is the same as [2026 AMC 10A #16](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_15) and [2026 AMC 12A #11](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_11).

## Problem
An urn contains $6$ red balls, $4$ black balls, and $4$ white balls. Suppose $7$ balls are drawn at random without replacement and a score is computed as follows:

- $1$ point is given for each red ball up to a maximum of $3$ points.

- $1$ point is given for each black ball up to a maximum of $2$ points.

- $1$ point is given for each white ball up to a maximum of $2$ points.

For example, drawing $1$ red ball, $4$ black balls, and $2$ white balls would earn a score of $1 + 2 + 2 = 5$. What is the probability of getting the lowest possible score?

$\textbf{(A)}\   \dfrac{1}{858}  \qquad 	\textbf{(B)}\   \dfrac{5}{3432}  \qquad 	\textbf{(C)}\   \dfrac{1}{312}  \qquad 	\textbf{(D)}\   \dfrac{2}{429}  \qquad 	\textbf{(E)}\   \dfrac{5}{264}$

## Solution 1
The minimum possible score is $4,$ which can occur by drawing $(R,B,W)=\{(6,0,1),(6,1,0),(0,4,3),(0,3,4)\}.$ Considering all balls to be distinct, the first two cases can occur in $2\cdot4\cdot7!$ (ordered) ways - $2$ ways to select black or white, $4$ ways to select the black/white ball, and $7!$ ways to order the $7$ resulting balls. The last two cases total to $2\cdot4\cdot7!.$

The answer is $\dfrac{2(2\cdot4\cdot7!)}{14\cdot13\cdot12\cdot11\cdot10\cdot9\cdot8}=\boxed{\text{(D) }\dfrac{2}{429}}$ 

Note: You can think of each case as already having the max amount of balls of a single color and then choosing from the remainder of the balls to get to 4 points. For example: you already have 6 red balls => then you have to choose 1 more ball that gives 1 point. Since all the remaining balls give one point, there are 8 ways(for 8 remaining balls) to do this. If you had 4 black balls, you would have needed 2 more points so you can choose accordingly from the red set of balls.

-Amon26
~Tacos_are_yummy_1
~chrislakee: The only hard question on this test imo

## Solution 2 (Casework)
As explained in the previous solution, the minimum possible score is $4,$ which can occur by drawing $6$ red's with any other color, or $4$ blacks and $3$ whites, or $4$ whites and $3$ black. There are $\binom{14}{7}$ ways to choose 7 balls from a group of 14, and we can now do casework. For the case with 6 reds and 1 of any other color, there are $\binom{6}{6}\cdot \binom{8}{1}=8$, cases. For the other 2 cases, which are symmetric, there are a total of $2\binom{4}{4}\cdot \binom{4}{3}=8$ valid combinations. Thus, we have $\frac{8+8}{\binom{14}{7}}=\frac{16\cdot 7\cdot 6\cdot 5\cdot 4\cdot 3\cdot 2}{14\cdot 13\cdot 12\cdot 11\cdot 10\cdot 9\cdot 8}$. Cancelling terms, we find the fraction simplifies to $\frac{2}{13\cdot 11\cdot 3}=\frac{2}{429}$, so the answer is $\boxed{\textbf{(D)}}$

~Voidling

## Solution 3
It is not hard to see that after experimentation that we can achieve a minimal score with:
- 6 red, 1 white or black
- 3 white and 4 black, or 4 white and 3 black
Now suppose we line up all 14 balls in a row from left to right. When we draw our first ball in the problem, we pick the leftmost ball, and then we pick the next leftmost ball, and so on. Now let us split into cases:

- $\textbf{6 red, 1 white or black}$: We want all 6 red balls and 1 white or black ball to be in the 7 leftmost balls. We have $2 \cdot 7 = 14$ ways to do this. Then for the 7 rightmost balls, we have $\binom{7}{3}=35$ ways of rearranging them and so we have $14 \cdot 35$ ways for this case.

- $\textbf{3 white and 4 black, or 4 white and 3 black}$: This is symmetrical to the last case (just swap the 7 leftmost balls with the 7 rightmost balls), so we have $14 \cdot 35$ ways for this case. 

The number of ways to arrange all 14 balls in our row is $\frac{14!}{6! \cdot 4! \cdot 4!}$, and so our desired probability is $\frac{2 \cdot 14 \cdot 35}{\frac{14!}{6! \cdot 4! \cdot 4!}}=\boxed{\textbf{(D)}~\frac{2}{429}}$.

~Baihly2024

~MATHGURU2015 minor edit to fix the number of the final answer

## Video Solution by TechMath Thinker (2.5 mins)
https://youtu.be/7hBDU2LNWrs

~midnight_rain

## Solution 4 (BS Cheese)
As before, the optimal cases are either six red or no red (white and black naturally follow, though this cheese doesn't actually use them). There are likely two distractors to account for the correct value for only one of the cases. If this is true, there is a set of 3 answer choices where two sum to the third, since these cases are mutually exclusive and cover all valid minimums.

Now, converting each of the fractions to common denominator 3432 to analyze: 

$$
\textbf{(A)}\   \dfrac{4}{3432}  \qquad 	\textbf{(B)}\   \dfrac{5}{3432}  \qquad 	\textbf{(C)}\   \dfrac{11}{3432}  \qquad 	\textbf{(D)}\   \dfrac{16}{3432}  \qquad 	\textbf{(E)}\   \dfrac{65}{3432}
$$



Notably, the only set of 3 choices that have this property are choices $\textbf{(B)}$, $\textbf{(C)}$, and $\textbf{(D)}$. The correct answer corresponds to the sum, $\boxed{\textbf{(D)}\   \dfrac{2}{429}}$.

~megaboy6679

Did you actually use this method

~randomuser456

yes, but only to double check lol

## Solution 5 (Very Easy)
We can see that the minimum amount of points obtained is 4, which can be obtained in two cases. The first case is using all 6 red balls and one of the black or white balls. Since there are 8 black or white balls, there are 8 cases for that. The second case is using only black and white balls. Since we are picking 7 out of the 8 black or white balls, we leave one ball out, and there are 8 ball choices to leave out. Since case 1 has 8 possibilities and case 2 has another 8, and the total possibilities is $\binom{14}{7}$, we get $\boxed{\frac{16}{3432}=\frac{2}{429}}$, which is choice $\boxed{\text{(D)}}$.
-Neo
##### Love this one ~PeetahUndebrethale
## Solution 6 (pure probability, not assumed to be distinct)
The probability of the first case occurring in one order, 6 red and 1 of either colors, can be found with this:

$\frac{6}{14} \cdot \frac{5}{13} \cdot \frac{4}{12} \cdot \frac{3}{11} \cdot \frac{2}{10} \cdot \frac{1}{9} \cdot \frac{8}{8}= \frac{1}{3003}$ and then multiply by 7 to get $\frac{1}{429}$, the actual probability of the first case occurring, because there's $\binom{7}{6} = 7$ orders that the events could've happened in.

The probability of the second case occurring in one order, 4 black and 3 white, can be found with this:
$\frac{4}{14} \cdot \frac{3}{13} \cdot \frac{2}{12} \cdot \frac{1}{11} \cdot \frac{4}{10} \cdot \frac{3}{9} \cdot \frac{2}{8} = \frac{1}{30030}$ and then multiply by $\binom{7}{4} = 35$. We also know that the third case, 4 white and 3 black, has the same probability of the second case, so we can do $\frac{1}{30030} \cdot 35 \cdot 2 = \frac{1}{429}$

Therefore the probability is $\boxed{\textbf{(D)}\   \dfrac{2}{429}}$.

~iambaconiamgod

## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ

## Video Solution 2 by MathWhile
https://youtu.be/dok7Q3Hj3r4?t=8
