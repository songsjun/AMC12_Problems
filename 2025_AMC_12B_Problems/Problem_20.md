# 2025 AMC 12B Problem 20

> This problem is the same as [2025 AMC 10B #24](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10B_Problems/Problem_24) and [2025 AMC 12B #20](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12B_Problems/Problem_20).
## Problem
A frog hops along the number line according to the following rules:

- It starts at 0.

- If it is at 0, then it moves to 1 with probability $\frac 12$ and disappears with probability $\frac 12.$

- For $n=1$,2,3, if it is at n, then it moves to $n+1$ with probability $\frac 14,$ to $n-1$ with probability $\frac 14,$ and disappears with probability $\frac 12.$

What is the probability that the frog reaches 4?

$\textbf{(A) } \frac1{101} \qquad \textbf{(B) } \frac 1{100} \qquad \textbf{(C) } \frac1{99} \qquad \textbf{(D) } \frac1{98} \qquad \textbf{(E) } \frac1{97}$
## Solution 1
We will solve this using states. Let $P_n$ be the probability of reaching 4, given that you start from n. We want to find $P_0$. Of course, $P_4 = 1$. We also know that

$$
P_3 = \frac{1}{4}P_4 + \frac{1}{4}P_2
P_2 = \frac{1}{4}P_3 + \frac{1}{4}P_1
P_1 = \frac{1}{4}P_2 + \frac{1}{4}P_0
P_0 = \frac{1}{2}P_1.
$$

Solving the system, we find that $P_1=\frac{2}{97}$ and $P_0=\boxed{\frac{1}{97}}.$

*~lprado*
## Solution 2
Let p(n) be the probability of reaching the end once we have reached lilypad n. These probabilities satisfy a finite difference equation

$$p(n+1) - 4p(n) + p(n-1) = 0$$

with boundary conditions


$$
\begin{align*} 2p_0 &= p_1&\text{(fixed derivative/Neumann)}\\ p_4 &= 1&\text{(fixed constant/Dirichlet).} \end{align*}
$$


The difference equation's characteristic polynomial

$$\lambda^2 - 4r + 1$$

has roots

$$2\pm \sqrt 3$$

so the probabilities equal

$$p(n) = A\left(2+\sqrt 3\right)^2 + B\left(2-\sqrt 3\right)^2$$

for some coefficients A and B. Plugging this into the boundary conditions gives


$$
\begin{align*} 2(A + B) = A\left(2 + \sqrt3\right) + B\left(2 - \sqrt3\right)&\iff A=B\\ A\left(97+56\sqrt3\right) + B\left(97 - 56\sqrt3\right)=1&\iff 97(A+B) + \cancel{56(A-B)\sqrt3} = 1. \end{align*}
$$


Thus,

$$p(0) = A+B = \boxed{\textbf{(E)}\quad\frac{1}{97}}.$$
## Solution 3
Let $P_n$ be the probability that the frog eventually reaches position n, given that it is at position $n-1$.

From position 1, the frog moves to 2 with probability $\frac{1}{2},$ or disappears with probability $\frac{1}{2}.$ Hence
$$P_1 = \frac{1}{2}.$$

From position 2, the frog moves to 3 with probability $\frac{1}{4},$ back to 1 with probability $\frac{1}{4},$ or disappears with probability $\frac{1}{2}.$ Using $P_1=\frac{1}{2},$ we have

$$P_2 = \frac{1}{4} + \frac{1}{4} \cdot \frac{1}{2} P_2 = \frac{1}{4} + \frac{1}{8} P_2 \implies \frac{7}{8} P_2 = \frac{1}{4} \implies P_2 = \frac{2}{7}.$$


From position 3, similarly,

$$P_3 = \frac{1}{4} + \frac{1}{4} \cdot \frac{2}{7} P_3 = \frac{1}{4} + \frac{1}{14} P_3 \implies \frac{13}{14} P_3 = \frac{1}{4} \implies P_3 = \frac{7}{26}.$$


From position 4,

$$P_4 = \frac{1}{4} + \frac{1}{4} \cdot \frac{7}{26} P_4 \implies \frac{97}{104} P_4 = \frac{1}{4} \implies P_4 = \frac{26}{97}.$$


Finally, multiplying the probabilities along the path from 1 to 4 (including the initial step from 0 to 1): $\frac{1}{2} \cdot \frac{2}{7} \cdot \frac{7}{26} \cdot \frac{26}{97} = \boxed{ \textbf{(E) } \frac1{97} }$
*~MathKing555*
## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=e6Yyk8C_TQc ~ Pi Academy
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=KYmc2m_WcP8
## Video Solution 2 by OmegaLearn.org
https://youtu.be/wBBlErp40Xc
## Video Solution 3 (Fast and Easy)
https://www.youtube.com/watch?v=xh3-R0Q_7Gg
*~Pi Academy*
## See Also
