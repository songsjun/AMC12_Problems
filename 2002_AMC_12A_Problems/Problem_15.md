# 2002 AMC 12A Problem 15

> This problem is the same as [2002 AMC 12A #15](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12A_Problems) and [2002 AMC 10A #21](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10A_Problems).
## Problem
The mean, median, unique mode, and range of a collection of eight integers are all equal to 8. The largest integer that can be an element of this collection is


$$\text{(A) }11 \qquad \text{(B) }12 \qquad \text{(C) }13 \qquad \text{(D) }14 \qquad \text{(E) }15$$

## Solution 1
As the unique mode is 8, there are at least two $8s$.

As the range is 8 and one of the numbers is 8, the largest one can be at most 16.

If the largest one is 16, then the smallest one is 8, and thus the mean is strictly larger than 8, which is a contradiction.

If we have 2 8's we can find the numbers 4, 6, 7, 8, 8, 9, 10, 12.
This is a possible solution but has not reached the maximum.

If we have 4 8's we can find the numbers 6, 6, 6, 8, 8, 8, 8, 14.

We can also see that they satisfy the need for the mode, median, and range to be 8. This means that the answer will be
$\boxed{\text{(D)}\ 14 }.$ ~By QWERTYUIOPASDFGHJKLZXCVBNM
## Solution 2
We could express this collection as integers a\textsubscript{1} through a\textsubscript{8}, with a\textsubscript{1} being the smallest and a\textsubscript{8} being the largest.

Since the mode is 8, we know that a\textsubscript{4} and a\textsubscript{5} must also be 8. If they were not, the other numbers, which are lesser and greater than a\textsubscript{4} and a\textsubscript{5} respectively, would not be able to satisfy the condition that 8 is the mode.

There are 8 terms and the mean is 8. This tells us that the sum of all the numbers is 64.

We want to maximize the value of a\textsubscript{8}, so we set  a\textsubscript{6} and a\textsubscript{7} to 8 as well.

Knowing that we want to minimize numbers and that the range is 8 , we set a\textsubscript{1}, a\textsubscript{2}, and a\textsubscript{3} equal to a\textsubscript{8} - 8.


$${a\textsubscript{1}, a\textsubscript{2}, a\textsubscript{3}, a\textsubscript{4}, a\textsubscript{5}, a\textsubscript{6}, a\textsubscript{7}, a\textsubscript{8}} = {a\textsubscript{8} - 8, a\textsubscript{8} - 8, a\textsubscript{8} - 8, 8, 8, 8, 8, a\textsubscript{8}}$$


Letting the sum of all the numbers be 64, we find that 32 + $4a_8 - 24 = 64$, which simplifies to $4a_8 = 56$. Solving, we get $\boxed{\text{(D)}\ 14 }.$ ~By SK80, mod_x and huniiya for minor edits
## Solution 3
Let's say that we choose k numbers to be 8, and the largest number to be L. There will therefore be 7-k numbers with the value of L - 8.

This gives the following expression $\frac{(7-k)(L-8)+ 8k + L}{8} = 8.$ Solving for k gives $\frac{120-8L}{16-L} =$ k. The bank of choices we have for L is represented by answer choices (A), (B), (C), (D), and (E).

We find that the value for 14 gives $k = 4$ creating the set 666-8888-14, which satisfies all conditions.

This gives $\boxed{\text{(D)}\ 14 }.$
## Solution 4
Since the mean of the numbers is 8 and there are 8 numbers, the sum of all 8 numbers is 64. Since the range is also 8, let the smallest value in the set = x. Therefore the largest number in the set is $x+8$. The mode is the number which appears most often, so we can let the 4th to 7th largest integers = 8. To maximize the largest value, we will let the 2nd and 3rd smallest integers also equal x.

In order this will be: x, x, x, 8, 8, 8, 8, $x+8$

Now we can set the expression equal to 64 (because of what we determined in the 1st step): x+x+$x+8+8+8+8+x+8=64$

Simplyifying,

$$4x+40=64$$

$$4x=24$$

$$x=6$$

Therefore, since x is the smallest number in the set, the largest number in the set will be $x+8$, which is $\boxed{\text{(D)}\ 14 }.$

*~goofytaipan*
## Video Solution by OmegaLearn
https://youtu.be/xqo0PgH-h8Y?t=848

*~pi_is_3.14*
## Video Solution
https://youtu.be/BNa1Ffu517I

https://www.youtube.com/watch?v=Sic_pM_cmrA   ~David
## See Also
