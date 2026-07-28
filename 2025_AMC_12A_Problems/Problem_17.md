# 2025 AMC 12A Problem 17

## Problem
The polynomial $(z+i)(z+2i)(z+3i)+10$ has three roots in the complex plane, where $i=\sqrt{-1}$. What is the area of the triangle formed by these three roots?

$\textbf{(A)}~6 \qquad \textbf{(B)}~8 \qquad \textbf{(C)}~10 \qquad \textbf{(D)}~12 \qquad \textbf{(E)}~14$
## Solution 1
Set $w=z+2i$. Then

$$
(z+i)(z+2i)(z+3i)+10=(w-i)w(w+i)+10=w^3+w+10.
$$

Since

$$
w^3+w+10=(w+2)(w^2-2w+5),
$$

the roots in the $w$-plane are $-2$, $1+2i$, and $1-2i$. Translating back by $z=w-2i$ gives the roots

$$
-2-2i,\qquad 1,\qquad 1-4i.
$$

Their coordinates are $(-2,-2)$, $(1,0)$, and $(1,-4)$. The last two points form a vertical side of length $4$, and its distance from $(-2,-2)$ is $3$. Thus the triangle has area

$$
\frac12\cdot4\cdot3=\boxed{\textbf{(A)}\ 6}.
$$
## Solution 2 (bash)
Expanding gives

$$
z^3+6iz^2-11z-6i+10=(z-1)\bigl(z^2+(1+6i)z-10+6i\bigr).
$$

The quadratic discriminant is $5-12i=(3-2i)^2$, so its roots are $1-4i$ and $-2-2i$. Together with $z=1$, these give the same points as above: $(1,0)$, $(1,-4)$, and $(-2,-2)$. Their area is $\boxed{\textbf{(A)}\ 6}$.
## Solution 3 (Shoelace Theorem)
The roots are $-2-2i$, $1$, and $1-4i$, corresponding to $(-2,-2)$, $(1,0)$, and $(1,-4)$. By the shoelace formula,

$$
\frac12\left|(-2)(0-(-4))+1((-4)-(-2))+1((-2)-0)\right|=6.
$$

Thus the answer is $\boxed{\textbf{(A)}\ 6}$.
## Video Solution 1 by OmegaLearn.org
https://youtu.be/WIkOFDf3Fr4
## Video Solution 2 by StressedPineapple
https://youtube.com/watch?v=NWBPm3lThH4&t=127s
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
