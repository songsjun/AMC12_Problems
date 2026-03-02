# 2016 AMC 12A Problem 13

## Problem
Let $N$ be a positive multiple of $5$. One red ball and $N$ green balls are arranged in a line in random order. Let $P(N)$ be the probability that at least $\tfrac{3}{5}$ of the green balls are on the same side of the red ball. Observe that $P(5)=1$ and that $P(N)$ approaches $\tfrac{4}{5}$ as $N$ grows large. What is the sum of the digits of the least value of $N$ such that $P(N) < \tfrac{321}{400}$?

$\textbf{(A) } 12 \qquad \textbf{(B) } 14 \qquad \textbf{(C) }16 \qquad \textbf{(D) } 18 \qquad \textbf{(E) } 20$
## Solution 1
Let $n = \frac{N}{5}$. Then, consider $5$ blocks of $n$ green balls in a line, along with the red ball. Shuffling the line is equivalent to choosing one of the $N + 1$ positions between the green balls to insert the red ball. Less than $\frac{3}{5}$ of the green balls will be on the same side of the red ball if the red ball is inserted inside the middle block of $n$ balls, and there are $n - 1$ positions where this happens. Thus, $P(N) = 1 - \frac{n - 1}{N + 1} = \frac{4n + 2}{5n + 1}$, so


$$P(N) = \frac{4n + 2}{5n + 1} < \frac{321}{400}.$$


Multiplying both sides of the inequality by $400(5n+1)$, we have


$$400(4n+2)<321(5n+1),$$


and by the distributive property,


$$1600n+800<1605n+321.$$


Subtracting $1600n+321$ on both sides of the inequality gives us


$$479<5n.$$


Therefore, $N=5n>479$, so the least possible value of $N$ is $480$. The sum of the digits of $480$ is $\boxed{\textbf{(A) } 12}$.
## Solution 2 (Pattern Solution)
Let $N=5$, $P(N)=1$ (Given)


Let $N=10, P(N)=\frac{10}{11}$


Let $N=15, P(N)=\frac{14}{16}$


Notice that the fraction can be written as $\frac{\frac{N}{5}-1}{N+1}$

Now it's quite simple to write the inequality as $\frac{\frac{N}{5}-1}{N+1}<\frac{321}{400}$

We can subtract $1$ on both sides to obtain $\frac{\frac{N}{5}-1}{N+1}<-\frac{79}{400}$

Dividing both sides by $-1$, we derive $\frac{\frac{N}{5}-1}{N+1}>\frac{79}{400}$. (Switch the inequality sign when dividing by $-1$)

We then cross multiply to get $80N - 400 > 79N + 79$

Finally we get $N > 479$

To achieve $N = 480$

So the sum of the digits of $N=\boxed{\textbf{(A) } 12}$
## Solution 3
We are trying to find the number of places to put the red ball, such that $\frac{3}{5}$ of the green balls or more are on one side of it. Notice that we can put the ball in a number of spaces describable with $N$: Trying a few values, we see that the ball "works" in places $1$ to $\frac{2}{5}N + 1$ and spaces $\frac{3}{5}N+1 to N+1$. This is a total of $\frac{4}{5}N + 2$ spaces, over a total possible $N + 1$ places to put the ball. So:

$\frac{\frac{4}{5}N + 2}{N+1} = \frac{321}{400} \rightarrow N = 479.$ And we know that the next value is what we are looking for, so $N+1 = 480$, and the sum of its digits is $\boxed{\textbf{(A) } 12}$.
## Solution 4
Draw $N$ balls as described in the problem. First consider the left side arrangements. Notice that for at least $\frac{3}{5}N$ balls must be to the right of the valid left side arrangements. Since we have $N+1$ balls, we know that there are $\frac{2}{5}N+1$ valid left side arrangements. This also goes for the right side arrangements, for a total of
 $\frac{4}{5}N + 2$ spaces, over a total possible $N + 1$ places to put the ball. So:

$\frac{\frac{4}{5}N + 2}{N+1} = \frac{321}{400} \rightarrow N = 479.$ And we know that the next value is what we are looking for, so $N+1 = 480$, and the sum of its digits is $\boxed{\textbf{(A) } 12}$.
## Video Solution by Pi Academy
https://youtu.be/iTkJExTiGkM?si=2dEicIJoLsaeWE-y

*~Pi Academy*
## Video Solution 2
https://youtu.be/YsIPcwuycF0

*~IceMatrix*
## Video Solution 3
https://www.youtube.com/watch?v=iFSTuWCrosY
## Video Solution 4
https://www.youtube.com/watch?v=SRq3-vm5s2s

*~MathkidsbyMax*
## See Also
