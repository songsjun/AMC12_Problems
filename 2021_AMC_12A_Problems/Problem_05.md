# 2021 AMC 12A Problem 5

> This problem is the same as [2021 AMC 10A #8](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_8) and [2021 AMC 12A #5](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_5).
## Problem
When a student multiplied the number 66 by the repeating decimal,

$$\underline{1}.\underline{a} \ \underline{b} \ \underline{a} \ \underline{b}\ldots=\underline{1}.\overline{\underline{a} \ \underline{b}},$$

where a and b are digits, he did not notice the notation and just multiplied 66 times $\underline{1}.\underline{a}$ \ $\underline{b}.$ Later he found that his answer is 0.5 less than the correct answer. What is the 2-digit number $\underline{a}$ \ $\underline{b}$?

$\textbf{(A) }15 \qquad \textbf{(B) }30 \qquad \textbf{(C) }45 \qquad \textbf{(D) }60 \qquad \textbf{(E) }75$
## Solution 1
We are given that $66\Bigl(\underline{1}.\overline{\underline{a} \ \underline{b}}\Bigr)-0.5=66\Bigl(\underline{1}.\underline{a}$ \ $\underline{b}\Bigr),$ from which

$$
\begin{align*} 66\Bigl(\underline{1}.\overline{\underline{a} \ \underline{b}}\Bigr)-66\Bigl(\underline{1}.\underline{a} \ \underline{b}\Bigr)&=0.5 \\ 66\Bigl(\underline{1}.\overline{\underline{a} \ \underline{b}} - \underline{1}.\underline{a} \ \underline{b}\Bigr)&=0.5 \\ 66\Bigl(\underline{0}.\underline{0} \ \underline{0} \ \overline{\underline{a} \ \underline{b}}\Bigr)&=0.5 \\ 66\left(\frac{1}{100}\cdot\underline{0}.\overline{\underline{a} \ \underline{b}}\right)&=\frac12 \\ \underline{0}.\overline{\underline{a} \ \underline{b}}&=\frac{25}{33} \\ \underline{0}.\overline{\underline{a} \ \underline{b}}&=0.\overline{75} \\ \underline{a} \ \underline{b}&=\boxed{\textbf{(E) }75}. \end{align*}
$$

*~MRENTHUSIASM*
## Solution 2
It is known that $\underline{0}.\overline{\underline{a} \ \underline{b}}=\frac{\underline{a} \ \underline{b}}{99}$ and $\underline{0}.\underline{a}$ \ $\underline{b}=\frac{\underline{a} \ \underline{b}}{100}.$

Let $x=\underline{a}$ \ $\underline{b}.$ We have $66\biggl(1+\frac{x}{99}\biggr)-66\biggl(1+\frac{x}{100}\biggr)=0.5.$ Expanding and simplifying give $\frac{x}{150}=0.5,$ so $x=\boxed{\textbf{(E) }75}.$

*~aop2014 ~BakedPotato66 ~MRENTHUSIASM*
## Solution 3 (Similar to Solution 2)
We have 66 $\cdot \left(1 + \frac{10a+b}{100}\right) + \frac{1}{2} = 66 \cdot \left(1+ \frac{10a+b}{99}\right).$
Expanding both sides, we have 66 + $\frac{33(10a+b)}{50} + \frac{1}{2} = 66 + \frac{2(10a+b)}{3}.$
Subtracting 66 from both sides, we have $\frac{33(10a+b)}{50} + \frac{1}{2} = \frac{2(10a+b)}{3}.$
Multiplying both sides by 50 $\cdot 3 = 150,$ we have $99($1$0a+b)+75 =100($1$0a+b)$.
Thus, the answer is $10a+b =\boxed{\textbf{(E) }75}.$

By letting $x=\underline{a}$ \ $\underline{b}=10$a+b, this solution is similar to Solution 2. In this solution, we solve for $10a$+b as a whole.

*~mathboy282 (Solution)*

*~MRENTHUSIASM (Minor Revision)*
## Solution 4 (Answer Choices & Modular)
Let $\underline{a}$ \ $\underline{b}$ represent the two-digit number ab, not the product of the digits a and b. We can construct fractions for the values $1.\underline{a}$ \ $\underline{b},$ and $1.\overline{\underline{a} \ \underline{b}},$ which are $\frac{1\underline{a} \ \underline{b}}{100}$ and $\frac{1\underline{a} \ \underline{b}}{99}$  respectively. Multiplying by 66 on both sides and adding 1/2 to $\frac{1\underline{a} \ \underline{b}}{100}$ and simplifying, we get this: $\frac{33 * \underline{a}\underline{b} + 25}{50} = \frac{2\underline{a}\underline{b}}{3}.$

Looking at the answer choices, we notice that all of them are divisible by 3. This means that since the right-hand side will result in an integer, the left-hand side needs to as well. This means that the numerator of the left-hand side fraction has to be divisible by 50. So, we get this expression:

$$33 * \underline{a}\underline{b}\ + 25 \equiv 0\pmod{50}.$$

$$33 * \underline{a}\underline{b}\ \equiv -25\pmod{50}.$$

$$33 * \underline{a}\underline{b}\ \equiv 25\pmod{50}.$$

This means that the product of 33 and $\underline{a}\underline{b}$ must have a remainder of 25 when divided by 50. Since it must have a remainder of 25, the product should have a units digit of 5, which eliminates $\textbf{(B) }$ and $\textbf{(D) }.$ Multiplying 33 to the rest of the answer choices, the only one which fills this requirement is 75, which is $\boxed{\textbf{(E) }75}.$

*~neeyakkid23*
## Video Solution (Simple & Quick)
https://youtu.be/9HI79V-vtCU

*~Education, the Study of Everything*
## Video Solution by Aaron He
https://www.youtube.com/watch?v=xTGDKBthWsw&t=4m12s
## Video Solution (Use of Properties of Repeating Decimals)
https://www.youtube.com/watch?v=zS1u-ohUDzQ&list=PLexHyfQ8DMuKqltG3cHT7Di4jhVl6L4YJ&index=6\

*~North America Math Contest Go Go Go*
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=MUHja8TpKGw&t=359s

Note: This video is unavailable
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=P5al76DxyHY
## Video Solution by OmegaLearn (Using Repeating Decimal Properties)
https://youtu.be/vQZ13WiL4WU

*~pi_is_3.14*
## Video Solution
https://youtu.be/DOF3FYUsXsU

*~savannahsolver*
## Video Solution by TheBeautyofMath
https://youtu.be/s6E4E06XhPU?t=360 (AMC 10A)

https://youtu.be/rEWS75W0Q54?t=511 (AMC 12A)

*~IceMatrix*
## Video Solution by The Learning Royal
https://youtu.be/AWjOeBFyeb4
## See also
