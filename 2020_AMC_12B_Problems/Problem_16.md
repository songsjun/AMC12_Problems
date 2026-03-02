# 2020 AMC 12B Problem 16

> This problem is the same as [2020 AMC 10B #18](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #16](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
An urn contains one red ball and one blue ball. A box of extra red and blue balls lies nearby. George performs the following operation four times: he draws a ball from the urn at random and then takes a ball of the same color from the box and returns those two matching balls to the urn. After the four iterations the urn contains six balls. What is the probability that the urn contains three balls of each color?

$\textbf{(A) } \frac16 \qquad \textbf{(B) }\frac15 \qquad \textbf{(C) } \frac14 \qquad \textbf{(D) } \frac13 \qquad \textbf{(E) } \frac12$
## Solution 1 (The Shortcut Passed Every Barrier)
Suppose that we have a deck, currently containing just one black card. We then insert $n$ red cards one-by-one into the deck at random positions. It is easy to see using induction, that the black card is randomly situated in the deck.

Now, suppose that we have this deck again, with only one black card. Each time we pick a red ball, we place a card above the black card, and each time we pick a blue ball, we place a card below the black card. It is easy to see that the probability that the card is inserted into the top part of the deck is simply equal to the number of red balls divided by the total number of balls, and the probability that the card is inserted into the bottom part of the deck is equal to the number of blue balls divided by the total number of balls. Therefore, this is equivalent to inserting the card randomly into the deck.

Finally, four more red cards will be inserted into the deck, and so the black card can be in five possible positions. Only one corresponds to having three balls of each type. Our probability is thus $\frac{1}{5}$, and so the answer is $\boxed{\textbf{B}}$.

*~mathboy100*
## Solution 2
Let $R$ denote the action where George selects a red ball and $B$ denote the action where he selects a blue one. Now, in order to get $3$ balls of each color, he needs $2$ more of both $R$ and $B$.

There are 6 cases: $RRBB, RBRB, RBBR, BBRR, BRBR, BRRB$ (we can confirm that there are only $6$ since $\binom{4}{2}=6$). However we can clump $RRBB + BBRR$, $RBRB + BRBR$, and $RBBR + BRRB$ together since they are equivalent by symmetry.


$\textbf{CASE 1: }RRBB$ and $BBRR$

Let's find the probability that he picks the balls in the order of $RRBB$.

The probability that the first ball he picks is red is $\frac{1}{2}$.

Now there are $2$ reds and $1$ blue in the urn. The probability that he picks red again is now $\frac{2}{3}$.

There are $3$ reds and $1$ blue now. The probability that he picks a blue is $\frac{1}{4}$.

Finally, there are $3$ reds and $2$ blues. The probability that he picks a blue is $\frac{2}{5}$.

So the probability that the $RRBB$ case happens is $\frac{1}{2} \cdot \frac{2}{3} \cdot \frac{1}{4} \cdot \frac{2}{5} = \frac{1}{30}$. However, since the $BBRR$ case is the exact same by symmetry, case 1 has a probability of $\frac{1}{30} \cdot 2 = \frac{1}{15}$ chance of happening.


$\textbf{CASE 2: }RBRB$ and $BRBR$

Let's find the probability that he picks the balls in the order of $RBRB$.

The probability that the first ball he picks is red is $\frac{1}{2}$.

Now there are $2$ reds and $1$ blue in the urn. The probability that he picks blue is $\frac{1}{3}$.

There are $2$ reds and $2$ blues now. The probability that he picks a red is $\frac{1}{2}$.

Finally, there are $3$ reds and $2$ blues. The probability that he picks a blue is $\frac{2}{5}$.

So the probability that the $RBRB$ case happens is $\frac{1}{2} \cdot \frac{1}{3} \cdot \frac{1}{2} \cdot \frac{2}{5} = \frac{1}{30}$. However, since the $BRBR$ case is the exact same by symmetry, case 2 has a probability of $\frac{1}{30} \cdot 2 = \frac{1}{15}$ chance of happening.


$\textbf{CASE 3: }RBBR$ and $BRRB$

Let's find the probability that he picks the balls in the order of $RBBR$.

The probability that the first ball he picks is red is $\frac{1}{2}$.

Now there are $2$ reds and $1$ blue in the urn. The probability that he picks blue is $\frac{1}{3}$.

There are $2$ reds and $2$ blues now. The probability that he picks a blue is $\frac{1}{2}$.

Finally, there are $2$ reds and $3$ blues. The probability that he picks a red is $\frac{2}{5}$.

So the probability that the $RBBR$ case happens is $\frac{1}{2} \cdot \frac{1}{3} \cdot \frac{1}{2} \cdot \frac{2}{5} = \frac{1}{30}$. However, since the $BRRB$ case is the exact same by symmetry, case 3 has a probability of $\frac{1}{30} \cdot 2 = \frac{1}{15}$ chance of happening.

Adding up the cases, we have $\frac{1}{15}+\frac{1}{15}+\frac{1}{15}=\boxed{\textbf{(B) }\frac15}$ ~quacker88
## Solution 3
We know that we need to find the probability of adding 2 red and 2 blue balls in some order.
There are 6 ways to do this, since there are $\binom{4}{2}=6$ ways to arrange $RRBB$ in some order.
We will show that the probability for each of these 6 ways is the same.

We first note that the denominators should be counted by the same number. This number is $2 \cdot 3 \cdot 4 \cdot 5=120$. This is because 2, 3, 4, and 5 represent how many choices there are for the four steps. No matter what the $k-th$ step involves $k+1$ numbers to choose from.

The numerators are the number of successful operations. No matter the order, the first time a red is added will come from 1 choice and the second time will come from 2 choices, since that is how many reds are in the urn originally.
The same goes for the blue ones. The numerator must equal $(1 \cdot 2)^2$.

Therefore, the probability for each of the orderings of $RRBB$ is $\frac{4}{120}=\frac{1}{30}$. There are 6 of these, so the total probability is $\boxed{\bf{(B)} \frac{1}{5}}$.
## Solution 4
First, notice that when George chooses a ball he just adds another ball of the same color. On George's first move, he either chooses the red or the blue with a $\frac{1}{2}$ chance each. We can assume he chooses Red(chance $\frac{1}{2}$), and then multiply the final answer by two for symmetry. Now, there are two red balls and one blue ball in the urn. Then, he can either choose another Red(chance $\frac{2}{3}$), in which case he must choose two blues to get three of each, with probability $\frac{1}{4}\cdot\frac{2}{5}=\frac{1}{10}$ or a blue for two blue and two red in the urn, with chance $\frac{1}{3}$. If he chooses blue next, he can either choose a red then a blue, or a blue then a red. Each of these has a $\frac{1}{2}\cdot\frac{2}{5}$ for total of $\cdot\frac{1}{5}=\frac{2}{5}$. The total probability that he ends up with three red and three blue is $\cdot\frac{1}{2}(\frac{2}{3}\cdot\frac{1}{10}+\frac{1}{3}\cdot\frac{2}{5})=\frac{1}{15}+\frac{2}{15}=\boxed{\bf{(B)} \frac{1}{5}}$.

*~aop2014*
## Solution 4 Alternate
A solution pretty similar to the above is as follows.

Your only two cases of having 3R and 3B after 4 iterations are (without regard to order; if you do order, you multiply by 2 on both the top and the bottom and yield the same result):

1|1 -> 2|1 -> 3|1 -> 3|2 -> 3|3, and this occurs with probability (1)(2/3)(1/4)(2/5)=1/15.

1|1 -> 2|1 -> 2|2 -> 3|2 -> 3|3, and this occurs with probability (1)(1/3)(1)(2/5)=2/15. Probability of 2|2->3|2 is 1 because it doesn't matter what you do. We don't count for order here so either ball you put from the box into of the urn is going to get you a 3|2 distribution. Same argument goes for the iteration from 1|1 to 2|1.

Summing these two up we get $\frac{1}{15}+\frac{2}{15}=\boxed{\bf{(B)} \frac{1}{5}}.$

mathboy282
## Solution 5
Let the probability that the urn ends up with more red balls be denoted $P(R)$. Since this is equal to the probability there are more blue balls, the probability there are equal amounts is $1-2P(R)$. $P(R) =$ the probability no more blues are chosen plus the probability only 1 more blue is chosen. The first case, $P(\text{no more blues}) = \frac{1}{2}\cdot\frac{2}{3}\cdot\frac{3}{4}\cdot\frac{4}{5}=\frac{1}{5}$.

The second case, $P(\text{1 more blue}) = 4\cdot\frac{1\cdot1\cdot2\cdot3}{2\cdot3\cdot4\cdot5} = \frac{1}{5}$. Thus, the answer is $\left(\frac{1}{5}+\frac{1}{5}\right)=1-\frac{4}{5}=\boxed{\textbf{(B)}\ \frac{1}{5}}$.

*~JHawk0224*
## Solution 6
Here $X$ stands for R or B, and $Y$ for the remaining color.
After 3 rounds one can either have a $4+1$ configuration $(XXXXY)$, or $3+2$ configuration $(XXXYY)$. The probability of getting to $XXXYYY$ from $XXXYY$ is  $\frac{2}{5}$. Observe that the probability of arriving to $4+1$ configuration is

$$\frac{2}{3} \cdot \frac{3}{4} = \frac{1}{2}$$

 ($\frac{2}{3}$ to get from $XXY$ to $XXXY$, $\frac{3}{4}$ to get from $XXXY$ to $XXXXY$). Thus the probability of arriving to $3+2$ configuration is also $\frac{1}{2}$, and the answer is

$$\frac{1}{2} \cdot \frac{2}{5} = \boxed{\textbf{(B)}\ \frac{1}{5}}.$$
## Solution 7
We can use dynamic programming to solve this problem.

We let $dp[i][j]$ be the probability that we end up with $i$ red balls and $j$ blue balls.
Notice that there are only two ways that we can end up with $i$ red balls and $j$ blue balls: one is by fetching a red ball from the urn when we have $i - 1$ red balls and $j$ blue balls and the other is by fetching a blue ball from the urn when we have $i$ red balls and $j - 1$ blue balls.

Then we have
$dp[i][j] = \frac{i - 1}{i - 1 + j} dp[i - 1][j] + \frac{j - 1}{i - 1 + j} dp[i][j - 1]$

Then we start can with $dp[1][1] = 1$ and try to compute $dp[3][3]$.


$$\begin{array}{|c || c | c | c | c | c |}

$$
\hline
i \text{\ \textbackslash\ } j & 1 & 2 & 3\\ \hline\hline
1 & 1 & 1/2 & 1/3\\ \hline
2 & 1/2 & 1/3 & 1/4\\ \hline
3 & 1/3 & 1/4 & 1/5\\ \hline
$$

$\end{array}$$$


The answer is $\boxed{\textbf{(B)}\ \frac{1}{5}}$.

(Solution by CircleOO)
## Solution 8 (Easier Solution)
Basically, George is picking a ball and adding another ball of that color to the urn. Basically, he needs to pick a red ball twice and a blue ball twice to get 3 red and 3 blue balls in the urn. The number of ways to choose a red ball twice is $\cdot 2$ (at the start there's 1 red ball, then he needs to choose it again when there's 2, and then there is 3 red balls so he doesn't need to choose it again). Similarly the number of ways to choose blue balls twice is 2. $\cdot 2 = 4$ ways to choose 2 red balls and 2 blue balls (not considering order). The total number of ways is $\cdot 3\cdot 4\cdot 5$. Adding order to the 4 ways to choose 2 red and 2 blue balls, it is 4C2 because out of the 4 ball choosings, 2 of them must be red, and we automatically make the other ones blue. $\frac{\binom42 \cdot 2 \cdot 2}{2 \cdot 3 \cdot 4 \cdot 5} = \frac{1}{5}$.
## Solution 9 (Desperate Guess)
Notice that the answer can either be (1R, 5B) (2R, 4B) (3R, 3B) (4R, 2B) or (5R, 1B). Also, the answer choices are all really basic. Just guess that each of these cases are equal by symmetry so the probability of (3R, 3B) is $\boxed{\textbf{(B)}\ \frac{1}{5}}$.

*~unhappyfarmer*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/4lTIWhNAvYk

*~Education, the Study of Everything*
## Video Solution by TheBeautyOfMath
https://www.youtube.com/watch?v=VZYe3Hu88OA
## See Also
