# 2024 AMC 12B Problem 4

> This problem is the same as [2024 AMC 10B #4](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10B_Problems/Problem_4) and [2024 AMC 12B #4](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12B_Problems/Problem_4).
## Problem
Balls numbered 1, 2, 3, ... are deposited in 5 bins, labeled A, B, C, D, and E, using the following procedure. Ball 1 is deposited in bin A, and balls 2 and 3 are deposited in bin B. The next 3 balls are deposited in bin C, the next 4 in bin D, and so on, cycling back to bin A after balls are deposited in bin E. (For example, balls numbered 22, 23, ..., 28 are deposited in bin B at step 7 of this process.) In which bin is ball 2024 deposited?

$\textbf{(A) } A \qquad\textbf{(B) } B \qquad\textbf{(C) } C \qquad\textbf{(D) } D \qquad\textbf{(E) } E$
## Solution 1
Consider the triangular array of numbers:


$$1$$


$$2, 3$$


$$4, 5, 6$$


$$7, 8, 9, 10$$


$$11, 12, 13, 14, 15$$


$$\vdots$$

.

The numbers in a row congruent to $1 \bmod{5}$ will be in bucket A. Similarly, the numbers in a row congruent to $2, 3, 4, 0 \bmod{5}$ will be in buckets B, C, D, and E respectively. Note that the $n^\text{th}$ row ends with the $n^\text{th}$ triangle number, $\frac{n(n+1)}{2}$.

We must find values of $n$ that make $\frac{n(n+1)}{2}$ close to $2024$.


$$\frac{n(n+1)}{2} \approx 2024$$


$$n(n+1) \approx 4048$$


$$n^2 \approx 4048$$


$$n \approx 63$$


Trying $n = 63$ we find that $\frac{n(n+1)}{2} = 2016$. Since $2016$ will be the last ball in row $63$, ball $2024$ will be in row $64$. Since $64 \equiv 4 \bmod{5}$, ball $2024$ will be placed in bucket $\boxed{\text{D. } D}$.

*~numerophilee*
## Solution 2
[thumb|center|600px|](https://artofproblemsolving.com/wiki/index.php/Image:_2024_AMC_12B_P04.jpeg)
*~Kathan*
## Video Solution 1 by Pi Academy (Fast and Easy ⚡🚀)
https://youtu.be/DIl3rLQQkQQ?feature=shared

*~Pi Academy*
## Video Solution by Daily Dose of Math
https://youtu.be/GsXiQWPowoE

*~Thesmartgreekmathdude*
## Video Solution by TheBeautyofMath
https://youtu.be/mpnm_r6D3-w?t=634

*~IceMatrix*
## See also
