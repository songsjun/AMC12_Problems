# 2021 AMC 12B Problem 4

> This problem is the same as [2021 AMC 10B #6](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10B_Problems#Problem_6) and [2021 AMC 12B #4](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12B_Problems#Problem_4).
## Problem
Ms. Blackwell gives an exam to two classes. The mean of the scores of the students in the morning class is 84, and the afternoon class's mean score is 70. The ratio of the number of students in the morning class to the number of students in the afternoon class is $\frac{3}{4}.$ What is the mean of the scores of all the students?

$\textbf{(A)} ~74 \qquad\textbf{(B)} ~75 \qquad\textbf{(C)} ~76 \qquad\textbf{(D)} ~77 \qquad\textbf{(E)} ~78$
## Solution 1 (One Variable)
Let there be $3x$ students in the morning class and $4x$ students in the afternoon class. The total number of students is $3x+$4x = $7x$. The average is $\frac{3x\cdot84 + 4x\cdot70}{7x}=76.$ Therefore, the answer is $\boxed{\textbf{(C)} ~76}.$

~ {TSun} ~
## Solution 2 (Two Variables)
Suppose the morning class has m students and the afternoon class has a students. We have the following table:

$$
\begin{array}{c|c|c|c} & & & \\ [-2.5ex] & \textbf{\# of Students} & \textbf{Mean} & \textbf{Total} \\ \hline & & & \\ [-2.5ex] \textbf{Morning} & m & 84 & 84m \\ \hline & & & \\ [-2.5ex] \textbf{Afternoon} & a & 70 & 70a \end{array}
$$

We are also given that $\fracma=\frac34,$ which rearranges as $m=\frac34$a.

The mean of the scores of all the students is $\frac{84m+70a}{m+a}=\frac{84\left(\frac34a\right)+70a}{\frac34a+a}=\frac{133a}{\frac74a}=133\cdot\frac47=\boxed{\textbf{(C)} ~76}.$
*~MRENTHUSIASM*
## Solution 3 (Ratio)
Of the average, $\frac{3}{3+4}=\frac{3}{7}$ of the scores came from the morning class and $\frac{4}{7}$ came from the afternoon class. The average is $\frac{3}{7}\cdot 84+\frac{4}{7}\cdot 70=\boxed{\textbf{(C)} ~76}.$

*~Kinglogic*
## Solution 4 (Convenient Values)
WLOG, assume there are 3 students in the morning class and 4 in the afternoon class. Then the average is $\frac{3\cdot 84 + 4\cdot 70}{7}=\boxed{\textbf{(C)} ~76}.$
## Solution 5 (Basic manipulation)
Let $S_1$ be the sum of the morning class's scores, and $S_2$ be the sum of the afternoon class's scores. Let $3x$ be the number of students in the morning class, and $4x$ be the number of students in the afternoon class. We can write $\frac{S_1}{3x}=84$ and $\frac{S_2}{4x}=70,$ so $S_2 = 70\cdot 4$x and $S_1 = 84\cdot 3$x. Adding these, we get $S_1+S_2 = x(70 \cdot 4 + 84 \cdot 3).$ We want to find the mean, which is $\frac{S_1+S_2}{7x},$ so dividing by $7x$ on both sides of the equation, we get the mean to be 10 $\cdot 4 + 12 \cdot 3 = \boxed{\textbf{(C)} ~76}.$

*~vaishnav*
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=qpvS2PVkI8A&t=249s
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=VzwxbsuSQ80
## Video Solution by OmegaLearn (Clever Application of Average Formula)
https://youtu.be/lE8v7lXT8Go

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/GYpAm8v1h-U (for AMC 10B)

https://youtu.be/EMzdnr1nZcE?t=608 (for AMC 12B)

*~IceMatrix*
## Video Solution by Interstigation
https://youtu.be/DvpN56Ob6Zw?t=426

*~Interstigation*
## Video Solution (Under 2 min!)
https://youtu.be/EgBKBCOn9Mo

*~Education, the Study of Everything*
## See Also
