# 2020 AMC 12A Problem 23

> This problem is the same as [2020 AMC 12A #23](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
Jason rolls three fair standard six-sided dice. Then he looks at the rolls and chooses a subset of the dice (possibly empty, possibly all three dice) to reroll. After rerolling, he wins if and only if the sum of the numbers face up on the three dice is exactly $7.$ Jason always plays to optimize his chances of winning. What is the probability that he chooses to reroll exactly two of the dice?

$\textbf{(A) } \frac{7}{36} \qquad\textbf{(B) } \frac{5}{24} \qquad\textbf{(C) } \frac{2}{9} \qquad\textbf{(D) } \frac{17}{72} \qquad\textbf{(E) } \frac{1}{4}$
## Solution 1
Consider the probability that rolling two dice gives a sum of $s$, where $s \leq 7$. There are $s - 1$ pairs that satisfy this, namely $(1, s - 1), (2, s - 2), \ldots, (s - 1, 1)$, out of $6^2 = 36$ possible pairs. The probability is $\frac{s - 1}{36}$.

Therefore, if one die has a value of $a$ and Jason rerolls the other two dice, then the probability of winning is $\frac{7 - a - 1}{36} = \frac{6 - a}{36}$.

In order to maximize the probability of winning, $a$ must be minimized. This means that if Jason rerolls two dice, he must choose the two dice with the maximum values.

Thus, we can let $a \leq b \leq c$ be the values of the three dice. Consider the case when $a + b < 7. If a + b + c = 7$, then we do not need to reroll any dice. Otherwise,
if we reroll one die, we can reroll any one dice in the hope that we get the value that makes the sum of the three dice $7$. This happens with probability $\frac16$. If we reroll two dice, we will roll the two maximum dice, and the probability of winning is $\frac{6 - a}{36}$, as stated above. However, $\frac16 > \frac{6 - a}{36}$, so rolling one die is always better than rolling two dice if $a + b < 7$.

Now consider the case where $a + b \geq 7$. Rerolling one die will not help us win since the sum of the three dice will always be greater than $7$. If we reroll two dice, the probability of winning is, once again, $\frac{6 - a}{36}$. To find the probability of winning if we reroll all three dice, we can let each dice have $1$ dot and find the number of ways to distribute the remaining $4$ dots. By stars and bars, there are ${\choose2} = 15$ ways to do this, making the probability of winning $\frac{15}{6^3} = \frac5{72}$.

In order for rolling two dice to be more favorable than rolling three dice, $\frac{6 - a}{36} > \frac5{72} \rightarrow a \leq 3$.

Thus, rerolling two dice is optimal if and only if $a \leq 3$ and $a + b \geq 7$. The possible triplets $(a, b, c)$ that satisfy these conditions, and the number of ways they can be permuted, are

$(3, 4, 4) \rightarrow 3$ ways.

$(3, 4, 5) \rightarrow 6$ ways.

$(3, 4, 6) \rightarrow 6$ ways.

$(3, 5, 5) \rightarrow 3$ ways.

$(3, 5, 6) \rightarrow 6$ ways.

$(3, 6, 6) \rightarrow 3$ ways.

$(2, 5, 5) \rightarrow 3$ ways.

$(2, 5, 6) \rightarrow 6$ ways.

$(2, 6, 6) \rightarrow 3$ ways.

$(1, 6, 6) \rightarrow 3$ ways.

There are $3 + 6 + 6 + 3 + 6 + 3 + 3 + 6 + 3 + 3 = 42$ ways in which rerolling two dice is optimal, out of $6^3 = 216$ possibilities, Therefore, the probability that Jason will reroll two dice is $\frac{42}{216} = \boxed{\textbf{(A) } \frac{7}{36}}$.
## Solution 2 (Illustration)
We conclude all of the following after the initial roll:
<ol style="margin-left: 1.5em;">
  <li>Jason rerolls exactly zero dice if and only if the sum of the three dice is $7,$ in which the probability of winning is always $1.$</li><p>
  <li>If Jason rerolls exactly one die, then the sum of the two other dice must be $2,3,4,5,$ or $6.$ The probability of winning is always $\frac16,$ as exactly $1$ of the $6$ possible outcomes of the die rerolled results in a win. </li><p>
  <li>If Jason rerolls exactly two dice, then the outcome of the remaining die must be $1,2,3,4,$ or $5.$ Applying casework to the remaining die produces the following table:


$$\begin{array}{c||c|c}
& & \\ [-2.5ex]
$\textbf{Remaining Die}$ & $\textbf{Sum Needed for the Two Dice Rerolled}$ & $\textbf{Probability of Winning}$ \\ [0.5ex]
$$\hline$$
& & \\ [-2ex]
1 & 6 & 5/36 \\
2 & 5 & 4/36 \\
3 & 4 & 3/36 \\
4 & 3 & 2/36 \\
5 & 2 & 1/36
$\end{array}$$$


The probability of winning is at most $\frac{5}{36}.$</li><p>
  <li>If Jason (re)rolls all three dice, then the probability of winning is always $\frac{\binom62}{6^3}=\frac{15}{216}=\frac{5}{72}.$</li><p>
For the denominator, rolling three dice gives a total of $6^3=216$ possible outcomes. <p>
For the numerator, this is the same as counting the ordered triples of positive integers $(a,b,c)$ for which $a+b+c=7.$ Suppose that $7$ balls are lined up in a row. There are $6$ gaps between the balls, and placing dividers in $2$ of the gaps separates the balls into $3$ piles. From left to right, the numbers of balls in the piles correspond to $a,b,$ and $c,$ respectively. There are $\binom62=15$ ways to place the dividers. Note that the dividers' positions and the ordered triples have one-to-one correspondence, and $\leq a,b,c\leq6$ holds for all such ordered triples. </li><p>
</ol>
The optimal strategy is that:
<ul style="list-style-type:square;">
  <li>If Jason needs to reroll at least zero dice to win, then he rerolls exactly zero dice.</li><p>
  <li>If Jason needs to reroll at least one die to win, then he rerolls exactly one die.</li><p>
  <li>If Jason needs to reroll at least two dice to win, then he rerolls exactly two dice if and only if the probability of winning is greater than $\frac{5}{72},$ the probability of winning for rerolling all three dice. <p> The first three cases in the table above satisfy this requirement. We will analyze these cases by considering the initial outcomes of the two dice rerolled. Note that any of the three dice can be the remaining die, so we need a factor of $3$ for all counts in the third column:


$$\begin{array}{c||c|c}
& & \\ [-2.5ex]
$\textbf{Remaining Die}$ & $\textbf{Initial Outcomes of the Two Dice Rerolled}$ & $\textbf{\# of Ways}$ \\ [0.5ex]
$$\hline$$
& & \\ [-2ex]
1 & $\text{Both are in }$$\{6\}$$\text{, not necessarily distinct.}$ & $3\cdot1^2=3$ \\
2 & $\text{Both are in }$$\{5,6\}$$\text{, not necessarily distinct.}$ & $\hspace{2mm}3\cdot2^2=12$ \\
3 & $\text{Both are in }$$\{4,5,6\}$$\text{, not necessarily distinct.}$ & $\hspace{2mm}3\cdot3^2=27$
$\end{array}$$$


</li>
</ul>
Finally, the requested probability is

$$\frac{3+12+27}{6^3}=\frac{42}{216}=\boxed{\textbf{(A) } \frac{7}{36}}.$$


*~MRENTHUSIASM*
## Solution 3 (Similar to Solution 2)
We count the numerator.
Jason will pick up no dice if he already has a $7$ as a sum. We need to assume he does not have a $7$ to begin with.
If Jason decides to pick up all the dice to re-roll, by the stars and bars rule ways to distribute, ${n+k-1 \choose k-1}$, there will be $2$ bars and $4$ stars ($3$ of them need to be guaranteed because a roll is at least $1$) for a probability of $\frac{15}{216}=\frac{2.5}{36}$.
If Jason picks up $2$ dice and leaves a die showing $k$, he will need the other two to sum to $7-k$. This happens with probability

$$\frac{6-k}{36}$$

 for integers $1 \leq k \leq 6$.
If the roll is not $7$, Jason will pick up exactly one die to re-roll if there can remain two other dice with sum less than $7$, since this will give him a $\frac{1}{6}$ chance which is a larger probability than all the cases unless he has a $7$ to begin with.
We have

$$\frac{1}{6} > \underline{\frac{5,4,3}{36}} > \frac{2.5}{36} > \frac{2,1,0}{36}.$$


We count the underlined part's frequency for the numerator without upsetting the probability greater than it.
Let $a$ be the roll we keep. We know $a\leq3$ since $a=4$ would cause Jason to pick up all the dice.
When $a=1$, there are $3$ choices for whether it is rolled $1$st, $2$nd, or $3$rd, and in this case the other two rolls have to be at least $6$ (or he would have only picked up $1$). This give $3 \cdot 1^{2} =3$ ways.
Similarly, $a=2$ gives $3 \cdot 2^{2} =12$ because the $2$ can be rolled in $3$ places and the other two rolls are at least $5$.
$a=3$ gives $3 \cdot 3^{2} =27$.
Summing together gives the numerator of $42$.
The denominator is $6^3=216$, so we have $\frac{42}{216}=\boxed{\textbf{(A) } \frac{7}{36}}$.
## Solution 4
We can quickly write out all possible rolls that result in a total of $7$, to get that there is a $\frac{5}{72}$ chance that rolling three dice will result in a total of $7$.

<b>Claim 1</b>: If all of Jason's initial outcomes are $4$, $5$ or $6$, Jason is best off rerolling everything.

<b>Proof of if part</b>: If Jason rerolls two dice, he would like for the sum of the two outcomes to be $\text{(The initial outcome of the untouched dice)}$. Since in this case, every dice's initial outcome is $4$, $5$ or $6$, this value is $1$, $2$ or $3$. By basic dice probability, the probability that they add to one is $0$; the probability that they add to two is $\frac{1}{36}$; the probability that they add to three is $\frac{1}{18}$. Each of these probabilities is less than $\frac{5}{72}$, (the probability of winning by rerolling everything) so Jason should not reroll one dice in this scenario. Rolling one die is also nonsense in this situation, since the other two dice will already add up to something greater than $7$.

<b>Proof of only-if part</b>: If Jason rolls a $1$, $2$ or $3$, even just once, then, the probability that rerolling the other two dice will result in win is $\frac{5}{36}$, $\frac{1}{9}$ and $\frac{1}{12}$, by basic die probability. Each of these is greater than $\frac{5}{72}$, so if Jason rolls a $1$, $2$ or $3$, he should not reroll everything.

<b>Claim 2</b>: If the sum of any two of the initial dice is less than $7$, Jason is best off rerolling one or zero die.

<b>Proof of if part</b>: If the sum of any two of the initial dice is less than $7$, when the other die is rolled, there is always a fixed $\frac{1}{6}$ chance that this results in a win for Jason (or, he his initial roll already won, so he doesn't have to roll anything). Rerolling that one die is better than rerolling all three dice, since, as we have seen there is a $\frac{5}{72}$ chance that Jason wins from that. Rerolling that one die is also better than rerolling two dice: by basic die probability, if Jason wishes for the sum of two rerolled dice to equal one value, the maximum probability this happens is $\frac{1}{6}$, and this is when he wishes for the sum to be $7$; however, since he wishes for the sum of all three dice to be $7$, this will never happen, so the probability that rerolling two dice results in a win is always less than $\frac{1}{6}$.

<b>Proof of only-if part</b>: If the sum of each pair of the three dice is at least $7$, it would make no sense to reroll one die, since the final sum of all three dice will always be greater than $7$. Also, if the sum of each pair of the three dice is at least $7$, the total initial sum must also be greater than $7$, so Jason should not reroll zero dice.

From having shown these two claims, we know that Jason should reroll two dice if at least one of them is a $1$, $2$ or $3$, and if the sum of any two of the initial dice is at least $7$. We can write out all the possibilities of initial rolls, account for their permutations, and add everything together to see that there are $42$ total outcomes, where Jason should reroll two dice. Therefore, our final answer is $\frac{42}{216} = \boxed{\textbf{(A) } \frac{7}{36}}$.

*~ihatemath123*
## Solution 5
If the sum of the dice is $7$, we reroll no dice.
If the sum of any two dice is $\leq 6$, we reroll $1$ die because rolling $1$ die will give Jason a $\frac{1}{6}$ chance of winning.
Thus, we consider the scenario where the sum of any two dice is $7$ or greater.


If the smallest die is $1$, the other two dice must be $6$, which has $3$ possible permutations.

If the smallest die is 2, the other two dice can be 5 or 6. There are 3 ways to choose the position of the smallest die, 2 ways each to choose the value of the other dice, so there are $2 \cdot 2 \cdot 3 = 12$ possible permutations.

If the smallest die is 3, the other two dice can be 4, 5, or 6. Similarly, there are 3 ways to choose the position of the smallest die, and 3 ways each to choose the value of the other dice, so there are $3 \cdot 3 \cdot 3 = 27$ possible permutations.

If all die are 4 or above, then we reroll 3 dice. When we reroll all 3 dice, the winning rolls are 1,1,5; 1,2,4; 1,3,3; 2,2,3 in some arrangement, for a total of 15 permutations. Thus, the probability of winning after rerolling 3 dice is $\frac{15}{6^3} = \frac{5}{72}$. If we reroll only 2 dice with the smallest die being $4$, we would need to roll 1,2 or 2,1 to win, which gives a $\frac{2}{36} = \frac{4}{72}$ chance of winning, so this is worse.

If the smallest die is 5 or 6, rerolling 2 dice gives us even worse odds.


Therefore, the cases where 1, 2, or 3 are the smallest die covers all cases where 2 rerolls is optimal. There are $3+12+27 = 42$ permutations out of 216 total permutations, giving us a probability of $\frac{42}{216} = \boxed{\frac{7}{36}}$.

*~JGsomeone, krwang, slamgirls*
## Video Solution (Interactive Teaching Approach)
https://www.youtube.com/watch?v=33QVK1HGJfg

*~MathkidsbyMax*
## Video Solution 1 by Brain Math Club
https://youtu.be/B8pt8jF04ZM
## Video Solution 2 (Richard Rusczyk)
https://artofproblemsolving.com/videos/amc/2020amc10a/516
## Video Solution 3 by Confusion
https://www.youtube.com/watch?v=caUKXO7R0bc
## See Also
