# 2023 AMC 12A Problem 25

## Problem
There is a unique sequence of integers $a_1, a_2, \cdotsa_{2023}$ such that
 $\tan2023x = \frac{a_1 \tan x + a_3 \tan^3 x + a_5 \tan^5 x + \cdots + a_{2023} \tan^{2023} x}{1 + a_2 \tan^2 x + a_4 \tan^4 x \cdots + a_{2022} \tan^{2022} x}$ whenever $\tan 2023$x is defined. What is $a_{2023}$?

$\textbf{(A) } -2023 \qquad\textbf{(B) } -2022 \qquad\textbf{(C) } -1 \qquad\textbf{(D) } 1 \qquad\textbf{(E) } 2023$
## Solution 1

$$
\begin{align*} \cos 2023 x + i \sin 2023 x &= (\cos x + i \sin x)^{2023}\\ &= \cos^{2023} x + \binom{2023}{1} \cos^{2022} x (i\sin x) + \binom{2023}{2} \cos^{2021} x (i \sin x)^{2} +\binom{2023}{3} \cos^{2020} x (i \sin x)^{3}\\ &+ \dots + \binom{2023}{2022} \cos x (i \sin x)^{2022} + (i \sin x)^{2023}\\ &= \cos^{2023} x + i \binom{2023}{1} \cos^{2022} x \sin x - \binom{2023}{2} \cos^{2021} x \sin^{2} x - i\binom{2023}{3} \cos^{2020} x \sin^{3} x + \dots\\ &- \binom{2023}{2022} \cos x \sin^{2022} x - i \sin^{2023} x\\ \end{align*}
$$


By equating real and imaginary parts:


$$\cos 2023 x = \cos^{2023} x - \binom{2023}{2} \cos^{2021} x \sin^{2} x + \dots - \binom{2023}{2022} \cos x \sin^{2022} x$$


$$\sin 2023 x = \binom{2023}{1} \cos^{2022} x \sin x - \binom{2023}{3} \cos^{2020} x \sin^{3} x + \dots - \sin^{2023} x$$


$$
\begin{align*} \tan2023x &= \frac{ \sin2023x }{ \cos2023x } = \frac{ \binom{2023}{1} \cos^{2022} x \sin x - \binom{2023}{3} \cos^{2020} x \sin^{3} x + \dots - \sin^{2023} x }{ \cos^{2023} x - \binom{2023}{2} \cos^{2021} x \sin^{2} x + \dots - \binom{2023}{2022} \cos x \sin^{2022} x }\\ &= \frac{ \binom{2023}{1} \frac{\cos^{2022} x \sin x}{\cos^{2023} x} - \binom{2023}{3} \frac{\cos^{2020} x \sin^{3} x}{\cos^{2023} x} + \dots - \frac{\sin^{2023} x}{\cos^{2023} x} }{ \frac{\cos^{2023} x}{\cos^{2023} x} - \binom{2023}{2} \frac{\cos^{2021} x \sin^{2} x}{\cos^{2023} x} + \dots - \binom{2023}{2022} \frac{\cos x \sin^{2022} x}{\cos^{2023} x} }\\ &= \frac{ \binom{2023}{1} \tan x - \binom{2023}{3} \tan^{3}x + \dots - \tan^{2023}x }{ 1 - \binom{2023}{2} \tan^{2}x + \dots - \binom{2023}{2022} \tan^{2022} x }\\ \end{align*}
$$


$$a_{2023} = \boxed{\textbf{(C)}-1}$$

This problem is the same as problem 7.64 in the Art of Problem Solving textbook Precalculus chapter 7 that asks to prove $\tan{nx} = \frac{\binom{n}{1}\tan{x} - \binom{n}{3}\tan^{3}{x} + \binom{n}{5}\tan^{5}{x} - \binom{n}{7}\tan^{7}{x} + \dots}{1 - \binom{n}{2}\tan^{2}{x} + \binom{n}{4}\tan^{4}{x} - \binom{n}{6}\tan^{6}{x} + \dots}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 2 (Formula of tanx)
Note that $\tan{kx} = \frac{\binom{k}{1}\tan{x} - \binom{k}{3}\tan^{3}{x} + \cdots \pm \binom{k}{k}\tan^{k}{x}}{\binom{k}{0}\tan^{0}{x} - \binom{k}{2}\tan^{2}{x} + \cdots \pm \binom{k}{k-1}\tan^{k-1}{x}},$ where k is odd and the sign of each term alternates between positive and negative. To realize this during the test, you should know the formulas of $\tan{2x}, \tan{3x},$ and $\tan{4x},$ and can notice the pattern from that. The expression given essentially matches the formula of $\tan{kx}$ exactly. $a_{2023}$ is evidently equivalent to $\pm\binom{2023}{2023},$ or 1. However, it could be positive or negative. Notice that in the numerator, whenever the exponent of the tangent term is congruent to 1 mod 4, the term is positive. Whenever the exponent of the tangent term is 3 mod 4, the term is negative. 2023, which is assigned to k, is congruent to 3 mod 4. This means that the term of $\binom{k}{k}\tan^{k}{x}$ is $\boxed{\textbf{(C) } -1}.$

Notice: If you have time and don't know $\tan{3x}$ and $\tan{4x},$ you'd have to keep deriving $\tan{kx}$ until you see the pattern.

*~lprado*
## Solution 3
For odd n, we have

$$
\begin{align*} \tan nx & = \frac{\sin nx}{\cos nx} \\ & = \frac{\frac{1}{2i} \left( e^{i n x} - e^{-i n x} \right)} {\frac{1}{2} \left( e^{i n x} + e^{-i n x} \right)} \\ & = - i \frac{e^{i n x} - e^{-i n x}}{e^{i n x} + e^{-i n x}} \\ & = - i \frac{\left( \cos x + i \sin x \right)^n - \left( \cos x - i \sin x \right)^n} {\left( \cos x + i \sin x \right)^n + \left( \cos x - i \sin x \right)^n} \\ & = \frac{ - 2 i \sum_{m=0}^{(n-1)/2} \binom{n}{2m + 1} \left( \cos x \right)^{n - 2m - 1} \left( i \sin x \right)^{2m + 1}} {2 \sum_{m=0}^{(n-1)/2} \binom{n}{2m} \left( \cos x \right)^{n - 2m} \left( i \sin x \right)^{2m}} \\ & = \frac{ \frac{1}{\left( \cos x \right)^n} \sum_{m=0}^{(n-1)/2} \binom{n}{2m + 1} \left( \cos x \right)^{n - 2m - 1} \left( i \sin x \right)^{2m + 1}} {i \frac{1}{\left( \cos x \right)^n} \sum_{m=0}^{(n-1)/2} \binom{n}{2m} \left( \cos x \right)^{n - 2m} \left( i \sin x \right)^{2m}} \\ & = \frac{ \sum_{m=0}^{(n-1)/2} \binom{n}{2m + 1} \left( i \tan x \right)^{2m + 1}} {i \sum_{m=0}^{(n-1)/2} \binom{n}{2m} \left( i \tan x \right)^{2m}} \\ & = \frac{ \sum_{m=0}^{(n-1)/2} \binom{n}{2m + 1} \left( \tan x \right)^{2m + 1} i^{2m + 1}} {\sum_{m=0}^{(n-1)/2} \binom{n}{2m} \left( \tan x \right)^{2m} i^{2m + 1}} \\ & = \frac{ \sum_{m=0}^{(n-1)/2} \binom{n}{2m + 1} \left( \tan x \right)^{2m + 1} \left( -1 \right)^m} {\sum_{m=0}^{(n-1)/2} \binom{n}{2m} \left( \tan x \right)^{2m} \left( -1 \right)^m} . \end{align*}
$$


Thus, for $n = 2023$, we have

$$
\begin{align*} a_{2023} & = \binom{2023}{2023} \left( -1 \right)^{(2023-1)/2} \\ & = \left( -1 \right)^{1011} \\ & = \boxed{\textbf{(C) -1}}. \end{align*}
$$


*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 4
We can use recursion to find a pattern for this problem. Notice that,

$$
\begin{align*} \tan x &= \tan x\\ \tan 2x &= \dfrac{\tan x + \tan x}{1 - \tan^2 x} = \dfrac{2\tan x}{1 - \tan^2 x}\\ \tan 3x &= \dfrac{\tan 2x + \tan x}{1 - \tan 2x \tan x} = \dfrac{3\tan x - \tan^3 x}{1 - 3\tan^2 x} \end{align*}
$$

The coefficient of the highest degree term seems to be always $\pm 1.$ Now, we prove this by an imcomplete  mathematical induction.

- Firstly, we suppose n is odd, and $\tannx =\dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_n\tan^n x}{a_0 + a_2\tan^2 x + \cdots + a_{n - 1}\tan^{n - 1} x},$ then


$$
\begin{align*} \tan(n + 1)x &= \dfrac{\tan nx + \tan x}{1 - \tan nx \tan x}\\ &= \dfrac{\dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_n\tan^n x}{a_0 + a_2\tan^2 x + \cdots + a_{n - 1}\tan^{n - 1} x} + \tan x}{1 - \dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_n\tan^n x}{a_0 + a_2\tan^2 x + \cdots + a_{n - 1}\tan^{n - 1} x}\tan x}\\ &= \dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_n\tan^n x + a_0\tan x + a_2\tan^3 x + \cdots + a_{n - 1}\tan^n x}{a_0 + a_2\tan^2x + \cdots + a_{n - 1}\tan^{n - 1}x - a_1\tan^2 x - a_3\tan^4 x - \cdots \boxed{-a_n\tan^{n + 1} x}} \end{align*}
$$


The coefficient of the highest degree term becomes -$a_n$.

- Secondly, we suppose n is even, and $\tannx =\dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_{n - 1}\tan^{n - 1} x}{a_0 + a_2\tan^2 x + \cdots + a_n\tan^n x},$ then

$$
\begin{align*} \tan(n + 1)x &= \dfrac{\tan nx + \tan x}{1 - \tan nx \tan x}\\ &= \dfrac{\dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_{n - 1}\tan^{n - 1} x}{a_0 + a_2\tan^2 x + \cdots + a_n\tan^n x} + \tan x}{1 - \dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_{n - 1}\tan^{n - 1} x}{a_0 + a_2\tan^2 x + \cdots + a_n\tan^n x}\tan x}\\ &= \dfrac{a_1\tan x + a_3\tan^3 x + \cdots + a_{n - 1}\tan^{n - 1} x + a_0\tan x + a_2\tan^3 x + \cdots \boxed{+ a_n\tan^{n + 1} x}}{a_0 + a_2\tan^2 x + \cdots + a_n\tan^n x - a_1\tan^2 x - a_3\tan^4 x - \cdots - a_{n - 1}\tan^n x} \end{align*}
$$

The coefficient of the highest degree term remains $a_n$.

When $n = 1, a_n = 1$. During the process of n increasing to 2023, $a_n$ changed its sign a total of 2022 $\div 2 = 1011$ times.

Hence, $a_{2023} = 1 \times (-1)^{1011} = \boxed{\textbf{(C)}-1}$

~[https://artofproblemsolving.com/wiki/index.php/User:Reda_mandymath reda_mandymath]
## Solution 5 (2 minutes, easy)
Notice that $\tan 2x = \dfrac{2 \tan x}{1 - \tan^2 x},$ and $\tan 3x = \dfrac{3 \tan x - \tan^3 x}{1-3 \tan^2 x}$
Since this is the AMC, conjecture that some pattern is to be found within the last term of the expansion of $\tan$ nx.
Guess that the sign of the last term alternates between + and -. Indeed, for odd coefficients the last term has a negative sign, so choose $\boxed{\textbf{(C)}-1}$

*~pixelpyguy*
## Video Solution 1 by OmegaLearn
https://youtu.be/4KJR_1Kg4A4
## Video Solution
https://youtu.be/0KH554CLayE

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
