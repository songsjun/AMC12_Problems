# 2024 AMC 12B Problem 5

> This problem is the same as [2024 AMC 10B #5](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10B_Problems/Problem_5) and [2024 AMC 12B #5](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12B_Problems/Problem_5).
## Problem
In the following expression, Melanie changed some of the plus signs to minus signs:


$$1+3+5+7+...+97+99$$


When the new expression was evaluated, it was negative. What is the least number of plus signs that Melanie could have changed to minus signs?

$\textbf{(A) } 14 \qquad\textbf{(B) } 15 \qquad\textbf{(C) } 16 \qquad\textbf{(D) } 17 \qquad\textbf{(E) } 18$
## Solution 1
Recall that the sum of the first $n$ odd numbers is $n^2$. Thus

$$1 + 3 + 5 + 7+ \dots + 97 + 99 = 50^2 = 2500.$$


If we want to minimize the number of sign flips to make the number negative, we must flip the signs corresponding to the values with largest absolute value. This will result in the inequality

$$1 + 3 + 5 +\dots + (2n - 3) + (2n - 1) - (2n + 1) - (2n + 3)-\dots - 97 - 99 < 0.$$


The positive section of the sum will contribute $n^2$, and the negative section will contribute $-(2500-n^2) = (n^2 - 2500)$. The inequality simplifies to


$$n^2 + (n^2 - 2500) < 0$$


$$2n^2 < 2500$$


$$n^2 < 1250$$


The greatest positive value of $n$ satisfying the inequality is $n = 35$, corresponding to $35$ positive numbers, and $\boxed{\text{B. } 15}$ negatives.

ALEX
## Solution 2
The formula for the sum of all odd positive integers from $1$ to $2n-1$ is

$$1+3+5+...+2n-3+2n-1=n^2.$$

Therefore, the given sum evaluates to

$$99=2(50)-1\implies 50^2=2500.$$

 Since we're looking for the minimum possible sign changes, we focus on the largest numbers in the set to change to negative.

If we change the sign of a number $n$ to negative, then the sum decreases by $2n$. Therefore, we're looking for a subset of numbers that add to greater than $2500/2=1250$.

Now we look at the answer choices.

$\text{(A) }14$ means that we're changing the signs of the numbers $\{73,75,...,99\}$, and $73+75+...+99=\dfrac{(73+99)\cdot(\frac{99-73}{2}+1)}{2}=1204$.

Now this so slightly happens to be less than $1250$, and $\text{(B) } 15$ means we're adding $71$ to the set, too. Since $71>1250-1204=46$, then the answer is $\boxed{\text{(B) }15}$ ~Tacos_are_not_yummy_1
## Solution 3
Note that as mentioned above, $1 + 3 + 5... + 2n - 1 = n^{2}$. So, the sum of the first 50 odd numbers is equal to 2500, and we need to find the smallest integer such that $2k^{2} < 50^{2}$. Taking the square root, $k = \sqrt{2}$, keeping in mind we need to take the floor $2k^{2}$ needs to be slightly less than 2500. Using an approximation of $\sqrt{2} = 1.4, 25 * \frac{7}{5}$ is 35, so our answer is $\boxed{\text{(B) }15}$
*~aleyang*
## Solution 4 (Simple Algebra)
As mentioned above, $1 + 3 + 5... + 2n - 1 = n^{2}$. This will be especially important in this solution. The sum of the original expression is 2500, so the combined (positive) sum of the negatives must be greater than half of this, i.e. $1250$. We are looking to minimize the number of negative numbers, so we only convert the last numbers to negatives. Let $99 = o_1 = 100-$1, $97 = o_2 = 100 - 3$, and for any $n$, $o_n = 100-(2n-1)$. Then the sum of all numbers up till $o_n$ is $100n - n^{2}$. This sum needs to be greater than 1250, i.e.:

$100n-n^{2} > 1250$

Testing out $n$ from the solution set yields the minimum value of $n=15$. The answer is therefore $\boxed{\text{(B) }15}$.

*~mathwizard123123*
*~edit by RoyalPawn38*
## Video Solution 1 by Pi Academy (Fast and Easy ⚡🚀)
https://youtu.be/DIl3rLQQkQQ?feature=shared

*~Pi Academy*
## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=24EZaeAThuE
## Video Solution by Daily Dose of Math
https://youtu.be/rZX4qVEflNg

*~Thesmartgreekmathdude*
## Video Solution by TheBeautyofMath
https://youtu.be/mpnm_r6D3-w?t=1013

*~IceMatrix*
## See also
