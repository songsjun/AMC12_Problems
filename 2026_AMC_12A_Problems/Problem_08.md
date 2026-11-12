# 2026 AMC 12A Problem 8

## Problem
At Euclid High School, 25 students registered to take the AMC 10 and 75 students registered to take the AMC 12. (No student registered to take both.) However, not all 100 students showed up on test day. To compute the percentage of those students who actually took one of the exams, Euclid High School performed the following incorrect two-step process:
- Step 1: The school computed both the percentage of AMC 10 registrants who actually took that exam and the percentage of AMC 12   registrants who actually took that exam.
- Step 2: The school took the average of the previous two numbers to obtain a final percentage.

Suppose that Euclid High School's process yielded an answer of $60\%$. What is the minimum number of students who might have actually taken one of the exams?

$\textbf{(A) } 30 \qquad\textbf{(B) } 35 \qquad\textbf{(C) } 40 \qquad\textbf{(D) } 50 \qquad\textbf{(E) } 60$

## Solution 1:
Let $x$ be the amount of students who took the AMC 10, and $y$ be the amount of students who took the AMC 12. Clearly, by performing steps one and two, we get $\frac12\left(\frac{x}{25}+\frac{y}{75}\right)=0.6\implies 3x+y=90$. So clearly we need to maximise $x$ if we want to minimise $x+y$. We see that $x\le 25$ by our problem condition, and so $x=25$ yields $y=15$ for a total of $x+y=\boxed{40 \hspace{1mm}\textbf{(C)}}$.

~ singularity1

### Solution 1a (skips reasoning of why $x$ needs to be maximised):
Alternatively, if you really wanna be nitpicky about it, you can set $x+y=k$, then we'd have $2x=90-k\implies x=\frac{90-k}2$. We know that $x\le 25$ so $\frac{90-k}2\le 25\implies 90-k\le 50\implies k\ge 40$ for the answer of $40$.

~ singularity1 (again)

## Solution 2 (greedy):
Since the two attendance percentages average to $60\%$, they must sum to $120\%$. To minimize the total number of attendees, we assign $100\%$ to the smaller group and $20\%$ to the larger group, since each percentage point represents fewer students in the smaller group.

Therefore,

$1(25)+0.2(75)=\boxed{40 \hspace{1mm}\textbf{(C)}}$

~ eschan145

## Solution 3
Continue Solution 1 until $3x + y = 90$. Divide by 3. Then, $x + \frac{y}{3} = 30$, and thus $\frac{y}{3} \in \mathbb{Z}$. so set $y = 3y'$ and thus $x + y' = 30$.

To maximize this, obviously, we want to maximize the number of students. Since $3y' \leq 75 \implies y' \leq 25$ and $x \leq 25$, to minimize we want to minimize $3y'$. This occurs when $x$ is maximized, hence set $x = 25$ and $y' = 5$ in which $y = 15$, hence the answer is $\boxed{40}$.

~Pinotation

## Video Solution 1 by MathIsFun
https://youtu.be/JRWnRtZNW9o?si=BgUQDUFIa81xb_se&t=1095

## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
