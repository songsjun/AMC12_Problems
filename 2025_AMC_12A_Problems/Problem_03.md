# 2025 AMC 12A Problem 3

> This problem is the same as [2025 AMC 10A #4](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10A_Problems/Problem_4) and [2025 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12A_Problems/Problem_3).
## Problem
A team of students is going to compete against a team of teachers in a trivia contest. The total number of students and teachers is 15. Ash, a cousin of one of the students, wants to join the contest. If Ash plays with the students, the average age on that team will increase from 12 to 14. If Ash plays with the teachers, the average age on that team will decrease from 55 to 52. How old is Ash?

$\textbf{(A)}~28\qquad\textbf{(B)}~29\qquad\textbf{(C)}~30\qquad\textbf{(D)}~32\qquad\textbf{(E)}~33$
## Solution 1
When Ash joins a team, the team's average is pulled towards his age. Let $A$ be Ash's age and $N$ be the number of people on the student team. Thus, there are $15-N$ people on the teacher team.

The students' average increases from 12 to 14, so
$$\frac{A-12}{N+1} = 2.$$

Similarly, the teachers' average decreases from 55 to 52, so

$$\frac{55-A}{16-N} = 3.$$

Clearing denominators and adding the two equations gives

$$
\begin{aligned}
A-12&=2(N+1),\\
55-A&=3(16-N),\\
43&=2(N+1)+3(16-N)=50-N.
\end{aligned}
$$

Thus $N=7$, and the first equation gives $A=2(7+1)+12=28$. Therefore Ash is $\boxed{\textbf{(A) }28}$ years old.

*~lprado*
## Solution 2
As shown above, we get the equation  $\frac{55-A}{16-N} = 3.$ Rearranging we get  $\frac{55-A}{3} = 16-N.$ Therefore, since N must be an integer, 55-A must be divisible by 3. Plugging in values gets us A= $\boxed{28}.$
## Solution 3
Another way is to say that there are S students and T teachers and Ash's age is A. We can create the equation (1) S+T=15. We can also create the equations (2) $\frac{12S+A}{S+1}=14$ and (3) $\frac{55T+A}{T+1}=52$ Equation (2) simplifies to A=2S+14 and equation (3) simplifies to A=-3T+52. Multiply (2) by 3 to get equation (4) 3A=6S+42 and (3) by -2 to get (5) -2A=6T-104 Add (4) and (5) to get A=$6(S+T)-62$. After substituting equation (1) and simplifying, you get A=$\boxed{28}$ or answer choice $\boxed{A}.$

*~Champions247*
## Chinese Video Solution
https://www.bilibili.com/video/BV18V2uBtEHt/

*~metrixgo*
## Video Solution (Very Fast and Intuitive)
https://youtu.be/ZqswJsf2Odo?si=c9Nx3kD657-9tWcY ~ Pi Academy
## Video Solution
https://youtu.be/QBn439idcPo?si=z3_v6d_ZmpZGbm4N&t=243
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution
https://www.youtube.com/watch?v=dAeyV60Hu5c
## Video Solution
https://youtu.be/_LKnEMhTAu4
*~Education, the Study of Everything*
## Video Solution by Thinking Feet
https://youtu.be/eu4C5SqMHrA
## Video Solution by Daily Dose of Math
https://youtu.be/LN5ofIcs1kY

*~Thesmartgreekmathdude*
## See Also
