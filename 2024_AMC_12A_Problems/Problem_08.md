# 2024 AMC 12A Problem 8

## Problem
How many angles $\theta$ with $0\le\theta\le2\pi$ satisfy $\log(\sin(3\theta))+\log(\cos(2\theta))=0$?

$\textbf{(A) }0 \qquad \textbf{(B) }1 \qquad \textbf{(C) }2 \qquad \textbf{(D) }3 \qquad \textbf{(E) }4 \qquad$
## Solution 1
Note that this is equivalent to $\sin(3\theta)\cos(2\theta)=1,$ which is clearly only possible when $\sin(3\theta)=\cos(2\theta)=\pm1. ($If either one is between 1 and -1, the other one must be greater than 1 or less than -1 to offset the product, which is impossible for sine and cosine.) They cannot be both -1 since we cannot take logarithms of negative numbers, so they are both +1. Then $3\theta$ is $\dfrac\pi2$ more than a multiple of $2\pi$ and $2\theta$ is a multiple of $2\pi,$ so $\theta$ is $\dfrac\pi6$ more than a multiple of $\dfrac23\pi$ and also a multiple of $\pi.$ However, a multiple of $\dfrac23\pi$ will always have a denominator of 1 or 3, and never 6; it can thus never add with $\dfrac\pi6$ to form an integral multiple of $\pi.$ Thus, there are $\boxed{\textbf{(A) }0}$ solutions.

*~Technodoggo*
## Solution 1.1 (less words)

$$
\log(\sin(3\theta))+\log(\cos(2\theta))=0
\log(\sin(3\theta)\cos(2\theta))=0
\sin(3\theta)\cos(2\theta)=1
$$

$\text{Since } -1\le \sin(x),\cos(x)\le 1 \Rightarrow \sin(3\theta)=\cos(2\theta)= \pm1$
BUT note that $\log(-1)$ is not real

$$
\Rightarrow \sin(3\theta)=\cos(2\theta)= 1
3\theta=\frac{\pi}{2}+2\pi n; \space 2\theta=2\pi m \space (m,n \in \mathbb{Z})
\theta=\frac{\pi}{6}+\frac{2\pi n}{3}; \space \theta=\pi m
\Rightarrow \theta\text { has no solution}
$$

Giving us  \fbox{(A) 0}.

*~Minor edits by evanhliu2009*
## Solution 2
Let f($\theta)=\log(\sin(3\theta))$ and let g($\theta)=\log(\cos(2\theta)).$

Note that $-1\leq\sin(3\theta),\cos(2\theta)\leq1.$ Because the logarithm of a nonpositive number is not real, the functions f and g only exist when $\sin(3\theta)$ and $\cos(2\theta)$ are positive, respectively. Furthermore, because the logarithm of any positive real number less than 1 is negative, the only case where the function f+g could equal 0 is if f($\theta)=g(\theta)=0,$ which only occurs when their respective sine and cosine expressions are both equal to 1.

Thus, we have these two equations, where m and n are any integers:

$$
\begin{align*}
\sin(3\theta)=1 \Rightarrow 3\theta = \frac\pi2+2\pi m &\Rightarrow \theta = \frac\pi6+\frac{2\pi}3 m = \frac{4m+1}6\pi\\
\cos(2\theta)=1 \Rightarrow 2\theta = 2\pi n &\Rightarrow \theta = \pi n
\end{align*}
$$


Because m is an integer, $4m+1$ is odd, and so $\frac{4m+1}6$ is never an integer. Therefore, by the first equation, $\theta$ can never be an integer multiple of pi. Thus, because the second equation requires that $\theta$ be an integer multiple of pi, these two equations cannot both be satisfied, and so there are no solutions to the given equation.

Thus, we choose answer choice $\boxed{\textbf{(A) }0}.$
## Solution 3 (solution 1.1 with graphing)

$$
\log(\sin(3\theta))+\log(\cos(2\theta))=0
\log(\sin(3\theta))=-\log(\cos(2\theta))=\log(\sec(2\theta))
\therefore\text{let } y=\sin(3\theta)=\sec(2\theta), y > 0
$$

Sketching the graphs $y=\sin(3x)$ and $y=\sec(2x)$ for y>0, we see there are no intersections.

Thus there are $\boxed{\textbf{(A) }0}$ angles that work.

*~oofitu*
## Video Solution 1 (🚀 3 min solve 🚀)
https://youtu.be/QIilrdvsHtk

_~Education, the Study of Everything_
## See also
