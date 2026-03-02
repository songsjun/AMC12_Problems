# 2025 AMC 12B Problem 6

> This problem is the same as [2025 AMC 10B #8](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10B_Problems/Problem_8) and [2025 AMC 12B #6](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12B_Problems/Problem_6).
## Problem
Emmy says to Max, "I ordered 36 math club sweatshirts today." Max asks, "How much did each shirt cost?" Emmy responds, "I'll give you a hint. The total cost was \$ \underline A~\underline B~\underline B.\underline B~\underline A, where A and B are digits and A \neq 0." After a pause, Max says, "That was a good price." What is A + B?

$\textbf{(A)}~7 \qquad \textbf{(B)}~8 \qquad \textbf{(C)}~11 \qquad \textbf{(D)}~14 \qquad \textbf{(E)}~15$
## Solution 1
The problem is essentially telling us that $\underline A$~$\underline B$~$\underline B.\underline B$~$\underline A$ is divisible by 36, so it is divisible by 9. Then, by the divisibility by 9 condition,
$$A+B+B+B+A=2A+3B\equiv 0\pmod{9}$$
This means that A must be divisible by 3, or otherwise 2A+3B would not be divisible by 3 and thus 9. Since A$\ne0,$ we must have one of A=3,6,9.

But A must be even or else the entire number would not be even and thus would not be divisible by 4. Hence A=6. Then, $2\cdot 6+3B\equiv 0\pmod{9},$ so 4+B$\equiv 0\pmod{3},$ and thus B$\equiv 2\pmod{3}.$ This yields B=2,5,8, of which B=5 is the only number that allows $\underline A$~$\underline B$~$\underline B.\underline B$~$\underline A$ to be divisible by 4. Thus the answer is $6+5=\boxed{\textbf{(C)}~11}.$

~ [https://artofproblemsolving.com/wiki/index.php/User:Eevee9406 eevee9406]
## Solution 2 (Trial and Error)
A number is divisible by 36 if it divisible by 4, and 9. The divisibility rule for 4 requires the last 2 digits to also be a multiple of 4. The divisibility rule for 9 requires the sum of all digits to be divisible by 9. Using the first condition A+B is a multiple of 4. We can list out all possibilities for this, since both A and B are digits. The possibilities are  (1,2),(1,6),...(9,6) for A, and B respectively. There are a total of 2 digits that are A's and 3 that are B's. So if the digits sum to 9, then 2A+3B is a multiple of 9. We can try plugging in numbers from our list earlier into the equation 2A+3B to find what values set the expression equal to a multiple of 9. By trying numbers A=6, and B=5. So then A+B yields

$$6+5=\boxed{\textbf{(C)}~11}.$$

*~NumberNinja1234*
## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=q5b3VjAsglU

*~Pi Academy*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=dLSWVrrKsgs
## Video Solution by Daily Dose of Math
https://youtu.be/vayQuXXbr28

*~Thesmartgreekmathdude*
## See Also
