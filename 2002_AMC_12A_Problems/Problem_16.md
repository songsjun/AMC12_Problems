# 2002 AMC 12A Problem 16

> This problem is the same as [2002 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12A_Problems) and [2002 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10A_Problems).
## Problem
Tina randomly selects two distinct numbers from the set $\{ 1, 2, 3, 4, 5 \}$, and Sergio randomly selects a number from the set $\{ 1, 2, ..., 10 \}$. What is the probability that Sergio's number is larger than the sum of the two numbers chosen by Tina?


$$\text{(A)}\ 2/5 \qquad \text{(B)}\ 9/20 \qquad \text{(C)}\ 1/2 \qquad \text{(D)}\ 11/20 \qquad \text{(E)}\ 24/25$$

### Solution 1
This is not too bad using casework.

Tina gets a sum of 3: This happens in only one way (1,2) and Sergio can choose a number from 4 to 10, inclusive. There are 7 ways that Sergio gets a desirable number here.

Tina gets a sum of 4: This once again happens in only one way (1,3). Sergio can choose a number from 5 to 10, so 6 ways here.

Tina gets a sum of 5: This can happen in two ways (1,4) and (2,3). Sergio can choose a number from 6 to 10, so $2\cdot5=10$ ways here.

Tina gets a sum of 6: Two ways here (1,5) and (2,4). Sergio can choose a number from 7 to 10, so $2\cdot4=8$ here.

Tina gets a sum of 7: Two ways here (2,5) and (3,4). Sergio can choose from 8 to 10, so $2\cdot3=6$ ways here.

Tina gets a sum of 8: Only one way possible (3,5). Sergio chooses 9 or 10, so 2 ways here.

Tina gets a sum of 9: Only one way (4,5). Sergio must choose 10, so 1 way.

In all, there are $7+6+10+8+6+2+1=40$ ways. Tina chooses two distinct numbers in $\binom{5}{2}=10$ ways while Sergio chooses a number in 10 ways, so there are $10\cdot 10=100$ ways in all. Since $\frac{40}{100}=\frac{2}{5},$ our answer is $\boxed{\text{(A)}\frac{2}{5}}.$
### Solution 2
We invoke some symmetry. Let T denote Tina's sum, and let S denote Sergio's number. Observe that, for $i = 2, 3, \ldots, 10, \text{Pr}(T=i) = \text{Pr}(T=12-i).$

If Tina's sum is i, then the probability that Sergio's number is larger than Tina's sum is $\frac{10-i}{10}.$ Thus, the probability P is

$$P = \text{Pr}(S>T) = \sum_{i=2}^{10} \text{Pr}(T=i) \times \frac{10-i}{10}$$

Using the symmetry observation, we can also write the above sum as

$$P = \sum_{i=2}^{10} \text{Pr}(T=12-i) \times \frac{10-i}{10} = \sum_{i=2}^{10} \text{Pr}(T=i) \times \frac{i-2}{10}$$

where the last equality follows as we reversed the indices of the sum (by replacing 12-i with i). Thus, adding the two equivalent expressions for P, we have


$$
\begin{align*} 2P &= \sum_{i=2}^{10} \text{Pr}(T=i) \times \left(\frac{10-i}{10} + \frac{i-2}{10}\right) \\ &= \sum_{i=2}^{10} \text{Pr}(T=i) \times \frac{4}{5} \\ &= \frac{4}{5} \sum_{i=2}^{10} \text{Pr}(T=i) \\ &= \frac{4}{5} \end{align*}
$$


Since this represents twice the desired probability, the answer is P = $\boxed{\textbf{(A)} \frac{2}{5}}. -s$crabbler94
## Solution 3
We have 4 cases, if Tina chooses 1, 2, 3, or  4 and always chooses numbers greater than the first number she chose.

The number of ways of choosing 2 numbers from 5 are $\binom{5}{2}.$
--------------------------
Case 1: Tina chooses 1.

In this case, since the numbers are distinct, Tina can choose (1, 2), (1, 3), (1, 4), or (1, 5).

If Tina chooses 1 and 2 which sum to 3, Sergio only has $10-3=7$ choices.

Since the sum of the combined numbers increases by 1 every time for this specific case, Sergio has 1 less choice every time.

Therefore, the probability of this is $\frac{7+6+5+4}{10 \cdot \binom{5}{2}}.$
--------------------------
Case 2: Tina chooses 2.

In this case, Tina can choose (2, 3), (2, 4), or (2, 5).

If Tina chooses 2 and 3 which sum to 5, Sergio only has $10-5=5$ choices.

Since the sum of the combined numbers increases by 1 every time for this specific case, Sergio has 1 less choice every time.

Therefore, the probability of this is $\frac{5+4+3}{10 \cdot \binom{5}{2}}.$
--------------------------
Case 3: Tina chooses 3.

In this case, Tina can choose (3, 4), or (3, 5).

If Tina chooses 3 and 4 which sum to 7, Sergio only has $10-7=3$ choices.

Since the sum of the combined numbers increases by 1 every time for this specific case, Sergio has 1 less choice every time.

Therefore, the probability of this is $\frac{3+2}{10 \cdot \binom{5}{2}}.$
--------------------------
Case 4: Tina chooses 4.

In this case, Tina can only choose (4,5).

If Tina chooses 4 and 5 which sum to 9, Sergio only has $10-9=1$ choice.

Therefore, the probability of this is $\frac{1}{10 \cdot \binom{5}{2}}.$
--------------------------

Once you add these probabilities up, you will have $\frac{(7+6+5+4)+(5+4+3)+(3+2)+(1)}{10 \cdot\binom{5}{2}} = \frac{40}{100} = \frac{2}{5}$ probability.

Thus our answer is $\frac{2}{5}.$

*~mathboy282*
### Solution 4
Assume Sergio chooses from {2,3,$\ldots,10$}. The probability of Tina getting a sum of 6+x and a sum of 6-x, where x $\leq 4,$ are equal due to symmetry. The probability of Sergio choosing numbers higher/lower than 6+x is equal to him choosing numbers lower/higher than 6-x. Therefore over all of Tina's sums, the probability of Sergio choosing a number higher is equal to the probability of choosing a number lower.

The probability that they get the same value is 1/9, so the probability of Sergio getting a higher number is $\frac{(9-1)/2}{9} = \frac49.$

Sergio never wins when choosing 1 so the probability is $\frac49 \cdot \frac{9}{10} + (0)\frac{1}{10} = \boxed{\textbf{(A)} \frac{2}{5}}.$

*~zeric*
### Solution 5 (Brute Force)
List all the cases where S $\in$ [1, 10] and you get $\frac{0+0+0+1+2+4+6+8+9+10}{\binom{5}{2} \cdot 10} = \boxed{\textbf{(A)} \frac{2}{5}}$

*~mathboy282*
## Video Solution by OmegaLearn
https://youtu.be/8WrdYLw9_ns?t=381

*~pi_is_3.14*

https://www.youtube.com/watch?v=ZdZt9uzyMME

# Solution
## Video Solution- Quick, Easy Method
https://www.youtube.com/watch?v=dQ1EsX5JzoI

*~Solution by Math Katana*
## See Also
