# 2019 AMC 12B Problem 9

## Problem
For how many integral values of x can a triangle of positive area be formed having side lengths $\log_{2}$ x, $\log_{4}$ x, 3?

$\textbf{(A) } 57 \qquad\textbf{(B) } 59 \qquad\textbf{(C) } 61 \qquad\textbf{(D) } 62 \qquad\textbf{(E) } 63$
## Solution
For these lengths to form a triangle of positive area, the Triangle Inequality tells us that we need $\log_2{x} + \log_4{x} > 3 \log_2{x} + 3 > \log_4{x} \log_4{x} + 3 > \log_2{x}.$ The second inequality is redundant, as it's always less restrictive than the last inequality.

Let's raise the first inequality to the power of 4. This gives $4^{\log_2{x}}\cdot 4^{\log_4{x}} > 64 \Rightarrow \left(2^2\right)^{\log_2{x}} \cdot$ x > 64 $\Rightarrowx^2 \cdot$ x > 64. Thus, x > 4.

Doing the same for the third inequality gives $4^{\log_4{x}}\cdot 64 > 4^{\log_2{x}} \Rightarrow 64x > x^2 \Rightarrow$ x < 64 (where we are allowed to divide both sides by x since x must be positive in order for the logarithms given in the problem statement to even have real values).

Combining our results, x is an integer strictly between 4 and 64, so the number of possible values of x is 64 - 4 - 1 = $\boxed{\textbf{(B) } 59}.$

*~Minor edits by BakedPotato66*
## Solution 2 (Somewhat Cheating)
Using the triangle inequality, you get $\log_2{x}+\log_4{x} > 3.$ Solving for x, you get x > 4. Now we need an upper-bound for x and since we're dealing with bases of 2 and 4, we're looking for answer choices close to a power of 2 and 4. All the answer choices seem to be around 64, and plugging that into the inequality $3+\log_4{x} > \log_2{x}$ we see 64 is the correct number. Now we have 64 > x > 4 and the number of integers in between is $64-4-1 =\boxed$} --OGBooger
## See Also
