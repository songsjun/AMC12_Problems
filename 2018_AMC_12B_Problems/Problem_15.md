# 2018 AMC 12B Problem 15

## Problem
How many odd positive 3-digit integers are divisible by 3 but do not contain the digit 3?

$\textbf{(A) } 96 \qquad \textbf{(B) } 97 \qquad \textbf{(C) } 98 \qquad \textbf{(D) } 102 \qquad \textbf{(E) } 120$
## Solution 1
Let $\underline{ABC}$ be one such odd positive 3-digit integer with hundreds digit A, tens digit B, and ones digit C. Since $\underline{ABC}\equiv0\pmod3,$ we need A+B+C$\equiv0\pmod3$ by the divisibility rule for 3.

As A$\in\{1,2,4,5,6,7,8,9\}$ and C$\in\{1,5,7,9\}$, there are 8 possibilities for A and 4 possibilities for C. Note that each ordered pair (A,C) determines the value of B modulo 3, so B can be any element in one of the sets $\{0,6,9\}$,$\{1,4,7\}$, or $\{2,5,8\}$. We conclude that there are always 3 possibilities for B.

By the Multiplication Principle, the answer is $8\cdot4\cdot3=\boxed{\textbf{(A) } 96}.$

*~Plasma_Vortex ~MRENTHUSIASM*
## Solution 2
Let $\underline{ABC}$ be one such odd positive 3-digit integer with hundreds digit A, tens digit B, and ones digit C. Since $\underline{ABC}\equiv0\pmod3,$ we need A+B+C$\equiv0\pmod3$ by the divisibility rule for 3.

As A$\in\{1,2,4,5,6,7,8,9\}$,B$\in\{0,1,2,4,5,6,7,8,9\}$, and C$\in\{1,5,7,9\}$, note that:

 1.   There are 2 possibilities for A$\equiv0\pmod3,$ namely A=6,9.
There are 3 possibilities for A$\equiv1\pmod3,$ namely A=1,4,7.

There are 3 possibilities for A$\equiv2\pmod3,$ namely A=2,5,8.

 2.   There are 3 possibilities for B$\equiv0\pmod3,$ namely B=0,6,9.
There are 3 possibilities for B$\equiv1\pmod3,$ namely B=1,4,7.

There are 3 possibilities for B$\equiv2\pmod3,$ namely B=2,5,8.

 3.   There are 1 possibility for C$\equiv0\pmod3,$ namely C=9.
There are 2 possibilities for C$\equiv1\pmod3,$ namely C=1,7.

There are 1 possibility for C$\equiv2\pmod3,$ namely C=5.

We apply casework to A+B+C$\equiv0\pmod3$:

$$
\begin{array}{c|c|c||l} & & & \\ [-2.5ex] \boldsymbol{A\operatorname{mod}3} & \boldsymbol{B\operatorname{mod}3} & \boldsymbol{C\operatorname{mod}3} & \multicolumn{1}{c}{\textbf{Count}} \\ [0.5ex] \hline & & & \\ [-2ex] 0 & 0 & 0 & 2\cdot3\cdot1=6 \\ 0 & 1 & 2 & 2\cdot3\cdot1=6 \\ 0 & 2 & 1 & 2\cdot3\cdot2=12 \\ 1 & 0 & 2 & 3\cdot3\cdot1=9 \\ 1 & 1 & 1 & 3\cdot3\cdot2=18 \\ 1 & 2 & 0 & 3\cdot3\cdot1=9 \\ 2 & 0 & 1 & 3\cdot3\cdot2=18 \\ 2 & 1 & 0 & 3\cdot3\cdot1=9 \\ 2 & 2 & 2 & 3\cdot3\cdot1=9 \end{array}
$$

Together, the answer is $6+6+12+9+18+9+18+9+9=\boxed{\textbf{(A) } 96}.$

*~MRENTHUSIASM*
## Solution 3
Analyze that the three-digit integers divisible by 3 start from 102. In the 200's, it starts from 201. In the 300's, it starts from 300. We see that the units digits is 0, 1,  and 2.

Write out the 1- and 2-digit multiples of 3 starting from 0, 1, and 2. Count up the ones that meet the conditions. Then, add up and multiply by 3, since there are three sets of three from 1 to 9. Then, subtract the amount that started from 0, since the 300's ll contain the digit 3.

Together, the answer is 3(12+12+12)$-12=\boxed{\textbf{(A) } 96}.$
## Solution 4
Consider the number of 2-digit numbers that do not contain the digit 3, which is $90-18=72$. For any of these 2-digit numbers, we can append 1,5,7, or 9 to reach a desirable 3-digit number. However, we have 7 $\equiv 1\pmod{3},$ and thus we need to count any 2-digit number $\equiv 2\pmod{3}$ twice. There are (98-11)/$3+1=30$ total such numbers that have remainder 2, but 6 of them (23,32,35,38,53,83) contain 3, so the number we want is $30-6=24$. Therefore, the final answer is $72+24=\boxed{\textbf{(A) } 96}.$
## Solution 5
We need to take care of all restrictions. Ranging from 101 to 999, there are 450 odd 3-digit numbers. Exactly $\frac{1}{3}$ of these numbers are divisible by 3, which is $450\cdot\frac{1}{3}=150.$ Of these 150 numbers, $\frac{4}{5} \textbf{do not}$ have 3 in their ones (units) digit, $\frac{9}{10} \textbf{do not}$ have 3 in their tens digit, and $\frac{8}{9} \textbf{do not}$ have 3 in their hundreds digit. Thus, the total number of 3-digit integers is $900\cdot\frac{1}{2}\cdot\frac{1}{3}\cdot\frac{4}{5}\cdot\frac{9}{10}\cdot\frac{8}{9}=\boxed{\textbf{(A) } 96}.$

*~mathpro12345*
## Solution 6
We will start with the numbers that could work. This numbers include _ _ 1, _ _ 5, _ _ 7, _ _ 9. Let's work case by case.

Case 1: _ _ 1: The two blanks could be any number that is 2 mod 3 that does not include 3. We have 24 cases for this case (we could count every case).

Case 2: _ _ 5: The 2 blanks could be any number that is 1 mod 3 that does not include 3. But we could see that this case has exactly the same solutions to case 1 because we have a 1-1 correspondence. We can do the exact same for case 3.

Cases 4: _ _ 9: We need the blanks to be a multiple of 3, but does not contain 3. We have (12, 15, 18, 21, 24, 27, 42, 45, 48, 51, 54, 57, 60, 66, 69, 72, 75, 78, 81, 84, 87, 90, 96, 99) which also contains 24 numbers. Therefore, we have 24 $\cdot 4$ which is equal to $\boxed{\textbf{(A) } 96}.$

*~Arcticturn*
## Solution 7
This problem is solvable by inclusion exclusion principle. There are $\frac{999-105}{6} + 1 = 150$ odd 3-digit numbers divisible by 3. We consider the number of 3-digit numbers divisible by 3 that contain either 1, 2 or 3 digits of 3.

For $\underline{AB3}, AB$ is any 2-digit number divisible by 3, which gives us $\frac{99-12}{3} + 1 = 30.$ For $\underline{A3B},$ for each odd B, we have 3 values of A that give a valid case, thus we have $5(3) = 15$ cases. For $\underline{3AB},$ we also have 15 cases, but when B=3, 9, A can equal 0, so we have 17 cases.

For $\underline{A33},$ we have 3 cases. For $\underline{3A3},$ we have 4 cases. For $\underline{33A},$ we have 2 cases. Finally, there is just one case for $\underline{333}.$

By inclusion exclusion principle, we get 150 - 30 - 15 - 17 + 3 + 4 + 2 - 1 = $\boxed{\textbf{(A) } 96}$ numbers.

*~Zeric*
## Solution 8 (only if you don't have time)
List the numbers that satisfy restriction for 100 and 200. Each of them have 12. Assume that this holds for all other hundreds. Multiply 12 and 8 because 300 doesn't count. The answer is $\boxed{\textbf{(A) } 96}.$
## Video Solution by Omega Learn
https://youtu.be/mgEZOXgIZXs?t=448

*~pi_is_3.14*
## Video Solution by WhyMath
https://youtu.be/vdJFrAq0NDY

*~savannahsolver*
## See Also
