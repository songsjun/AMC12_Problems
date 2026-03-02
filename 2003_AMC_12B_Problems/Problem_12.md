# 2003 AMC 12B Problem 12

> This problem is the same as [2003 AMC 12B #12](https://artofproblemsolving.com/wiki/index.php/2003_AMC_12B_Problems) and [2003 AMC 10B #18](https://artofproblemsolving.com/wiki/index.php/2003_AMC_10B_Problems).
## Problem
What is the largest integer that is a divisor of

$(n+1)(n+3)(n+5)(n+7)(n+9)$

for all positive even integers n?


$$\text {(A) } 3 \qquad \text {(B) } 5 \qquad \text {(C) } 11 \qquad \text {(D) } 15 \qquad \text {(E) } 165$$

## Solution 1
For all consecutive odd integers, one of every five is a multiple of 5 and one of every three is a multiple of 3. The answer is 3 $\cdot 5 = 15,$ so  {$\boxed{\textbf{(D)15}}$} is the correct answer.
## Solution 2
We'll just test all the answer choices.

Note that for any 3 consecutive odd integers, there will be exactly one multiple of 3.

Let's list all possibilities of 3 consecutive odd integers. (multiple of 3, not multiple of 3, not multiple of 3), (not multiple of 3, multiple of 3, not multiple of 3) and (not multiple of 3, not multiple of 3, multiple of 3)

To support this further, list the first few  consecutive lists of 3 consecutive odd integers.

We have (1, 3, 5), (3, 5, 7), (5, 7, 9), (7, 9, 11), (11, 13, 15), $\ldots$

So if the first two consecutive odd numbers aren't multiples of three, the last one must be a multiple of three.

Therefore for five consecutive odd integers, there must be at least one multiple of three.

In the same fashion as we did above, note that for any 5 consecutive integers, there will also be exactly one multiple of 5.

Therefore, for any 5 consecutive odd integers, there must be exactly one multiple of five.

We can skip 7 since none of the answer choices are a multiple of 7.

Now we try 11. 11 doesn't work since as we see the following set of 5 consecutive odd integers doesn't fit: (13, 15, 17, 19, 21).

Since any 5 consecutive integers is divisible both by 3 and 5, it also must be divisible by {$\boxed{\textbf{(D)15}}$} and no higher since we saw that 11 does not work and that there is no answer choice that is multiple of 7.

*~mathboy282*
## Video Solution by WhyMath
https://youtu.be/dQiw5lisd84

*~savannahsolver*
## See Also
