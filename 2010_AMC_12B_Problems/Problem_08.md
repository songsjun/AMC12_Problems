# 2010 AMC 12B Problem 8

> This problem is the same as [2010 AMC 12B #8](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12B_Problems) and [2010 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10B_Problems).
## Problem
Every high school in the city of Euclid sent a team of 3 students to a math contest. Each participant in the contest received a different score. Andrea's score was the median among all students, and hers was the highest score on her team. Andrea's teammates Beth and Carla placed 37th and 64th, respectively. How many schools are in the city?

$\textbf{(A)}\ 22 \qquad \textbf{(B)}\ 23 \qquad \textbf{(C)}\ 24 \qquad \textbf{(D)}\ 25 \qquad \textbf{(E)}\ 26$
## Solution 1
There are x schools. This means that there are $3x$ people. Because no one's score was the same as another person's score, that means that there could only have been 1 median score. This implies that x is an odd number. x cannot be less than 23, because there wouldn't be a 64th place if x was. x cannot be greater than 23 either, because that would tie Andrea and Beth or Andrea's place would be worse than Beth's. Thus, the only possible answer is $\boxed{\mathbf{(B)}\ 23}.$
## Solution 2
Let a be Andrea's place. We know that she was the highest on her team, so a < 37.

Since a is the median, there are $a-1$ to the left and right of the median, so the total number of people is 2$a-1$ and the number of schools is (2$a-1$)/3. This implies that 2$a-1\equiv 0 \pmod{3} \implies$ a $\equiv 2 \pmod{3}.$

Also, since $2a-1$ is the rank of the last-place person, and one of Andrea's teammates already got 64th place, $2a-1 > 64\implies$ a $\ge 33.$

Putting it all together: 33 $\le$ a < 37 and a $\equiv 2 \pmod{3},$ so clearly $a = 35$, and the number of schools as we got before is (2$a-1)/3 = 69/3 =\boxed{\mathbf{(B)}\ 23}.$

*~adihaya*
## Video Solution
https://youtu.be/FQO-0E2zUVI?t=297

*~IceMatrix*
## See also
