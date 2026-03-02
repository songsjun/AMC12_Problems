# 2003 AMC 12B Problem 19

## Problem
Let S be the [set](https://artofproblemsolving.com/wiki/index.php/set) of [permutation](https://artofproblemsolving.com/wiki/index.php/permutation)s of the [sequence](https://artofproblemsolving.com/wiki/index.php/sequence) 1,2,3,4,5 for which the first term is not 1. A permutation is chosen randomly from S. The [probability](https://artofproblemsolving.com/wiki/index.php/probability) that the second term is 2, in lowest terms, is a/b. What is a+b?


$$\mathrm{(A)}\ 5 \qquad\mathrm{(B)}\ 6 \qquad\mathrm{(C)}\ 11 \qquad\mathrm{(D)}\ 16 \qquad\mathrm{(E)}\ 19$$

## Solution
There are 4 choices for the first element of S, and for each of these choices there are 4! ways to arrange the remaining elements. If the second element must be 2, then there are only 3 choices for the first element and 3! ways to arrange the remaining elements. Hence the answer is $\frac{3 \cdot 3!}{4 \cdot 4!} = \frac$ {18}{96} = $\frac{3}{16},$ and a+$b=19\Rightarrow \mathrm{(E)}.$
## Solution 2
There is a $\frac$ {1}{4} chance that the number 1 is the second term. Let x be the chance that 2 will be the second term. Since 3, 4, and 5 are in similar situations as 2, this becomes $\frac$ {1}{4} + $4x = 1$

Solving for x, we find it equals $\frac$ {3}{16}, therefore $3 + 16 = 19\Rightarrow \mathrm{(E)}$
## Solution 3
Let's focus on 2, 3, 4, and 5 right now. There are 4! ways to arrange these numbers. We can "insert" 1 into the arrangement after the first, second, third, and fourth numbers. There are 4! $\cdot 4 = 96$ ways to do this.

In 24 of those ways, 1 is in the second position, and in the remaining 72 sequences, 2, 3, 4, and 5 occur in the second position the same number of times. $\frac{\frac{72}{4}}{96} = \frac{3}{16},$ therefore $3 + 16 = 19\Rightarrow \mathrm{(E)}$
## Solution 4
The probability could be written as a fraction where $\frac$ {$\text{number of viable solutions in S}$}{$\text{total permutations in S}$}.

The total number of permutations is essentially 5!, and the number of permutations where 1 is the first number is 4!, therefore the number of permutations in S is 5!-4!.

For the first number in the desired solution, there are 3 options (3, 4, 5).
For the second number in the desired solution, there is only one option (2).
For the third number in the desired solution, there are 3 options (1, and the numbers not used in the first digit).
For the fourth number in the desired solution, there are 2 options (numbers not used in the third digit).
For the last number in the desired solution, there is only one option (number not used in the fourth digit).

Therefore, 3 $\cdot 1 \cdot 3 \cdot 2 \cdot 1$ will be the number of desired outcomes.

Finally, $\frac$ {3 $\cdot 1 \cdot 3 \cdot 2 \cdot 1$}{5!-4!} equates to $\frac$ {18}{96}, which is $\frac$ {3}{16}.

The answer is then $3+16=\boxed{\textbf{(E)}\ 19}.$

*~Tyrone12345*
## Video Solution by OmegaLearn
https://youtu.be/IRyWOZQMTV8?t=1215

*~pi_is_3.14*
## See also
