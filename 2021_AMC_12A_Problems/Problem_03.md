# 2021 AMC 12A Problem 3

> This problem is the same as [2021 AMC 10A #3](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_3) and [2021 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_3).
## Problem
The sum of two natural numbers is 17{,}402. One of the two numbers is divisible by 10. If the units digit of that number is erased, the other number is obtained. What is the difference of these two numbers?

$\textbf{(A)} ~10{,}272\qquad\textbf{(B)} ~11{,}700\qquad\textbf{(C)} ~13{,}362\qquad\textbf{(D)} ~14{,}238\qquad\textbf{(E)} ~15{,}426$
## Solution 1 (Algebra)
The units digit of a multiple of 10 will always be 0. We add a 0 whenever we multiply by 10. So, removing the units digit is equal to dividing by 10.

Let the smaller number (the one we get after removing the units digit) be a. This means the bigger number would be $10a$.

We know the sum is $10a+a =11a$ so $11a=$17402. So $a=1582$. The difference is $10a-a =9a$. So, the answer is $9(1582)=\boxed{\textbf{(D)} ~14{,}238}.$

*~abhinavg0627*
## Solution 2 (Arithmetic)
Since the unit's place of a multiple of 10 is 0, the other integer must end with a 2, for both integers sum up to a number ending in a 2. Thus, the unit's place of the difference must be $10-2=8$, and the only answer choice that ends with an 8 is $\boxed{\textbf{(D)} ~14{,}238}.$

Another quick solution is to realize that the sum represents a number n added to $10n$. The difference is $9n$, which is $\frac{9}{11}$ of the given sum.

*~CoolJupiter 2021*

*~Extremelysupercooldude (Minor grammar edits)*
## Solution 3 (Vertical Addition and Logic)
Let the larger number be $\underline{AB{,}CD0}.$ It follows that the smaller number is $\underline{A{,}BCD}.$ Adding vertically, we have

$$
\begin{array}{cccccc} & A & B & C & D & 0 \\ +\quad & & A & B & C & D \\ \hline & & & & & \\ [-2.5ex] & 1 & 7 & 4 & 0 & 2 \\ \end{array}
$$

Working from right to left, we get D=$2\implies C=8 \implies B=5 \implies A=1.$
The larger number is 15{,}820 and the smaller number is 1{,}582. Their difference is 15{,}820-1{,}$582=\boxed{\textbf{(D)} ~14{,}238}.$

*~MRENTHUSIASM*
## Solution 4 (Logic)
We know that the larger number has a units digit of 0 since it is divisible by 10. If D is the ten's digit of the larger number, then D is the units digit of the smaller number. Since the sum of the natural numbers has a unit's digit of 2, D=2.

The units digit of the larger number is 0 and the units digit of the smaller number is 2, so the positive difference between the numbers is 8. There is only one answer choice that has this units digit, and that is $\boxed{\textbf{(D)} ~14{,}238}.$

(Similar to MRENTHUSIASM's solution)

*~AARUSHGORADIA18*
## Video Solutions
### Video Solution 1 (easily understandable)
https://www.youtube.com/watch?v=jPzcN0KeJ88&t=132s
### Video Solution (Simple)
https://youtu.be/SEp9flDYm2c

*~Education, the study Of Everything*
### Video Solution by North America Math Contest Go Go Go
https://www.youtube.com/watch?v=hMqA8i8a2SQ&list=PLexHyfQ8DMuKqltG3cHT7Di4jhVl6L4YJ&index=3
### Video Solution by Hawk Math
https://www.youtube.com/watch?v=P5al76DxyHY
### Video Solution by OmegaLearn (Using Algebra and Meta-solving)
https://youtu.be/d2musztzDjw

*~pi_is_3.14*
### Video Solution by WhyMath
https://youtu.be/VpYmQEKcBpA

*~savannahsolver*
### Video Solution by TheBeautyofMath
https://youtu.be/50CThrk3RcM?t=107 (for AMC 10A)
### Video Solution by IceMatrix
https://youtu.be/rEWS75W0Q54?t=198 (for AMC 12A)

*~IceMatrix*
### Video Solution (Problems 1-3)
https://youtu.be/CupJpUzKPB0

*~MathWithPi*
### Video Solution by The Learning Royal
https://youtu.be/slVBYmcDMOI
## See also
