# 2026 AMC 12A Problem 15

## Problem
Suppose that $\sin a = \tfrac{1}{4}$ and $\sin b = \tfrac{1}{8}$ with $0 \le b < a \le \tfrac{\pi}{2}$. What is the greatest integer less than $\log_2\bigl(\sin(a+b)\cdot\sin(a-b)\bigr)$?



$$
\textbf{(A) } -5 \qquad
\textbf{(B) } -4 \qquad
\textbf{(C) } 0 \qquad
\textbf{(D) } 1 \qquad
\textbf{(E) } 5
$$



## Solution
We begin by expanding the product inside the logarithm using the sine angle addition and subtraction formulas:


$$
\sin(a + b) = \sin a \cos b + \cos a \sin b
$$




$$
\sin(a - b) = \sin a \cos b - \cos a \sin b
$$



Applying the difference of squares identity, the product becomes:


$$
\sin(a + b)\sin(a - b) = \sin^2 a \cos^2 b - \cos^2 a \sin^2 b
$$



Using the fundamental Pythagorean identity $\cos^2 x = 1 - \sin^2 x$, we can rewrite the expression entirely in terms of sine:
\begin{align*}
\sin^2 a \cos^2 b - \cos^2 a \sin^2 b &= \sin^2 a (1 - \sin^2 b) - (1 - \sin^2 a)\sin^2 b \\
&= \sin^2 a - \sin^2 a \sin^2 b - \sin^2 b + \sin^2 a \sin^2 b \\
&= \sin^2 a - \sin^2 b
\end{align*}

Substituting the given values $\sin a = \frac{1}{4}$ and $\sin b = \frac{1}{8}$, we find:


$$
\sin^2 a = \left(\frac{1}{4}\right)^2 = \frac{1}{16}, \quad \sin^2 b = \left(\frac{1}{8}\right)^2 = \frac{1}{64}
$$



Thus, the argument of the logarithm simplifies to:


$$
\sin^2 a - \sin^2 b = \frac{1}{16} - \frac{1}{64} = \frac{4}{64} - \frac{1}{64} = \frac{3}{64}
$$



The expression $E$ is therefore:


$$
E = \log_2 \left( \frac{3}{64} \right)
$$



To find the maximum integer less than $E$ (the floor of the expression, $\lfloor E \rfloor$), we bound the fraction $\frac{3}{64}$ between two consecutive powers of $2$:


$$
\frac{2}{64} < \frac{3}{64} < \frac{4}{64}
$$



Simplifying these bounding fractions yields:


$$
\frac{1}{32} < \frac{3}{64} < \frac{1}{16}
$$



Since the base-2 logarithm $\log_2(x)$ is a strictly increasing function, we apply it across the inequality:


$$
\log_2 \left( \frac{1}{32} \right) < \log_2 \left( \frac{3}{64} \right) < \log_2 \left( \frac{1}{16} \right)
$$



Recognizing that $\frac{1}{32} = 2^{-5}$ and $\frac{1}{16} = 2^{-4}$, we have:


$$
-5 < E < -4
$$



The value of the expression lies strictly between $-5$ and $-4$. Therefore, the maximum integer less than the expression is $-5$. 

This corresponds to choice $\boxed{\text{A}}$.

NM

Note: Instead of finding the bounds like this, we can also use the property that $\log_2 (\frac{3}{64}) = \log_2 (3) - \log_2(64) = \log_2 (3) - 6$. We see that the floor of $\log_2 (3)$ is $1$, so the answer is $1-6=-5$, or $\boxed{\text{A}}$.

(And this is emotional damage, cuz at first I got $-5$ for the wrong reason, then I redid it, but this time, I accidentally added them instead of subtracting them despite writing down subtraction and put $-4$)

~ vaishnav

## Solution 2 (fakesolve)
The Maclaurin series of $\sin{x} = x - \frac{x^3}{6}...$ and $\arcsin{x} = x + \frac{x^3}{6}...$. For this problem, $\sin{x} = x$ and $\arcsin{x} = x$ suffice (explained at the end).

Therefore:


$$
\begin{align*}
a = \frac{1}{4}\\
b = \frac{1}{8}\\
\end{align*}
$$





$$
\begin{align*}
\log_2\bigl(\sin(a+b)\cdot\sin(a-b)\bigr) = \log_2(\frac{3}{8} \cdot \frac{1}{8}) = \log_2(\frac{3}{64})
\end{align*}
$$


Note that $-5 < \log_2(\frac{3}{64}) < -4$.
Given that the next term in the Maclaurin series expansion of $\sin{x}$ is negative, our estimate for $\sin(a+b)\cdot\sin(a-b)$ is too high. Given that there is only one answer that is less than -4, the answer is thus automatically $\boxed{\textbf{(A) }-5}$.

Note on why $\arcsin{x} = x$ suffices: We are at most underestimating the value of $a$ by $\frac{1}{384}$ due to the next term, and the value of $b$ by $\frac{1}{3072}$, which would not significantly change the value of the fraction.

~hi-person

## Solution 3 (Engineering)
We will assume that $\arcsin\frac{1}{4}$ is less than $15$ degrees, and we will use the infamous approximation of $\sin{x}={x}$ for small angles in our solution.

Replace the expression of $\log_2\bigl(\sin(a+b)\cdot\sin(a-b)\bigr)$ with $\log_2\bigl((\frac{1}{4}+\frac{1}{8})\cdot(\frac{1}{4}-\frac{1}{8})\bigr)$ = $\log_2\bigl(\frac{3}{64}\bigr)$

$\log_2\bigl(\frac{3}{64}\bigr)=\log_2\bigl(3\bigr)-\log_2\bigl(64\bigr)$, which is $($a number between $1$ and $2)-6$.

Thus our answer choice is $\boxed{\text{A}}$.

(Note: This is extremely similar to solution 2, except that we don't even consider the Maclaurin series and just make a bunch of assumptions)

~bread782

## Solution 4
Note that


$$
\begin{align*}
\cos(2a) &= 1 - 2\sin(a)^2 = 1 - \frac{2}{16} = \frac{7}{8}, \\
\cos(2b) &= 1 - 2\sin(b)^2 = 1 - \frac{2}{64} = \frac{31}{32}.
\end{align*}
$$


By product-to-sum,


$$
\sin(a + b)\sin(a - b) = \frac{1}{2}(\cos(2b) - \cos(2a)) = \frac{1}{2}\biggl(\frac{31}{32} - \frac{7}{8}\biggr) = \frac{3}{64}.
$$


Then,


$$
\log_2\bigl(\sin(a + b) \cdot \sin(a - b)\bigr) = \log_2\biggl(\frac{3}{64}\biggr) = \log_2(3) - \log_2(64) = \log_2(3) - 6,
$$


which lies in $(-5, -4)$ since $\log_2(3) \in (1, 2)$. Hence, the greatest integer less than $\log_2\bigl(\sin(a + b) \cdot \sin(a - b)\bigr)$ is $\boxed{\textbf{(A) }-5}$.

~Mqnic_

## Solution 5
Note that if $\sin a = \frac{1}{4}$, then $\cos a = \frac{\sqrt{15}}{4}$. Similarly, if $\sin b = \frac{1}{8}$, then $\cos b = \frac{\sqrt{63}}{8}$

The product inside the logarithm can be expanded using the sine angle addition and subtraction formulas:



$$
\sin(a + b) = \sin a \cos b + \cos a \sin b
$$




$$
\sin(a - b) = \sin a \cos b - \cos a \sin b
$$



Their product can be expressed as a difference of squares: 


$$
\sin^2 a \cos^2 b - \cos^2 a \sin^2 b
$$



Using the given values $\sin a = \frac{1}{4}$ and $\sin b = \frac{1}{8}$, as well as our previously obtained values of $\cos a = \frac{\sqrt{15}}{4}$ and $\cos b = \frac{\sqrt{63}}{8}$, we can evaluate the difference of squares:



$$
\left(\frac{1}{4}\right)^2 \cdot \left(\frac{\sqrt{63}}{8}\right)^2 - \left(\frac{\sqrt{15}}{4}\right)^2 \cdot \left(\frac{1}{8}\right)^2 = \frac{63}{1024} - \frac{15}{1024} = \frac{48}{1024} = \frac{3}{64}
$$



Our desired value is now the greatest integer less than or equal to $\log_2 \left( \frac{3}{64} \right)$. Using the quotient rule of logarithms, this expression can be simplified to $\log_2 3 - \log_2 64$, and then to $\log_2 3 - 6$ since $2^6 = 64$. 

Since $2 < 3 < 4$ and $\log_2$ is increasing, $\log_2 3 \in (1, 2)$. It follows that $(\log_2 3 - 6) \in (-5, -4)$, and the greatest integer less than or equal to this is $\boxed{\textbf{(A) }-5}$.

~sroyc

## Solution 6
Recall the identity



$$
\sin(a + b)\sin(a - b) = \sin^2 a - \sin^2 b.
$$



Thus, we must evaluate $\left\lfloor \log_2\left(\left(\tfrac{1}{4}\right)^2 - \left(\tfrac{1}{8}\right)^2\right) \right\rfloor = \left\lfloor \log_2 \tfrac{3}{64} \right\rfloor$. Since $\tfrac{1}{32} < \tfrac{3}{64} < \tfrac{1}{16}$, we have $-5 < \log_2 \tfrac{3}{64} < -4$, so the answer is $\boxed{\textbf{(A) }-5}$.

~ Aeioujyot

## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
