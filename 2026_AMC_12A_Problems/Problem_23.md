# 2026 AMC 12A Problem 23

## Problem
There is a unique real number $x$ between $0$ and $1$ such that $x^3 + x^2 = 1.$ For that $x,$ there exist unique integers $a, b,$ and $c$ such that the infinite product


$$
(x +1)(x^2 +1)(x^4 +1)(x^8 +1)(x^{16} +1)\dots
$$

equals $ax^2 + bx +c.$ What is $a+b+c$?

$\textbf{(A) } 2\qquad\textbf{(B) } 3\qquad\textbf{(C) } 4\qquad\textbf{(D) } 5\qquad\textbf{(E) } 6$

## Solution
The infinite product can be represented as


$$
\lim_{n\to\infty}\prod_{k=0}^n (1+x^{2^k})
$$

When we multiply the expression by $(1-x)$, the entire expression telescopes, yielding


$$
\lim_{n\to\infty}\frac{1-x^{2^{n+1}}}{1-x}
$$

which goes to $\frac{1}{1-x}$ as $n\to\infty$.

Finally, we equate to get $1=(1-x)(ax^2+bx+c)$. Expanding yields


$$
ax^3+x^2(b-a)+x(c-b)+(1-c)=0
$$

We can now guess values for $a$. Coincidentally, $a=1$ works, yielding $b=2$ and $c=2$. Hence the answer is $1+2+2=5$, or $\boxed{\textbf{(D)}}$.

~ [eevee9406](https://artofproblemsolving.com/wiki/index.php/User:Eevee9406)
## Solution 1.5
As in solution 1, we get $ax^3+x^2(b-a)+x(c-b)=c-1$. Instead of guessing, we can match this equation to $x^3+x^2=1$ by ensuring the coefficients are the same. So, we get $a=1$, $b-a=1$, $c-b=0$, and $c-1=1$. Thus, $a=1$, $b=2$, and $c=2$, so the answer is $1+2+2=5$, or $\boxed{\textbf{(D)}}$.

Technically you can’t do this because it is not an identity, but because x is irrational, you can kind of get away with it- this is still mathematically wrong. Solution 2 is a more complete way.
- Skip_God (not my solution)

~ vaishnav

## Solution 2
Continuing as in Solution 1 and getting the polynomial


$$
ax^3 + (b-a)x^2 + (c-b)x + (1-c),
$$


we add and subtract $ax^2$ to obtain


$$
\begin{align*}
ax^3 + ax^2 - ax^2 + (b-a)x^2 + (c-b)x + (1-c) &= a(x^3 + x^2) + (b-2a)x^2 + (c-b)x + (1-c) \\
&= (b-2a)x^2 + (c-b)x + (1+a-c).
\end{align*}
$$


We assume that $x$ and $x^2$ are both irrational, so the only way for this polynomial to equal $0$ is for each of the coefficients and the constant term to be $0$. This sets up the system of equations



$$
\begin{align*}
b-2a &= 0\\
c-b &= 0\\
1+a-c &= 0,
\end{align*}
$$


whence $a=1$, $b=2$, and $c=2$, so $a + b + c = \boxed{\textbf{(D) }5}$

~ Blosp

Note: No need to assume that $x^2$ and $x$ are both irrational; we can prove it by using the handy Rational Root Theorem. It states that since the polynomial $x^3+x^2-1=0$ has all rational coefficients, any rational root (of the form $\frac p q$) of the polynomial must have $p | (-1)$ (-1 is from the last term of the polynomial) and $q | 1$ (1 is from the leading coefficient of the polynomial). We try out the only roots that satisfy these conditions, $\pm1$, and they don't work. Therefore, $x$ and $x^2$ are both irrational.
~ WhatDoHumanitariansEat

## Solution 3
We rewrite the given equation $x^3 + x^2 = 1$ into these two equations:


$$
\begin{align} 
x^n + x^{n-1} = x^{n-3} \implies x^n = x^{n-3} - x^{n-1}, n \in \mathbb{R} \\
x^{m+1} + x^m = x^{m-2} \implies x^m = x^{m-2} - x^{m+1}, m \in \mathbb{R}
\end{align}
$$


Note that the infinite product can be written as $\sum_{n=0}^\infty x^n = 1 + x + x^2 + x^3 + x^4 + x^5...$

If we replace every $x^{4k}$ term with $x^{4k-2}-x^{4k+1}, k \in \mathbb{R}$ (equation 1) and

we replace every $x^{4k+2}$ term with $x^{4k} - x^{4k+3}, k \in \mathbb{R}$ (equation 2),

every section of



$$
\begin{align*} \\
x^{4k}+x^{4k+1}+x^{4k+2}+x^{4k+3} \\
= x^{4k-2} - x^{4k+1} + x^{4k+1} + x^{4k} - x^{4k+3} + x^{4k+3} \\
= x^{4k-2} + x^{4k} \\
\end{align*}
$$



therefore:



$$
\begin{align*}\\
\sum_{n=0}^\infty x^n = 1 + x + \sum_{m=0}^\infty x^{2m}\\
\end{align*}
$$



Let:


$$
\begin{align*}\\
u = \sum_{m=0}^\infty x^{2m}\\
\end{align*}
$$



So:


$$
\begin{align*}\\
\sum_{n=0}^\infty x^n = \sum_{n=0}^\infty x^{2n} + \sum_{n=0}^\infty x^{2n+1} = \sum_{n=0}^\infty x^{2n} + x \sum_{n=0}^\infty x^{2n} = u + ux\\
\end{align*}
$$



And now solving for $u$:


$$
\begin{align*}\\
u + ux = 1 + x + u \implies ux = 1+x \implies u = \frac{1}{x} + 1\\
\end{align*}
$$



Therefore:


$$
\begin{align*}\\
u + ux = \frac{1}{x} + 1 + (x)(\frac{1}{x} + 1) = \frac{1}{x} + 1 + 1 + x\\
\end{align*}
$$



Because $1 = x^3 + x^2$, $\frac{1}{x} = x^2 + x$

Therefore:


$$
\begin{align*}\\
\frac{1}{x} + 1 + 1 + x = x^2 + x + 2 + x = x^2 + 2x + 2\\
\end{align*}
$$



And $1 + 2 + 2 = \boxed{\textbf{(D) }5}$

~hi-person

## Solution 4
Note that the provided product


$$
(x + 1)(x^2 + 1)(x^4 + 1)(x^8 + 1)(x^{16} + 1)\dotsm
$$


expands as a formal power series


$$
1 + x + x^2 + x^3 + x^4 + x^5 + \dotsb,
$$


which converges to ${\frac{1}{1 - x}}$ for the given $x \in (0, 1)$. We wish to find a polynomial $ax^2 + bx + c$ such that $(1 - x)(ax^2 + bx + c) = 1$.

Recall we are given $x^3 + x^2 = 1$, which can be rearranged as


$$
x^3 = 1 - x^2 = (1 - x)(1 + x), \qquad \text{and} \qquad x^2 = 1 - x^3 = (1 - x)(1 + x + x^2).
$$


Adding,


$$
x^3 + x^2 = (1 - x)((1 + x) + (1 + x + x^2)) = (1 - x)(2 + 2x + x^2),
$$


which is $1$ since $x^3 + x^2 = 1$.

We are done, having found $a = 1$, $b = 2$, $c = 2$, so $a + b + c = \boxed{\textbf{(D) }5}$.

~Mqnic_

## Solution 5
As Solution 4 showed, 


$$
(x + 1)(x^2 + 1)(x^4 + 1)(x^8 + 1)(x^{16} + 1)\dotsm
$$


is rearranged as 


$$
1 + x + x^2 + x^3 + x^4 + x^5 + \dotsb,
$$


and it is converged to $\frac{1}{1 - x}$.

Using the relation $x^3 + x^2 = 1$, we can express:


$$
\frac{x^3 + x^2}{1-x} = \frac{1}{1-x}
$$



By performing polynomial long division on $\frac{x^3+x^2}{1-x}$:


$$
\frac{x^3+x^2}{-(x-1)} = -x^2 - 2x - 2 + \frac{2}{1-x}
$$



Equating this to $\frac{1}{1-x}$:


$$
\frac{1}{1-x} = -x^2 - 2x - 2 + \frac{2}{1-x}
$$



Rearranging the terms yields:


$$
\frac{1}{1-x} = x^2 + 2x + 2
$$



Thus, $(x + 1)(x^2 + 1)(x^4 + 1)(x^8 + 1)(x^{16} + 1)\dotsm$ equals $x^2 + 2x + 2$.

And $1 + 2 + 2 = \boxed{\textbf{(D) }5}$.

~harry3973

## Solution 6
As used in Solutions 4 and 5, we can set $S$ as the sum of our infinite series


$$
S = 1 + x + x^2 + x^3 + x^4 + x^5 + \dotsb
$$


Using the relation we are given, we can extrapolate the following infinite list of equations:


$$
x^3 + x^2 = 1
$$




$$
x^4 + x^3 = x
$$




$$
x^5 + x^4 = x^2
$$




$$
\vdots
$$


Summing them, we get


$$
x^2 + 2(x^3 + x^4 + x^5 + \dotsm) = 1 + x + x^2 + \dotsm
$$

 
which can be rearranged and substituted to get


$$
x^3 + x^4 + x^5 + \dotsm =  \dfrac{S - x^2}{2}
$$


Our original series can now be written as 


$$
S = 1 + x + x^2 + \dfrac{S - x^2}{2}
$$


Solving for $S$ gives us 


$$
S = x^2 + 2x + 2
$$


And $1 + 2 + 2 = \boxed{\textbf{(D) }5}$

~ paalu

## Solution 7
As shown in solution 4,


$$
(x + 1)(x^2 + 1)(x^4 + 1)\dotsm
$$


converges to ${\frac{1}{1 - x}}$

$x^3 + x^2 = 1$ can be rearranged as 

$$
x^3 = 1 - x^2
$$

 which can be factored as 

$$
x^3 = (1 - x)(1 + x)
$$

 and rearranged as 

$$
1 - x = \frac{x^3}{1+x}
$$


Substituting $1 - x$ in the denominator with $\frac{x^3}{1+x}$ yields 

$$
\frac{1 + x}{x^3} = ax^2 + bx + c
$$


Since $1 = x^3 + x^2$, 

$$
1 + x = (1 + x)(x^3 + x^2) = x^4 + 2x^3 + x^2(x^3 + x^2) = x^5 + 2x^4 + 2x^3
$$



Dividing by $x^3$ yields 

$$
x^2 + 2x + 2
$$

 And $1 + 2 + 2 = \boxed{\textbf{(D) }5}$

~ heliopolis
