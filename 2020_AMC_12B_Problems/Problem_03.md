# 2020 AMC 12B Problem 3

> This problem is the same as [2020 AMC 10B #3](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #3](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
The ratio of $w$ to $x$ is $4:3$, the ratio of $y$ to $z$ is $3:2$, and the ratio of $z$ to $x$ is $1:6$. What is the ratio of $w$ to $y?$

$\textbf{(A)}\ 4:3 \qquad\textbf{(B)}\ 3:2 \qquad\textbf{(C)}\  8:3 \qquad\textbf{(D)}\ 4:1 \qquad\textbf{(E)}\ 16:3$
## Solution 1 (One Sentence)
We have

$$\frac wy = \frac wx \cdot \frac xz \cdot \frac zy = \frac43\cdot\frac61\cdot\frac23=\frac{16}{3},$$

 from which $w:y=\boxed{\textbf{(E)}\ 16:3}.$

*~MRENTHUSIASM*
## Solution 2
We need to somehow link all three of the ratios together. We can start by connecting the last two ratios together by multiplying the last ratio by two.

$z:x=1:6=2:12$, and since $y:z=3:2$, we can link them together to get $y:z:x=3:2:12$.

Finally, since $x:w=3:4=12:16$, we can link this again to get: $y:z:x:w=3:2:12:16$, so $w:y = \boxed{\textbf{(E)}\ 16:3}$.

*~quacker88*
## Solution 3
We have the equations $\frac{w}{x}=\frac{4}{3}$, $\frac{y}{z}=\frac{3}{2}$, and $\frac{z}{x}=\frac{1}{6}$.
Clearing denominators, we have $3w = 4x, 2y = 3z$, and $6z = x$.
Since we want $\frac{w}{y}$, we look to find $y$ in terms of $x$ since we know the relationship between $x$ and $w$.
We begin by multiplying both sides of $2y = 3z$ by two, obtaining $4y = 6z$. We then substitute that into $6z = x$
to get $4y = x$ . Now, to be able to substitute this into out first equation, we need to have $4x$ on the RHS.
Multiplying both sides by $4$, we have $16y = 4x$.
Substituting this into our first equation, we have $3w = 16y$, or $\frac{w}{y}=\frac{16}{3}$, so our answer is $\boxed{\textbf{(E)}\ 16:3}$.

*~Binderclips1*
## Solution 4
WLOG, let $w=4$ and $x=3$.

Since the ratio of $z$ to $x$ is $1:6$, we can substitute in the value of $x$ to get $\frac{z}{3}=\frac{1}{6} \implies \frac{1}{2}$.

The ratio of $y$ to $z$ is $3:2$, so $\frac{y}{\frac{1}{2}}=\frac{3}{2} \implies \frac{3}{4}$.

The ratio of $w$ to $y$ is then $\frac{4}{\frac{3}{4}}=\frac{16}{3}$ so our answer is $\boxed{\textbf{(E)}\ 16:3}$.

*~quacker88*
## Solution 5
We have $\frac{w}{x}=\frac{4}{3}, \frac{y}{z}=\frac{3}{2}, \frac{z}{x}=\frac{1}{6}.$ Find LCD: $\frac{w}{x}=\frac{8}{6}, \frac{z}{x}=\frac{1}{6}$, we have $\frac{w}{z}=\frac{8}{1}.$ Similarly, $\frac{w}{z}=\frac{16}{2}, \frac{y}{z}=\frac{3}{2},$ so $\frac{w}{y}=\frac{16}{3},\boxed{\textbf{(E)}\ 16:3}$.

*~Yelechi*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://www.youtube.com/watch?v=QqkNnsNEgiA (for AMC 10)

https://youtu.be/Lz6XmHr8tJE (for AMC 12)

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/Gkm5rU5MlOU (for AMC 10)

https://youtu.be/WfTty8Fe5Fo (for AMC 12)


https://youtu.be/y4BbRapJepY

*~savannahsolver*

https://youtu.be/wH7xhYxwaFc

*~AlexExplains*
## See Also
